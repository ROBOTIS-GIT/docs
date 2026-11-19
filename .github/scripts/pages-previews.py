#!/usr/bin/env python3
"""Combine untrusted static preview artifacts; never execute their contents."""
import html
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import subprocess
import sys
import time
from urllib.parse import quote, unquote
from urllib.request import Request, urlopen
import zipfile

MARKER = '<!-- robotis-docs-pr-preview -->'
PREVIEW_LIMIT = 400 * 1024 * 1024
TOTAL_PREVIEW_LIMIT = 500 * 1024 * 1024


def api(endpoint, method='GET', data=None, binary=False):
    command = ['gh', 'api', endpoint, '--method', method]
    if data is not None:
        command += ['--input', '-']
    result = subprocess.run(command, input=json.dumps(data).encode() if data is not None else None,
                            stdout=subprocess.PIPE, check=True)
    return result.stdout if binary else json.loads(result.stdout or b'null')


def paginate(endpoint, key=None):
    separator = '&' if '?' in endpoint else '?'
    for page in range(1, 101):
        response = api(f'{endpoint}{separator}per_page=100&page={page}')
        entries = response[key] if key else response
        yield from entries
        if len(entries) < 100:
            return
    raise ValueError('Pagination limit reached; refusing an incomplete snapshot')


def eligible_run(run, pr, repository):
    return (pr['head'].get('repo', {}).get('full_name') == repository
            and run.get('head_repository', {}).get('full_name') == repository
            and run.get('event') == 'pull_request' and run.get('status') == 'completed'
            and run.get('conclusion') == 'success' and run.get('head_sha') == pr['head']['sha']
            and any(p['number'] == pr['number'] for p in run.get('pull_requests', [])))


def safe_route(route):
    return (isinstance(route, str) and route.startswith('/') and not route.startswith('//')
            and not re.search(r'[\x00-\x20\\?#<>"\']', route)
            and '..' not in unquote(route).split('/') and '\\' not in unquote(route))


def extract_preview(data, destination, number, sha, max_bytes=PREVIEW_LIMIT):
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        entries = archive.infolist()
        if len(entries) > 50000 or sum(e.file_size for e in entries) > max_bytes:
            raise ValueError('Preview archive is too large')
        names = set()
        for entry in entries:
            name = entry.filename
            parts = PurePosixPath(name).parts
            if (not name or name.startswith('/') or '\\' in name or '..' in parts
                    or any(ord(c) < 32 for c in name) or name in names
                    or stat.S_ISLNK(entry.external_attr >> 16)
                    or (entry.external_attr >> 16 and stat.S_IFMT(entry.external_attr >> 16)
                        not in (0, stat.S_IFREG, stat.S_IFDIR))):
                raise ValueError(f'Unsafe archive entry: {name!r}')
            names.add(name)
        if 'preview-manifest.json' not in names or 'index.html' not in names:
            raise ValueError('Missing preview index or manifest')
        if archive.getinfo('preview-manifest.json').file_size > 2 * 1024 * 1024:
            raise ValueError('Oversized preview manifest')
        manifest = json.loads(archive.read('preview-manifest.json'))
        if manifest.get('number') != number or manifest.get('sha') != sha or not re.fullmatch('[a-f0-9]{40}', sha):
            raise ValueError('Preview identity does not match its workflow run')
        pages = manifest.get('pages')
        if not isinstance(pages, list) or len(pages) > 5000:
            raise ValueError('Invalid preview pages')
        for page in pages:
            if not isinstance(page, dict) or not safe_route(page.get('route')) or not isinstance(page.get('title'), str):
                raise ValueError('Invalid preview page')
            relative = unquote(page['route']).strip('/')
            candidates = {f'{relative}/index.html', f'{relative}.html'} if relative else {'index.html'}
            if not candidates.intersection(names):
                raise ValueError('Preview page has no rendered HTML')
        # All validation precedes writes. Destination is a new PR-specific directory.
        destination.mkdir(parents=True, exist_ok=True)
        for entry in entries:
            target = destination / entry.filename
            if entry.is_dir():
                target.mkdir(parents=True, exist_ok=True)
            else:
                target.parent.mkdir(parents=True, exist_ok=True)
                with archive.open(entry) as source, target.open('wb') as output:
                    shutil.copyfileobj(source, output)
        return manifest


