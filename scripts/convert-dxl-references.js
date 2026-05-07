#!/usr/bin/env node
/**
 * dxl 직속 reference / 인덱스 페이지 변환.
 *
 * 입력:
 *   source/docs/{en,kr}/dxl/<file>.md
 *
 * 출력:
 *   docusaurus/docs/dxl/<file>.mdx                                 (en)
 *   docusaurus/i18n/ko/.../current/dxl/<file>.mdx                  (ko)
 *
 * 특수: dxl.md  → docusaurus/docs/dxl/index.mdx
 *                docusaurus/i18n/ko/.../current/dxl/index.mdx
 *
 * partial 디렉터리는 새로 만들지 않는다 (인라인 처리). 파일 내 Liquid는
 * `{% capture X %}...{% endcapture %} <div class="notice">{{ X | markdownify }}</div>`
 * 패턴이 전부이며, 직접 admonition으로 인라인.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REPO = path.resolve(__dirname, '..');
const SRC_EN = path.join(REPO, 'source', 'docs', 'en', 'dxl');
const SRC_KR = path.join(REPO, 'source', 'docs', 'kr', 'dxl');
const OUT_EN = path.join(REPO, 'docusaurus', 'docs', 'dxl');
const OUT_KO = path.join(
  REPO,
  'docusaurus',
  'i18n',
  'ko',
  'docusaurus-plugin-content-docs',
  'current',
  'dxl',
);

// stem (basename, no .md) -> output file name (under dxl/ or dxl/index.mdx)
// 인덱스/Quick Start
const FILES = [
  // [stem, out_basename(.mdx), id, sidebar_label / title]
  ['dxl', 'index', 'index', 'DYNAMIXEL'],
  ['dxl-quick-start-guide', 'dxl-quick-start-guide', 'dxl-quick-start-guide', 'DYNAMIXEL Quick Start Guide'],
  ['dxl-quick-start-insert', 'dxl-quick-start-insert', 'dxl-quick-start-insert', 'DYNAMIXEL Quick Start'],
  ['crc', 'crc', 'crc', 'CRC Calculation'],
  ['protocol1', 'protocol1', 'protocol1', 'DYNAMIXEL Protocol 1.0'],
  ['protocol2', 'protocol2', 'protocol2', 'DYNAMIXEL Protocol 2.0'],
  ['ax', 'ax', 'ax', 'DYNAMIXEL AX Series'],
  ['dx', 'dx', 'dx', 'DYNAMIXEL DX Series'],
  ['ex', 'ex', 'ex', 'DYNAMIXEL EX Series'],
  ['mx', 'mx', 'mx', 'DYNAMIXEL MX Series'],
  ['rx', 'rx', 'rx', 'DYNAMIXEL RX Series'],
  ['x_c', 'x_c', 'x_c', 'XC Series'],
  ['x_h', 'x_h', 'x_h', 'XH Series'],
  ['x_l', 'x_l', 'x_l', 'XL Series'],
  ['x_m', 'x_m', 'x_m', 'XM Series'],
];

// ko-only sidebar overrides (한국어 카탈로그 인덱스의 ko sidebar title)
// 원본 ko 파일 frontmatter sidebar.title 자동 추출 우선; 폴백 한국어 라벨.
const KO_TITLE_FALLBACK = {
  index: '다이나믹셀',
  'dxl-quick-start-guide': '다이나믹셀 퀵 스타트 가이드',
  'dxl-quick-start-insert': 'DYNAMIXEL Quick Start',
  crc: 'CRC 계산',
  protocol1: 'DYNAMIXEL Protocol 1.0',
  protocol2: 'DYNAMIXEL Protocol 2.0',
  ax: 'DYNAMIXEL AX 시리즈',
  dx: 'DYNAMIXEL DX 시리즈',
  ex: 'DYNAMIXEL EX 시리즈',
  mx: 'DYNAMIXEL MX 시리즈',
  rx: 'DYNAMIXEL RX 시리즈',
  x_c: 'XC 시리즈',
  x_h: 'XH 시리즈',
  x_l: 'XL 시리즈',
  x_m: 'XM 시리즈',
};

// ----- helpers -----
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function writeOut(p, c) { ensureDir(path.dirname(p)); fs.writeFileSync(p, c); }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } }

function splitFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return { fm: {}, body: src };
  const fmRaw = m[1];
  const body = src.slice(m[0].length);
  const fm = {};
  let curKey = null;
  fmRaw.split(/\r?\n/).forEach((line) => {
    const top = line.match(/^([A-Za-z_][\w]*)\s*:\s*(.*)$/);
    if (top) {
      const v = top[2].trim();
      if (v === '') {
        fm[top[1]] = {};
        curKey = top[1];
      } else {
        fm[top[1]] = v.replace(/^['"]|['"]$/g, '');
        curKey = null;
      }
    } else if (/^\s+/.test(line) && curKey && typeof fm[curKey] === 'object') {
      const sub = line.trim().match(/^([A-Za-z_][\w]*)\s*:\s*(.*)$/);
      if (sub) fm[curKey][sub[1]] = sub[2].replace(/^['"]|['"]$/g, '');
    }
  });
  return { fm, body };
}

// ----- Liquid: capture/endcapture and {{ var | markdownify }} 인라인 처리 -----
//
// 패턴:
//   {% capture name %}
//   ...content...
//   {% endcapture %}
//   <div class="notice...">{{ name | markdownify }}</div>
//
// → admonition 블록으로 합침 (notice → :::note, notice--warning → :::warning, ...)
function inlineLiquidCaptures(src) {
  const captures = new Map();
  // capture 정의를 추출하고 본문에서 제거
  src = src.replace(
    /\{%-?\s*capture\s+(\w+)\s*-?%\}([\s\S]*?)\{%-?\s*endcapture(?:\s+\w+)?\s*-?%\}/g,
    (_, name, body) => {
      captures.set(name, body.trim());
      return '';
    },
  );

  // <div class="notice...">{{ name | markdownify }}</div>
  // notice / notice--warning / notice--info / notice--danger / notice--success
  src = src.replace(
    /<div\s+class="(notice(?:--[a-z]+)?)"\s*>\s*\{\{\s*(\w+)\s*\|\s*markdownify\s*\}\}\s*<\/div>/g,
    (m, cls, name) => {
      const body = captures.get(name);
      if (body === undefined) return m;
      const kindMap = {
        notice: 'note',
        'notice--warning': 'warning',
        'notice--info': 'info',
        'notice--danger': 'danger',
        'notice--success': 'tip',
      };
      const kind = kindMap[cls] || 'note';
      return `\n:::${kind}\n\n${body}\n\n:::\n`;
    },
  );

  // 그 외 잔여 {{ var }} → 단순 치환 시도
  src = src.replace(/\{\{\s*(\w+)(?:\s*\|\s*markdownify)?\s*\}\}/g, (m, name) => {
    return captures.has(name) ? captures.get(name) : m;
  });

  return src;
}

// ----- Kramdown / 후처리 -----
function escapeMdxBraces(src) {
  const lines = src.split('\n');
  let inFence = false;
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const out = [];
    let i = 0;
    while (i < line.length) {
      const ch = line[i];
      if (ch === '`') {
        const end = line.indexOf('`', i + 1);
        if (end === -1) { out.push(line.slice(i)); i = line.length; }
        else { out.push(line.slice(i, end + 1)); i = end + 1; }
        continue;
      }
      if (ch === '{') {
        if (line.slice(i, i + 3) === '{/*') {
          const end = line.indexOf('*/}', i + 3);
          if (end === -1) { out.push(line.slice(i)); i = line.length; }
          else { out.push(line.slice(i, end + 3)); i = end + 3; }
          continue;
        }
        const close = line.indexOf('}', i + 1);
        if (close === -1) {
          out.push('&#123;');
          i++;
          continue;
        }
        const inner = line.slice(i + 1, close).trim();
        if (/^[A-Za-z_$][\w$]*$/.test(inner) || inner === '') {
          out.push(line.slice(i, close + 1));
        } else {
          out.push('&#123;' + line.slice(i + 1, close) + '&#125;');
        }
        i = close + 1;
        continue;
      }
      out.push(ch);
      i++;
    }
    lines[li] = out.join('');
  }
  return lines.join('\n');
}

