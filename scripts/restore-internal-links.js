#!/usr/bin/env node
/**
 * 변환 중에 미완 영역 보호 차원으로 외부 URL `https://emanual.robotis.com/docs/{en,kr,jp}/...`
 * 로 강등됐던 링크들을, 모든 영역 변환이 끝난 지금 시점에서 다시 내부 링크 `/docs/...` 로 복원한다.
 *
 *   변환 규칙:
 *     https://emanual.robotis.com/docs/en/...   → /docs/...
 *     https://emanual.robotis.com/docs/kr/...   → /docs/...   (Docusaurus i18n이 현재 locale에서 자동 prefix)
 *     https://emanual.robotis.com/docs/jp/...   → /docs/...
 *
 *     단, target 경로가 실제 docusaurus/docs/ 또는 i18n/{ko,ja}/.../current/ 에
 *     존재할 때만 복원. 없으면 외부 URL 유지.
 *
 *   #fragment 는 보존. trailing slash 는 제거.
 *
 *   사용법:
 *     node scripts/restore-internal-links.js
 *
 *   결과:
 *     변환된 .mdx 파일 일부 수정. 콘솔에 통계 출력.
 */

const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(REPO_ROOT, 'docusaurus', 'docs');
const I18N_KO = path.join(REPO_ROOT, 'docusaurus', 'i18n', 'ko', 'docusaurus-plugin-content-docs', 'current');
const I18N_JA = path.join(REPO_ROOT, 'docusaurus', 'i18n', 'ja', 'docusaurus-plugin-content-docs', 'current');

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

/** Docusaurus에 라우팅될 path 집합 (en 기준 — i18n은 자동 매핑) */
function collectExistingPaths() {
  const paths = new Set();
  if (!fs.existsSync(DOCS)) return paths;
  for (const f of walk(DOCS)) {
    const rel = path.relative(DOCS, f).split(path.sep);
    if (rel.some((seg) => seg.startsWith('_'))) continue;
    const last = rel[rel.length - 1];
    if (!last.endsWith('.md') && !last.endsWith('.mdx')) continue;
    const stem = last.replace(/\.(md|mdx)$/, '');
    const dirParts = rel.slice(0, -1);
    const urlParts = stem === 'index' ? dirParts : [...dirParts, stem];
    const urlPath = `/docs/${urlParts.join('/')}`.replace(/\/+$/, '');
    paths.add(urlPath || '/docs');
  }
  return paths;
}

function processFile(filepath, existingPaths, stats) {
  if (!filepath.endsWith('.md') && !filepath.endsWith('.mdx')) return;
  const original = fs.readFileSync(filepath, 'utf8');

  let restored = 0;
  let kept = 0;

  // 매칭: https://emanual.robotis.com/docs/{en|kr|jp}/<path>[#fragment]
  // url 끝나는 경계: 따옴표/괄호/공백/마크다운 closing
  const re = /https:\/\/emanual\.robotis\.com\/docs\/(en|kr|jp)\/([^\s)"'<>]+?)(?=[\s)"'<>]|$)/g;

  const next = original.replace(re, (full, locale, rest) => {
    // 분리: path # fragment
    const hashIdx = rest.indexOf('#');
    const pathPart = hashIdx >= 0 ? rest.slice(0, hashIdx) : rest;
    const fragment = hashIdx >= 0 ? rest.slice(hashIdx) : '';
    // trailing slash 제거
    const cleanPath = pathPart.replace(/\/+$/, '');
    const target = `/docs/${cleanPath}`;
    if (existingPaths.has(target)) {
      restored++;
      return target + fragment;
    }
    kept++;
    return full;
  });

  if (next !== original) {
    fs.writeFileSync(filepath, next, 'utf8');
    stats.filesChanged++;
  }
  stats.restored += restored;
  stats.kept += kept;
}

function main() {
  const existingPaths = collectExistingPaths();
  console.log(`existing internal docs paths: ${existingPaths.size}`);

  const stats = { filesChanged: 0, restored: 0, kept: 0 };

  for (const root of [DOCS, I18N_KO, I18N_JA]) {
    if (!fs.existsSync(root)) continue;
    for (const f of walk(root)) {
      if (!f.endsWith('.md') && !f.endsWith('.mdx')) continue;
      processFile(f, existingPaths, stats);
    }
  }

  console.log(`---`);
  console.log(`files modified: ${stats.filesChanged}`);
  console.log(`external URLs restored to internal: ${stats.restored}`);
  console.log(`external URLs kept (target not found): ${stats.kept}`);
}

main();
