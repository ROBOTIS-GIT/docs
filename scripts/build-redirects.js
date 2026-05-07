#!/usr/bin/env node
/**
 * Jekyll 원본의 모든 frontmatter `permalink:` 값을 추출해
 * Docusaurus client-redirects 플러그인이 사용할 redirects 배열을 생성한다.
 *
 *   사용:
 *     node scripts/build-redirects.js
 *
 *   결과:
 *     docusaurus/redirects.generated.json   (배열: [{ from, to }, ...])
 *
 *   docusaurus.config.ts 가 이 파일을 import 해서 client-redirects.redirects 에 주입.
 *
 *   매핑 규칙:
 *     원본 permalink 예: /docs/en/dxl/ax/ax-12a/
 *                       /docs/kr/dxl/ax/ax-12a/
 *                       /docs/jp/dxl/ax/ax-12a/
 *     →
 *       en  → from = '/docs/en/dxl/ax/ax-12a',  to = '/docs/dxl/ax/ax-12a'
 *       kr  → from = '/docs/kr/dxl/ax/ax-12a',  to = '/ko/docs/dxl/ax/ax-12a'
 *       jp  → from = '/docs/jp/dxl/ax/ax-12a',  to = '/ja/docs/dxl/ax/ax-12a'
 *
 *     Docusaurus i18n 의 default locale(en)은 URL prefix가 없고,
 *     ko/ja는 `/<locale>/docs/...` 로 prefix가 붙는 점에 주의.
 */

const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const SOURCE_DOCS = path.join(REPO_ROOT, 'source', 'docs');
const DOCUSAURUS_ROOT = path.join(REPO_ROOT, 'docusaurus');
const DOCUSAURUS_DOCS_EN = path.join(DOCUSAURUS_ROOT, 'docs');
const DOCUSAURUS_I18N = path.join(DOCUSAURUS_ROOT, 'i18n');
const OUTPUT = path.join(DOCUSAURUS_ROOT, 'redirects.generated.json');

// 현재 client-redirects 플러그인은 default locale(en)의 redirect만 검증 통과.
// ko/ja 원본 URL의 redirect는 별도 처리 방식이 필요 (후속 작업).
// 일단 en만 emit.
const LOCALE_MAP = {
  en: { prefix: '' },
};

/** 디렉터리 재귀 순회 */
function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

/** 파일 첫 frontmatter 블록에서 permalink 값을 추출. 없으면 null. */
function extractPermalink(filepath) {
  if (!filepath.endsWith('.md') && !filepath.endsWith('.markdown')) return null;
  const raw = fs.readFileSync(filepath, 'utf8');
  if (!raw.startsWith('---')) return null;

  const end = raw.indexOf('\n---', 3);
  if (end < 0) return null;
  const block = raw.slice(3, end);

  // permalink: /foo/bar/   또는   permalink: "/foo/bar/"
  const m = block.match(/^permalink:\s*['"]?([^'"\n\r]+?)['"]?\s*$/m);
  if (!m) return null;
  let value = m[1].trim();
  // client-redirects는 from에 fragment(#...)를 허용하지 않음. 페이지 단위 redirect로 강등.
  const hashIdx = value.indexOf('#');
  if (hashIdx >= 0) value = value.slice(0, hashIdx);
  return value || null;
}

/**
 * 명시적 permalink 매핑 오버라이드.
 * 원본 permalink 의 일부 시리즈는 출력 URL 구조가 달라 자동 매핑으로 안 잡힘.
 * 예: source 의 rh_p12_rn / rh_p12_rna / rh_p12_rn_ur 페이지는
 *     모두 docusaurus output 의 platform/rh_p12_rn/<page> 폴더로 이동했다.
 */
const PERMALINK_OVERRIDES = {
  // RH-P12-RN 시리즈는 source에서 4개 별도 permalink였지만 output은 한 폴더로 통합.
  // rh_p12_rn.mdx 는 폴더와 동일 이름이라 Docusaurus가 폴더 인덱스로 promote → 슬러그가 '/docs/platform/rh_p12_rn'
  '/docs/en/platform/rh_p12_rn':     '/docs/platform/rh_p12_rn',
  '/docs/en/platform/rh_p12_rna':    '/docs/platform/rh_p12_rn/rh_p12_rna',
  '/docs/en/platform/rh_p12_rn_ur':  '/docs/platform/rh_p12_rn/rh_p12_rn_ur',
  '/docs/en/platform/rh_p12_rn_dr':  '/docs/platform/rh_p12_rn/rh_p12_rn_dr',
};