def comment_body(manifest, origin):
    number, sha = manifest['number'], manifest['sha']
    prefix = f'{origin}/pr-preview/{number}'
    lines = [MARKER, f'### Documentation preview · PR #{number}', '',
             f'Preview commit: `{sha}`', '', f'[View all changed pages]({prefix}/changes.html)', '']
    for page in manifest['pages'][:80]:
        title = re.sub(r'([\\`*{}\[\]()#+!|_])', r'\\\1', html.escape(page['title'])).replace('\n', ' ')[:200]
        route = quote(page['route'], safe='/%-._~')
        lines.append(f'- [{title}]({prefix}{route})')
    if len(manifest['pages']) > 80:
        lines.append(f'\nView the remaining {len(manifest["pages"]) - 80} pages using the link above.')
    if not manifest['pages']:
        lines.append('There are no documentation pages to preview for this change.')
    lines += ['', 'Only affected pages and required assets are published. Other links open the production documentation.',
              'This preview will be removed on the next deployment after the PR closes or its build artifact expires.']
    return '\n'.join(lines)


def share_preview_media(build, destination):
    manifest = build / 'shared-media.json'
    if not manifest.exists():
        return
    shared = set(json.loads(manifest.read_text()))
    def rewrite(match):
        value = match.group(0)
        return value[3:] if unquote(value[4:]) in shared else value
    for file in destination.rglob('*'):
        if file.suffix not in ('.html', '.css', '.js'):
            continue
        before = file.read_text()
        after = re.sub(r"/ko/[^\s\"'`\\<>()[\]{}?#,;]+", rewrite, before)
        if file.suffix == '.html':
            after = after.replace('<head>', '<head><script src="/shared-media-runtime.js"></script>', 1)
        if after != before:
            file.write_text(after)


def collect(build, status_file):
    repository = os.environ['GITHUB_REPOSITORY']
    root = f'repos/{repository}'
    previews = build / 'pr-preview'
    shutil.rmtree(previews, ignore_errors=True)
    statuses = []
    total = 0
    for pr in paginate(f'{root}/pulls?state=open&base=main'):
        number = pr['number']
        state = {'number': number, 'sha': pr['head']['sha'], 'reason': 'No preview build is available for the current commit, or its artifact has expired.'}
        if not pr['head'].get('repo') or pr['head']['repo']['full_name'] != repository:
            state['reason'] = 'Fork PR previews are not automatically published on the production domain.'
            statuses.append(state)
            continue
        runs = paginate(f'{root}/actions/workflows/ci.yml/runs?event=pull_request&status=success&head_sha={pr["head"]["sha"]}', 'workflow_runs')
        for run in runs:
            if not eligible_run(run, pr, repository):
                continue
            artifacts = list(paginate(f'{root}/actions/runs/{run["id"]}/artifacts', 'artifacts'))
            artifact = next((a for a in artifacts if a['name'] == f'pr-preview-{number}' and not a['expired']), None)
            if artifact is None:
                continue
            if artifact['size_in_bytes'] > PREVIEW_LIMIT:
                state['reason'] = 'The preview artifact exceeds the 400 MiB limit.'
                break
            data = api(f'{root}/actions/artifacts/{artifact["id"]}/zip', binary=True)
            destination = previews / str(number)
            try:
                manifest = extract_preview(data, destination, number, pr['head']['sha'])
                share_preview_media(build, destination)
                size = sum(p.stat().st_size for p in destination.rglob('*') if p.is_file())
                if total + size > TOTAL_PREVIEW_LIMIT:
                    raise ValueError('Combined previews exceed 500 MiB')
                total += size
                state['manifest'] = manifest
            except (ValueError, KeyError, TypeError, zipfile.BadZipFile) as error:
                shutil.rmtree(destination, ignore_errors=True)
                state['reason'] = 'Preview validation or size checks failed. See the Actions logs for details.'
                print(f'::warning::PR #{number}: {error}')
            break
        statuses.append(state)
    size = sum(p.stat().st_size for p in build.rglob('*') if p.is_file())
    print(f'Pages payload: {size / 1024**2:.1f} MiB; previews: {total / 1024**2:.1f} MiB')
    if size > 1024**3:
        print('::warning::Site exceeds the documented GitHub Pages 1 GB limit; production media needs separate reduction.')
    status_file.write_text(json.dumps(statuses))


