import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('pages_previews', Path(__file__).with_name('pages-previews.py'))
pages = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pages)


def archive(entries):
    output = io.BytesIO()
    with zipfile.ZipFile(output, 'w') as z:
        for name, value in entries.items():
            z.writestr(name, value)
    return output.getvalue()


class PreviewTests(unittest.TestCase):
    def test_extracts_valid_preview_and_checks_identity(self):
        manifest = {'number': 12, 'sha': 'a' * 40, 'pages': [{'route': '/docs/a', 'title': 'A'}]}
        data = archive({'preview-manifest.json': json.dumps(manifest), 'index.html': 'ok', 'docs/a/index.html': 'A'})
        with tempfile.TemporaryDirectory() as tmp:
            self.assertEqual(pages.extract_preview(data, Path(tmp), 12, 'a' * 40), manifest)
            self.assertEqual((Path(tmp) / 'docs/a/index.html').read_text(), 'A')
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(ValueError):
                pages.extract_preview(data, Path(tmp), 13, 'a' * 40)

    def test_rejects_paths_symlinks_and_oversize_archives_before_writing(self):
        for filename in ['../escape', '/absolute', 'x/../../escape', r'x\..\escape']:
            with self.subTest(filename=filename), tempfile.TemporaryDirectory() as tmp:
                with self.assertRaises(ValueError):
                    pages.extract_preview(archive({filename: 'bad'}), Path(tmp), 12, 'a' * 40)
                self.assertEqual(list(Path(tmp).iterdir()), [])
        output = io.BytesIO()
        with zipfile.ZipFile(output, 'w') as z:
            info = zipfile.ZipInfo('link')
            info.external_attr = (0o120777 << 16)
            z.writestr(info, '../outside')
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(ValueError):
                pages.extract_preview(output.getvalue(), Path(tmp), 12, 'a' * 40)
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(ValueError):
                pages.extract_preview(archive({'big': 'x' * 20}), Path(tmp), 12, 'a' * 40, max_bytes=10)

    def test_only_current_same_repository_successful_pr_runs_qualify(self):
        pr = {'number': 12, 'head': {'sha': 'a' * 40, 'repo': {'full_name': 'org/docs'}}}
        run = {'event': 'pull_request', 'status': 'completed', 'conclusion': 'success',
               'head_sha': 'a' * 40, 'head_repository': {'full_name': 'org/docs'},
               'pull_requests': [{'number': 12}]}
        self.assertTrue(pages.eligible_run(run, pr, 'org/docs'))
        for field, value in [('head_sha', 'b' * 40), ('event', 'push'), ('conclusion', 'failure'),
                             ('head_repository', {'full_name': 'fork/docs'}), ('pull_requests', [{'number': 99}])]:
            with self.subTest(field=field):
                self.assertFalse(pages.eligible_run({**run, field: value}, pr, 'org/docs'))

    def test_comment_escapes_titles_and_identifies_commit(self):
        body = pages.comment_body({'number': 12, 'sha': 'a' * 40,
                                  'pages': [{'route': '/docs/a', 'title': '[bad](https://evil.test) <img>'}]},
                                  'https://docs.robotis.com')
        self.assertIn('https://docs.robotis.com/pr-preview/12/docs/a', body)
        self.assertIn('a' * 40, body)
        self.assertNotIn('[bad](https://evil.test)', body)
        self.assertNotIn('<img>', body)