/** 원본 permalink → Docusaurus URL */
function toDocusaurusUrl(permalink) {
  const trimmed = permalink.replace(/\/+$/, '');
  if (Object.prototype.hasOwnProperty.call(PERMALINK_OVERRIDES, trimmed)) {
    return PERMALINK_OVERRIDES[trimmed];
  }
  // 형식: /docs/<locale>/<path>/   또는 일반   /docs/<locale>/<path>
  const m = permalink.match(/^\/docs\/(en|kr|jp)\/(.*?)\/?$/);
  if (!m) return null;
  const [, locale, rest] = m;
  const cfg = LOCALE_MAP[locale];
  if (!cfg) return null;
  return `${cfg.prefix}/docs/${rest}`.replace(/\/+$/, '') || '/';
}

/** Docusaurus가 trailing-slash를 자동 처리하므로 정규화된 형식 1개만 */
function fromVariants(permalink) {
  return [permalink.replace(/\/+$/, '')];
}

/**
 * Docusaurus에 실제 라우팅될 path 집합을 수집한다.
 * .md/.mdx 파일을 URL path로 변환:
 *   docs/dxl/index.md       → /docs/dxl
 *   docs/dxl/ax/ax-12a.mdx  → /docs/dxl/ax/ax-12a
 *   i18n/ko/.../current/dxl/index.md → /ko/docs/dxl
 *
 *   _ 접두 디렉터리/파일(예: _partials/, _category_.json)은 빌드 라우팅 제외 → 스킵.
 *
 *   client-redirects가 검증하는 to 경로와 매칭되도록.
 */
function collectExistingDocusaurusPaths() {
  const paths = new Set();

  function fileToUrlPath(rootDir, locale, filepath) {
    const rel = path.relative(rootDir, filepath).split(path.sep);
    if (rel.some((seg) => seg.startsWith('_'))) return null;
    const last = rel[rel.length - 1];
    if (!last.endsWith('.md') && !last.endsWith('.mdx')) return null;
    const stem = last.replace(/\.(md|mdx)$/, '');
    const dirParts = rel.slice(0, -1);
    const urlParts = stem === 'index' ? dirParts : [...dirParts, stem];
    const localePrefix = locale === 'en' ? '' : `/${locale}`;
    const urlPath = `${localePrefix}/docs/${urlParts.join('/')}`.replace(/\/+$/, '');
    return urlPath || `${localePrefix}/docs`;
  }

  // en (default locale): docusaurus/docs/
  if (fs.existsSync(DOCUSAURUS_DOCS_EN)) {
    for (const f of walk(DOCUSAURUS_DOCS_EN)) {
      const p = fileToUrlPath(DOCUSAURUS_DOCS_EN, 'en', f);
      if (p) paths.add(p);
    }
  }

  // ko/ja: docusaurus/i18n/<locale>/docusaurus-plugin-content-docs/current/
  for (const locale of ['ko', 'ja']) {
    const localeDocsRoot = path.join(
      DOCUSAURUS_I18N,
      locale,
      'docusaurus-plugin-content-docs',
      'current',
    );
    if (!fs.existsSync(localeDocsRoot)) continue;
    for (const f of walk(localeDocsRoot)) {
      const p = fileToUrlPath(localeDocsRoot, locale, f);
      if (p) paths.add(p);
    }
  }

  return paths;
}

function main() {
  if (!fs.existsSync(SOURCE_DOCS)) {
    console.error(`source/docs not found: ${SOURCE_DOCS}`);
    process.exit(1);
  }

  const existingPaths = collectExistingDocusaurusPaths();

  const redirects = [];
  const seen = new Set();
  let scanned = 0;
  let withPermalink = 0;
  let toMissing = 0;
  const skipped = [];

  for (const file of walk(SOURCE_DOCS)) {
    scanned++;
    const permalink = extractPermalink(file);
    if (!permalink) continue;
    withPermalink++;

    const to = toDocusaurusUrl(permalink);
    if (!to) {
      skipped.push({ file: path.relative(REPO_ROOT, file), permalink, reason: 'unmapped permalink' });
      continue;
    }

    // Docusaurus에 아직 해당 페이지가 없으면 redirect 활성화 보류
    // (콘텐츠 변환이 진행되면서 점진적으로 활성화됨)
    if (!existingPaths.has(to)) {
      toMissing++;
      continue;
    }

    for (const from of fromVariants(permalink)) {
      const key = `${from}\t${to}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (from === to) continue;
      redirects.push({ from, to });
    }
  }

  // 정렬해서 결과가 결정적이도록
  redirects.sort((a, b) => a.from.localeCompare(b.from));

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(redirects, null, 2) + '\n', 'utf8');

  console.log(`scanned: ${scanned} files`);
  console.log(`with permalink: ${withPermalink}`);
  console.log(`redirects emitted: ${redirects.length}`);
  console.log(`pending (target page not yet migrated): ${toMissing}`);
  console.log(`output: ${path.relative(REPO_ROOT, OUTPUT)}`);
  if (skipped.length) {
    console.log(`skipped (unmapped permalink format): ${skipped.length} (first 5):`);
    for (const s of skipped.slice(0, 5)) console.log(`  - ${s.file}: ${s.permalink} (${s.reason})`);
  }
}

main();