def verify_previews(status_file, attempts=12, delay=10):
    origin = os.environ.get('PAGES_ORIGIN', 'https://docs.robotis.com').rstrip('/')
    for state in json.loads(status_file.read_text()):
        if 'manifest' not in state:
            continue
        manifest = state['manifest']
        prefix = f'{origin}/pr-preview/{state["number"]}'
        # Prefer a document over a generated blog listing as the representative page.
        representative = next((p for p in manifest['pages'] if '/docs/' in p['route']),
                              next(iter(manifest['pages']), {'route': '/changes.html'}))
        for attempt in range(attempts):
            url = f'{prefix}/preview-manifest.json'
            try:
                # Avoid cached 404s while the new deployment propagates through the CDN.
                request = Request(f'{url}?sha={state["sha"]}', headers={'Cache-Control': 'no-cache'})
                with urlopen(request, timeout=10) as response:
                    deployed = json.load(response)
                    if (response.status != 200 or not isinstance(deployed, dict)
                            or deployed.get('number') != state['number']
                            or deployed.get('sha') != state['sha']):
                        raise ValueError('Published preview identity does not match the expected PR commit')
                url = prefix + quote(representative['route'], safe='/%-._~')
                with urlopen(Request(url, headers={'Cache-Control': 'no-cache'}), timeout=10) as response:
                    if response.status != 200:
                        raise ValueError(f'Expected HTTP 200, received {response.status}')
                print(f'Verified PR #{state["number"]} at {state["sha"]}: {url}')
                break
            except (OSError, ValueError) as error:
                print(f'Preview verification {attempt + 1}/{attempts} failed for {url}: {error}', flush=True)
                if attempt + 1 == attempts:
                    raise RuntimeError(f'PR #{state["number"]} preview is not available at the expected commit') from error
                time.sleep(delay)


def update_comments(status_file):
    repository = os.environ['GITHUB_REPOSITORY']
    origin = os.environ.get('PAGES_ORIGIN', 'https://docs.robotis.com').rstrip('/')
    root = f'repos/{repository}'
    statuses = json.loads(status_file.read_text())
    event = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text())
    closed = event.get('pull_request') if event.get('action') == 'closed' else None
    if closed:
        statuses.append({'number': closed['number'], 'reason': 'This PR is closed and its preview has been removed.'})
    for state in statuses:
        number = state['number']
        # Recheck after deployment: never label an older artifact as the latest head.
        pr = api(f'{root}/pulls/{number}')
        if state.get('sha') and pr['state'] == 'open' and pr['head']['sha'] != state['sha']:
            continue
        comments = paginate(f'{root}/issues/{number}/comments')
        previous = next((c for c in comments if c['user']['login'] == 'github-actions[bot]' and c['body'].startswith(MARKER)), None)
        if 'manifest' in state and pr['state'] == 'open':
            body = comment_body(state['manifest'], origin)
        else:
            reason = state.get('reason', 'This PR is closed and its preview is no longer available.')
            body = f'{MARKER}\n### Documentation preview\n\n{reason}'
            if not previous:
                continue  # Do not create unrelated/no-preview comments.
        if previous:
            if previous['body'] != body:
                api(f'{root}/issues/comments/{previous["id"]}', 'PATCH', {'body': body})
        else:
            api(f'{root}/issues/{number}/comments', 'POST', {'body': body})


def update_status(state, description, status_file=None):
    event = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text())
    run = event.get('workflow_run', {})
    repository = os.environ['GITHUB_REPOSITORY']
    sha = run.get('head_sha', '')
    if (run.get('event') != 'pull_request'
            or run.get('head_repository', {}).get('full_name') != repository
            or not re.fullmatch('[a-f0-9]{40}', sha)):
        return
    if state not in ('pending', 'success', 'failure', 'error'):
        raise ValueError('Invalid commit status')
    for association in run.get('pull_requests', []):
        number = association['number']
        pr = api(f'repos/{repository}/pulls/{number}')
        if (pr['state'] != 'open' or pr['head']['sha'] != sha
                or (pr['head'].get('repo') or {}).get('full_name') != repository):
            continue
        result, summary = state, description
        if result == 'success' and status_file is not None:
            statuses = json.loads(status_file.read_text())
            included = any(s['number'] == number and s.get('sha') == sha and 'manifest' in s for s in statuses)
            if not included:
                result, summary = 'failure', 'Preview was not published; see deployment logs'
        origin = os.environ.get('GITHUB_SERVER_URL', 'https://github.com')
        api(f'repos/{repository}/statuses/{sha}', 'POST', {
            'state': result, 'context': 'PR preview / Pages', 'description': summary[:140],
            'target_url': f'{origin}/{repository}/actions/runs/{os.environ.get("GITHUB_RUN_ID", "")}',
        })


if __name__ == '__main__':
    if sys.argv[1] == 'collect':
        collect(Path(sys.argv[2]), Path(sys.argv[3]))
    elif sys.argv[1] == 'comment':
        update_comments(Path(sys.argv[2]))
    elif sys.argv[1] == 'verify':
        verify_previews(Path(sys.argv[2]))
    elif sys.argv[1] == 'status':
        update_status(sys.argv[2], sys.argv[3], Path(sys.argv[4]) if len(sys.argv) > 4 else None)
    else:
        raise SystemExit('Expected collect, verify, comment or status')
