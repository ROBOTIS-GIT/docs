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
from urllib.parse import quote, unquote
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
    lines = [MARKER, f'### 문서 미리보기 · PR #{number}', '',
             f'미리보기 커밋: `{sha}`', '', f'[변경된 페이지 목록]({prefix}/changes.html)', '']
    for page in manifest['pages'][:80]:
        title = re.sub(r'([\\`*{}\[\]()#+!|_])', r'\\\1', html.escape(page['title'])).replace('\n', ' ')[:200]
        route = quote(page['route'], safe='/%-._~')
        lines.append(f'- [{title}]({prefix}{route})')
    if len(manifest['pages']) > 80:
        lines.append(f'\n나머지 {len(manifest["pages"]) - 80}개 페이지는 위 목록 링크에서 확인하세요.')
    if not manifest['pages']:
        lines.append('이 변경에 해당하는 게시 가능한 문서 페이지가 없습니다.')
    lines += ['', '변경된 페이지와 필요한 파일만 게시합니다. 그 외 링크는 운영 문서로 연결됩니다.',
              'PR이 닫히거나 빌드 아티팩트가 만료되면 다음 배포에서 제거됩니다.']
    return '\n'.join(lines)


def collect(build, status_file):
    repository = os.environ['GITHUB_REPOSITORY']
    root = f'repos/{repository}'
    previews = build / 'pr-preview'
    shutil.rmtree(previews, ignore_errors=True)
    statuses = []
    total = 0
    for pr in paginate(f'{root}/pulls?state=open&base=main'):
        number = pr['number']
        state = {'number': number, 'sha': pr['head']['sha'], 'reason': '현재 커밋의 미리보기 빌드가 없거나 만료되었습니다.'}
        if not pr['head'].get('repo') or pr['head']['repo']['full_name'] != repository:
            state['reason'] = '외부 fork PR은 운영 사이트와 같은 도메인에 자동 게시하지 않습니다.'
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
                state['reason'] = '미리보기 아티팩트가 400 MiB 제한을 초과했습니다.'
                break
            data = api(f'{root}/actions/artifacts/{artifact["id"]}/zip', binary=True)
            destination = previews / str(number)
            try:
                manifest = extract_preview(data, destination, number, pr['head']['sha'])
                size = sum(p.stat().st_size for p in destination.rglob('*') if p.is_file())
                if total + size > TOTAL_PREVIEW_LIMIT:
                    raise ValueError('Combined previews exceed 500 MiB')
                total += size
                state['manifest'] = manifest
            except (ValueError, KeyError, TypeError, zipfile.BadZipFile) as error:
                shutil.rmtree(destination, ignore_errors=True)
                state['reason'] = '미리보기 검증 또는 용량 검사에 실패했습니다. Actions 로그를 확인하세요.'
                print(f'::warning::PR #{number}: {error}')
            break
        statuses.append(state)
    size = sum(p.stat().st_size for p in build.rglob('*') if p.is_file())
    print(f'Pages payload: {size / 1024**2:.1f} MiB; previews: {total / 1024**2:.1f} MiB')
    if size > 1024**3:
        print('::warning::Site exceeds the documented GitHub Pages 1 GB limit; production media needs separate reduction.')
    status_file.write_text(json.dumps(statuses))


def update_comments(status_file):
    repository = os.environ['GITHUB_REPOSITORY']
    origin = os.environ.get('PAGES_ORIGIN', 'https://docs.robotis.com').rstrip('/')
    root = f'repos/{repository}'
    statuses = json.loads(status_file.read_text())
    event = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text())
    closed = event.get('pull_request') if event.get('action') == 'closed' else None
    if closed:
        statuses.append({'number': closed['number'], 'reason': 'PR이 닫혀 미리보기를 제거했습니다.'})
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
            reason = state.get('reason', 'PR이 닫혀 미리보기가 더 이상 제공되지 않습니다.')
            body = f'{MARKER}\n### 문서 미리보기\n\n{reason}'
            if not previous:
                continue  # Do not create unrelated/no-preview comments.
        if previous:
            if previous['body'] != body:
                api(f'{root}/issues/comments/{previous["id"]}', 'PATCH', {'body': body})
        else:
            api(f'{root}/issues/{number}/comments', 'POST', {'body': body})


if __name__ == '__main__':
    if sys.argv[1] == 'collect':
        collect(Path(sys.argv[2]), Path(sys.argv[3]))
    elif sys.argv[1] == 'comment':
        update_comments(Path(sys.argv[2]))
    else:
        raise SystemExit('Expected collect or comment')