class CoordinatorTests(unittest.TestCase):
    def test_collect_preserves_production_and_prunes_stale_previews(self):
        from unittest.mock import patch
        pr = {'number': 12, 'head': {'sha': 'a' * 40, 'repo': {'full_name': 'org/docs'}}}
        run = {'id': 10, 'event': 'pull_request', 'status': 'completed', 'conclusion': 'success',
               'head_sha': 'a' * 40, 'head_repository': {'full_name': 'org/docs'}, 'pull_requests': [{'number': 12}]}
        manifest = {'number': 12, 'sha': 'a' * 40, 'pages': []}
        payload = archive({'preview-manifest.json': json.dumps(manifest), 'index.html': 'PR index'})
        def fake_api(endpoint, **kwargs):
            if '/pulls?' in endpoint:
                return [pr]
            if '/runs?' in endpoint:
                return {'workflow_runs': [run]}
            if endpoint.endswith('/zip'):
                return payload
            if '/artifacts?' in endpoint:
                return {'artifacts': [{'id': 20, 'name': 'pr-preview-12', 'expired': False, 'size_in_bytes': len(payload)}]}
            raise AssertionError(endpoint)
        with tempfile.TemporaryDirectory() as tmp, patch.dict('os.environ', {'GITHUB_REPOSITORY': 'org/docs'}), patch.object(pages, 'api', fake_api):
            build = Path(tmp) / 'build'
            (build / 'pr-preview/99').mkdir(parents=True)
            (build / 'index.html').write_text('Production')
            (build / 'pr-preview/99/index.html').write_text('Closed PR')
            status = Path(tmp) / 'status.json'
            pages.collect(build, status)
            self.assertEqual((build / 'index.html').read_text(), 'Production')
            self.assertFalse((build / 'pr-preview/99').exists())
            self.assertEqual((build / 'pr-preview/12/index.html').read_text(), 'PR index')
            self.assertEqual(json.loads(status.read_text())[0]['manifest'], manifest)
            run['head_sha'] = 'b' * 40
            pages.collect(build, status)
            self.assertFalse((build / 'pr-preview/12').exists())
            self.assertNotIn('manifest', json.loads(status.read_text())[0])

    def test_updates_existing_bot_comment_and_skips_newer_heads(self):
        from unittest.mock import patch
        manifest = {'number': 12, 'sha': 'a' * 40, 'pages': []}
        current_sha = 'a' * 40
        writes = []
        def fake_api(endpoint, method='GET', data=None, **kwargs):
            if method == 'PATCH':
                writes.append((endpoint, data['body']))
                return {}
            if endpoint.endswith('/pulls/12'):
                return {'state': 'open', 'head': {'sha': current_sha}}
            if '/comments?' in endpoint:
                return [{'id': 99, 'user': {'login': 'github-actions[bot]'}, 'body': pages.MARKER + '\nold'}]
            raise AssertionError(endpoint)
        with tempfile.TemporaryDirectory() as tmp:
            status = Path(tmp) / 'status.json'
            status.write_text(json.dumps([{'number': 12, 'sha': 'a' * 40, 'manifest': manifest}]))
            event = Path(tmp) / 'event.json'
            event.write_text('{}')
            with patch.dict('os.environ', {'GITHUB_REPOSITORY': 'org/docs', 'GITHUB_EVENT_PATH': str(event)}), patch.object(pages, 'api', fake_api):
                pages.update_comments(status)
                self.assertEqual(len(writes), 1)
                self.assertTrue(writes[0][0].endswith('/issues/comments/99'))
                self.assertIn('/pr-preview/12/changes.html', writes[0][1])
                current_sha = 'b' * 40
                pages.update_comments(status)
                self.assertEqual(len(writes), 1)


class StatusTests(unittest.TestCase):
    def test_reports_progress_on_pr_head_and_links_to_deployment_run(self):
        from unittest.mock import patch
        event = {'workflow_run': {'event': 'pull_request', 'head_sha': 'a' * 40,
                 'head_repository': {'full_name': 'org/docs'}, 'pull_requests': [{'number': 12}]}}
        calls = []
        def fake_api(endpoint, method='GET', data=None, **kwargs):
            if method == 'GET':
                return {'state': 'open', 'head': {'sha': 'a' * 40, 'repo': {'full_name': 'org/docs'}}}
            calls.append((endpoint, data))
            return {}
        with tempfile.TemporaryDirectory() as tmp:
            event_file = Path(tmp) / 'event.json'
            event_file.write_text(json.dumps(event))
            env = {'GITHUB_EVENT_PATH': str(event_file), 'GITHUB_REPOSITORY': 'org/docs',
                   'GITHUB_SERVER_URL': 'https://github.com', 'GITHUB_RUN_ID': '42'}
            with patch.dict('os.environ', env), patch.object(pages, 'api', fake_api):
                pages.update_status('pending', 'Building production site')
                self.assertEqual(calls[0][0], 'repos/org/docs/statuses/' + 'a' * 40)
                self.assertEqual(calls[0][1]['state'], 'pending')
                self.assertEqual(calls[0][1]['target_url'], 'https://github.com/org/docs/actions/runs/42')
                self.assertEqual(calls[0][1]['context'], 'PR preview / Pages')
                pages.update_status('failure', 'Deployment failed')
                self.assertEqual(calls[-1][1]['state'], 'failure')
                event['workflow_run']['head_repository']['full_name'] = 'fork/docs'
                event_file.write_text(json.dumps(event))
                pages.update_status('success', 'Done')
                self.assertEqual(len(calls), 2)

    def test_unpublished_preview_cannot_report_success(self):
        from unittest.mock import patch
        event = {'workflow_run': {'event': 'pull_request', 'head_sha': 'a' * 40,
                 'head_repository': {'full_name': 'org/docs'}, 'pull_requests': [{'number': 12}]}}
        calls = []
        def fake_api(endpoint, method='GET', data=None, **kwargs):
            if method == 'GET':
                return {'state': 'open', 'head': {'sha': 'a' * 40, 'repo': {'full_name': 'org/docs'}}}
            calls.append(data)
            return {}
        with tempfile.TemporaryDirectory() as tmp:
            event_file = Path(tmp) / 'event.json'
            event_file.write_text(json.dumps(event))
            status = Path(tmp) / 'status.json'
            status.write_text(json.dumps([{'number': 12, 'sha': 'a' * 40, 'reason': 'Missing artifact'}]))
            with patch.dict('os.environ', {'GITHUB_EVENT_PATH': str(event_file), 'GITHUB_REPOSITORY': 'org/docs'}), patch.object(pages, 'api', fake_api):
                pages.update_status('success', 'Published', status)
            self.assertEqual(calls[0]['state'], 'failure')


if __name__ == '__main__':
    unittest.main()