function escapeAngleBrackets(src) {
  const lines = src.split('\n');
  let inFence = false;
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    let out = '';
    let i = 0;
    while (i < line.length) {
      const ch = line[i];
      if (ch === '`') {
        const end = line.indexOf('`', i + 1);
        if (end === -1) { out += line.slice(i); i = line.length; }
        else { out += line.slice(i, end + 1); i = end + 1; }
        continue;
      }
      if (ch === '<') {
        const next = line[i + 1] || '';
        if (/[A-Za-z/!?]/.test(next)) { out += ch; i++; continue; }
        out += '&lt;';
        i++;
        continue;
      }
      out += ch;
      i++;
    }
    lines[li] = out;
  }
  return lines.join('\n');
}

function admonitionConvert(src, marker, kind) {
  const lines = src.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (marker.test(lines[i])) {
      let start = out.length - 1;
      while (start >= 0 && out[start].trim() !== '') start--;
      const body = out.splice(start + 1).join('\n').trim();
      out.push('', `:::${kind}`, '', body, '', ':::', '');
      continue;
    }
    out.push(lines[i]);
  }
  return out.join('\n');
}

function kramdownToMdx(src) {
  // kramdown options
  src = src.replace(/\{::options[^}]*\/\}/g, '');
  src = src.replace(/^\s*\*\s*\n\s*\{:toc\}\s*$/gm, '');
  src = src.replace(/\{:toc\}/g, '');
  // 인라인 클래스 토큰 제거
  src = src.replace(/\{:\s*\.text-center\}/g, '');
  src = src.replace(/\{:\s*\.blank\}/g, '');
  src = src.replace(/\{:\s*\.popup\}/g, '');
  // {: width="..."} 같은 이미지 어트리뷰트는 제거 (MDX는 인라인 image attr 미지원)
  src = src.replace(/\{:\s*[^}]*\}/g, (m) => {
    // 중요: 마지막 라인에서 다른 클래스 컨버팅이 필요한 케이스(아래)는 별도 처리하므로
    // 보통 attr 토큰만 남았으면 제거
    if (/^\{:\s*\.notice/.test(m)) return m;
    return '';
  });

  // notice 유형 라인 후에 한 단락이 admonition 이 됨
  src = admonitionConvert(src, /^\s*\{:\s*\.notice--danger\}\s*$/, 'danger');
  src = admonitionConvert(src, /^\s*\{:\s*\.notice--warning\}\s*$/, 'warning');
  src = admonitionConvert(src, /^\s*\{:\s*\.notice--info\}\s*$/, 'info');
  src = admonitionConvert(src, /^\s*\{:\s*\.notice--success\}\s*$/, 'tip');
  src = admonitionConvert(src, /^\s*\{:\s*\.notice\}\s*$/, 'note');

  // 잔여 div notice
  src = src.replace(/<div\s+class="notice--warning">([\s\S]*?)<\/div>/g, (_, b) => `\n:::warning\n\n${b.trim()}\n\n:::\n`);
  src = src.replace(/<div\s+class="notice--info">([\s\S]*?)<\/div>/g, (_, b) => `\n:::info\n\n${b.trim()}\n\n:::\n`);
  src = src.replace(/<div\s+class="notice--danger">([\s\S]*?)<\/div>/g, (_, b) => `\n:::danger\n\n${b.trim()}\n\n:::\n`);
  src = src.replace(/<div\s+class="notice--success">([\s\S]*?)<\/div>/g, (_, b) => `\n:::tip\n\n${b.trim()}\n\n:::\n`);
  src = src.replace(/<div\s+class="notice">([\s\S]*?)<\/div>/g, (_, b) => `\n:::note\n\n${b.trim()}\n\n:::\n`);

  // 이미지 경로 — 먼저 윈도우 백슬래시를 슬래시로 정규화 (x_c.md 같은 케이스)
  src = src.replace(/\/assets\\images\\/g, '/assets/images/');
  src = src.replace(
    /(\/assets\/images(?:[\\\/][\w.-]+)*)/g,
    (m) => m.replace(/\\/g, '/'),
  );
  src = src.replace(/\/assets\/images\/dxl\//g, '/img/dxl/');
  src = src.replace(/\/assets\/images\//g, '/img/');

  // 절대 emanual 링크: /docs/<lang>/<rest>(/) → 외부 절대 URL로 강등 (안전)
  src = src.replace(
    /\]\(\/docs\/(en|kr)\/([^)#\s]+)(#[^)\s]*)?\)/g,
    (_, lang, p, hash) => `](https://emanual.robotis.com/docs/${lang}/${p}${hash || ''})`,
  );
  // 슬래시 누락된 docs/<lang>/... 링크도 동일 처리 (원본 typo 보호)
  src = src.replace(
    /\]\(docs\/(en|kr)\/([^)#\s]+)(#[^)\s]*)?\)/g,
    (_, lang, p, hash) => `](https://emanual.robotis.com/docs/${lang}/${p}${hash || ''})`,
  );
  src = src.replace(
    /^(\[[^\]]+\]):\s*\/docs\/(en|kr)\/([^\s#]+)(#[^\s]*)?\s*$/gm,
    (_, label, lang, p, hash) => `${label}: https://emanual.robotis.com/docs/${lang}/${p}${hash || ''}`,
  );

  // ref-style 이미지 대체 / 자동 a 변환
  {
    const refs = new Map();
    src = src.replace(
      /^\[([^\]]+)\]:\s*(\/img\/[^\s]+)\s*$/gm,
      (m, label, url) => {
        refs.set(label.trim().toLowerCase(), url);
        return '';
      },
    );
    if (refs.size > 0) {
      src = src.replace(/\[([^\]]+)\]/g, (m, label) => {
        const url = refs.get(label.trim().toLowerCase());
        if (!url) return m;
        return `<a href="${url}" target="_blank">${label}</a>`;
      });
    }
  }

  // 짧은 anchor 텍스트가 # 없이 쓰인 케이스 (원본 typo): `[Foo](parameters-)` → `[Foo](#parameters-)`
  src = src.replace(
    /\]\(([a-z][a-z0-9-]*?(?:-?\d+)?)\)/g,
    (m, anchor) => {
      if (/[\/\.:]/.test(anchor)) return m;
      // 1자리(`a`,`b` 등)는 제외하고 fragment id 처럼 보이는 토큰만
      if (anchor.length < 2) return m;
      return `](#${anchor})`;
    },
  );

  // 헤딩 self-link 제거: # **[Foo](#foo)** → # Foo
  src = src.replace(
    /^(#{1,6})\s*\*\*\[([^\]]+?)\]\(#[^)]+\)\*\*\s*$/gm,
    '$1 $2',
  );
  src = src.replace(
    /^(#{1,6})\s*\[([^\]]+?)\]\(#[^)]+\)\s*$/gm,
    '$1 $2',
  );
  // 헤딩에 외부 링크가 있는 케이스 (예: `# [XC430-W150](/docs/en/dxl/x/xc430-w150/)`)는
  // visible text 만 남기고 외부 링크는 직전 위 외부 URL로 강등됐을 것 → 다시 자체 링크로 단순화
  src = src.replace(
    /^(#{1,6})\s*\[([^\]]+?)\]\(https:\/\/emanual\.robotis\.com\/[^)]+\)\s*$/gm,
    '$1 $2',
  );
  src = src.replace(
    /^(#{1,6})\s*\*\*([^*]+)\*\*\s*$/gm,
    '$1 $2',
  );

  // <a name="..."> 헤딩 anchor: 본문에 인라인된 형태가 있으면 제거 (스크립트가 별도 부착)
  src = src.replace(
    /^(#{1,6})((?:\s*<a name="[^"]+"(?:><\/a>|>))+)(.*)$/gm,
    (m, h, anchors, rest) => `${h}${rest}`,
  );

  // HTML 코멘트 제거
  src = src.replace(/<!--[\s\S]*?-->/g, '');
  src = src.replace(/<br\s*>/g, '<br />');
  src = src.replace(/<hr\s*>/g, '<hr />');
  src = src.replace(/<img([^>]*[^\/])>/g, '<img$1 />');

  // <iframe> self-closing 보정
  src = src.replace(/<iframe([^>]*)><\/iframe>/g, '<iframe$1></iframe>');

  // table inside <td>...\n...</td> 줄바꿈 합침
  src = src.replace(/<td\b([^>]*)>([\s\S]*?)<\/td>/g, (m, attrs, body) => {
    const collapsed = body.replace(/\s*\n\s*/g, ' ').trim();
    return `<td${attrs}>${collapsed}</td>`;
  });

  // <details>/<summary> 내부 ![](...) 가 MDX에서 깨지지 않도록 인라인 보정
  // (그대로 두고 처리)

  // < 비교 연산자 escape
  src = escapeAngleBrackets(src);
  // {expr} JSX 충돌 escape
  src = escapeMdxBraces(src);

  return src;
}

function buildFmYaml(fm) {
  const lines = ['---'];
  if (fm.id) lines.push(`id: ${fm.id}`);
  if (fm.title) lines.push(`title: ${JSON.stringify(fm.title)}`);
  if (fm.sidebar_label) lines.push(`sidebar_label: ${JSON.stringify(fm.sidebar_label)}`);
  if (fm.sidebar_position !== undefined) lines.push(`sidebar_position: ${fm.sidebar_position}`);
  if (fm.tags && fm.tags.length) lines.push(`tags: [${fm.tags.join(', ')}]`);
  lines.push('---');
  return lines.join('\n') + '\n\n';
}

function pickTitle(fm, fallback) {
  if (fm.sidebar && fm.sidebar.title) return fm.sidebar.title;
  if (fm.title) return fm.title;
  return fallback;
}

function convertFile(stem, outName, idValue, defaultTitle, lang) {
  const srcDir = lang === 'en' ? SRC_EN : SRC_KR;
  const outDir = lang === 'en' ? OUT_EN : OUT_KO;
  const srcPath = path.join(srcDir, `${stem}.md`);
  const raw = readSafe(srcPath);
  if (raw === null) return null;
  const { fm, body } = splitFrontmatter(raw);

  let processed = inlineLiquidCaptures(body);
  processed = kramdownToMdx(processed);

  // 잔여 Liquid 검증
  const liquidLeft = (processed.match(/\{%[^%]*%\}/g) || []).length;
  const mustacheLeft = (processed.match(/\{\{[\s\S]*?\}\}/g) || []).length;

  let title;
  if (lang === 'en') {
    title = pickTitle(fm, defaultTitle);
  } else {
    title = pickTitle(fm, KO_TITLE_FALLBACK[idValue] || defaultTitle);
  }

  const newFm = {
    id: idValue,
    title,
    sidebar_label: title,
  };
  if (idValue === 'index') {
    newFm.sidebar_position = 1;
  }

  const fmStr = buildFmYaml(newFm);
  const outPath = path.join(outDir, `${outName}.mdx`);
  writeOut(outPath, fmStr + processed.trim() + '\n');
  return { outPath, liquidLeft, mustacheLeft };
}

function run() {
  ensureDir(OUT_EN);
  ensureDir(OUT_KO);

  const stats = { en: 0, ko: 0, errors: [], leftover: [] };

  for (const [stem, outName, idValue, defaultTitle] of FILES) {
    for (const lang of ['en', 'kr']) {
      try {
        const r = convertFile(stem, outName, idValue, defaultTitle, lang);
        if (r) {
          if (lang === 'en') stats.en++; else stats.ko++;
          if (r.liquidLeft || r.mustacheLeft) {
            stats.leftover.push(`${lang}/${stem}: liquid=${r.liquidLeft} mustache=${r.mustacheLeft} → ${r.outPath}`);
          }
        }
      } catch (e) {
        stats.errors.push(`${lang}/${stem}: ${e.message}`);
      }
    }
  }

  // index.mdx placeholder 제거 (index.md → index.mdx 로 교체했으므로)
  const oldIndex = path.join(OUT_EN, 'index.md');
  if (fs.existsSync(oldIndex)) fs.unlinkSync(oldIndex);

  console.log('Done:', JSON.stringify(stats, null, 2));
}

run();
