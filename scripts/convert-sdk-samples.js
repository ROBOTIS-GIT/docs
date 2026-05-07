#!/usr/bin/env node
/**
 * DYNAMIXEL SDK Sample Code 변환 스크립트.
 *
 * 입력:
 *   source/docs/en/software/dynamixel/dynamixel_sdk/sample_code/<lang>/<lang>_<example>.md
 *     lang ∈ { c, cpp, csharp, java, labview, matlab, python }
 *     총 121 페이지 (c:18, cpp:18, python:17, csharp:17, java:17, labview:17, matlab:17)
 *
 *   kr 원본은 존재하지 않음 → 모든 ko 페이지는 en mirror + 한국어 번역 준비 중 안내
 *
 * 출력:
 *   docusaurus/docs/software/dynamixel/dynamixel_sdk/sample_code/<lang>/<example>.mdx
 *   docusaurus/i18n/ko/docusaurus-plugin-content-docs/current/software/dynamixel/dynamixel_sdk/sample_code/<lang>/<example>.mdx
 *   docusaurus/static/img/software/dynamixel/dynamixel_sdk/sample_code/labview/...  (assets)
 *
 *   _category_.json (en/ko) 각 디렉터리:
 *     - sample_code/                                 (root)
 *     - sample_code/<lang>/                          (각 언어)
 *
 * 사용법: node scripts/convert-sdk-samples.js
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REPO = path.resolve(__dirname, '..');
const SRC_EN = path.join(REPO, 'source/docs/en/software/dynamixel/dynamixel_sdk/sample_code');
const OUT_EN = path.join(REPO, 'docusaurus/docs/software/dynamixel/dynamixel_sdk/sample_code');
const OUT_KO = path.join(REPO, 'docusaurus/i18n/ko/docusaurus-plugin-content-docs/current/software/dynamixel/dynamixel_sdk/sample_code');
const ASSET_SRC_ROOT = path.join(REPO, 'source/assets');
const ASSET_OUT_ROOT = path.join(REPO, 'docusaurus/static/img');

// ------------------------------------------------------------
// 유틸
// ------------------------------------------------------------
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function writeOut(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content);
}
function copyFile(src, dst) {
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
}

// ------------------------------------------------------------
// 언어별 메타
// ------------------------------------------------------------
// 디스플레이용 라벨, sidebar position, prism fence 정규화 등
const LANGUAGES = {
  c:       { label: 'C',       koLabel: 'C',         position: 1 },
  cpp:     { label: 'C++',     koLabel: 'C++',       position: 2 },
  python:  { label: 'Python',  koLabel: 'Python',    position: 3 },
  java:    { label: 'Java',    koLabel: 'Java',      position: 4 },
  csharp:  { label: 'C#',      koLabel: 'C#',        position: 5 },
  matlab:  { label: 'MATLAB',  koLabel: 'MATLAB',    position: 6 },
  labview: { label: 'LabVIEW', koLabel: 'LabVIEW',   position: 7 },
};

// fence 언어 hint 정규화: prism 등록 언어로 매핑.
// docusaurus.config.ts 기준: bash, python, cpp, c, json, yaml, cmake, ruby
// 그 외 (cs/csharp, java, m/matlab, labview) 는 prism 미등록 → 'text' 로 강등하면
// 안전하지만, syntax highlighting 손실. java/cs는 기본 prism에 포함되어 있어 그대로 둠.
// matlab(m) / labview는 'text' 로 강등.
const FENCE_NORMALIZE = {
  '':       'text',
  c:        'c',
  cpp:      'cpp',
  'c++':    'cpp',
  python:   'python',
  py:       'python',
  java:     'java',
  cs:       'csharp',
  csharp:   'csharp',
  m:        'matlab',
  matlab:   'matlab',
  labview:  'text',
  bash:     'bash',
  shell:    'bash',
  sh:       'bash',
  json:     'json',
  yaml:     'yaml',
  yml:      'yaml',
};

// ------------------------------------------------------------
// Frontmatter 분리
// ------------------------------------------------------------
function splitFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return { fm: {}, body: src };
  const fmRaw = m[1];
  const body = src.slice(m[0].length);
  const fm = {};
  let curKey = null;
  fmRaw.split(/\r?\n/).forEach(line => {
    const top = line.match(/^([A-Za-z_][\w]*)\s*:\s*(.*)$/);
    if (top) {
      const v = top[2].trim();
      if (v === '') { fm[top[1]] = {}; curKey = top[1]; }
      else { fm[top[1]] = v.replace(/^['"]|['"]$/g, ''); curKey = null; }
    } else if (/^\s+/.test(line) && curKey && typeof fm[curKey] === 'object') {
      const sub = line.trim().match(/^([A-Za-z_][\w]*)\s*:\s*(.*)$/);
      if (sub) fm[curKey][sub[1]] = sub[2].replace(/^['"]|['"]$/g, '');
    }
  });
  return { fm, body };
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

// ------------------------------------------------------------
// Body 변환 (sample_code 페이지에 특화된 단순 변환기)
// ------------------------------------------------------------
function convertBody(body, ctx) {
  // 1) 제거할 jekyll 잔여물
  body = body.replace(/<style>[\s\S]*?<\/style>/g, '');
  body = body.replace(/<div\s+style="counter-reset:[^"]*"\s*><\/div>/g, '');
  body = body.replace(/<!--\[dummy[\s\S]*?<!\[end[^>]*-->/g, '');
  body = body.replace(/<!--[\s\S]*?-->/g, '');

  // 2) `### [Foo](#foo)` → `### Foo` 형태로 self-link 제거
  //    `## [Foo](#foo)` 동일.
  //    h1/h4 도 같이.
  body = body.replace(/^(#{1,6})\s+\[([^\]]+)\]\(#[^)]*\)\s*$/gm, (_, hashes, txt) => `${hashes} ${txt.trim()}`);

  // 2b) frontmatter title이 page h1이 되므로, 본문 leading 의 scaffolding 헤딩
  //     ("# Sample Code" / "## <Lang> Protocol X.X") 는 제거.
  //     예제 자체 헤딩 (### Python Ping Protocol 2.0) 도 제거 (title과 중복).
  //     단순화 목적: body의 처음에 등장하는 # / ## / ### 헤딩이 title과 비슷하면 모두 제거.
  {
    const lines = body.split('\n');
    let i = 0;
    // 빈 줄 skip
    while (i < lines.length && lines[i].trim() === '') i++;
    while (i < lines.length) {
      const line = lines[i];
      // h1/h2/h3 헤딩 (자기 self-link 제거 후 단순한 텍스트) 만 처리
      if (/^#{1,3}\s+\S/.test(line)) {
        const text = line.replace(/^#{1,3}\s+/, '').trim();
        // 다음 패턴 중 하나면 scaffolding 헤딩으로 간주 후 제거:
        //   "Sample Code"
        //   "<lang> Protocol X.X" (예: C Protocol 1.0, Python Protocol 2.0, CPP Protocol 2.0, CSharp Protocol 2.0, etc.)
        //   "<lang> ... Protocol X.X" (예: Python Ping Protocol 2.0)  - title 중복 제거
        //   "<lang> DXL Monitor" - title 중복 제거
        //   "<lang> Protocol Combined" - title 중복 제거
        //   "<lang> Indirect Address Protocol 2.0" 등
        const isSampleCode = /^Sample Code$/i.test(text);
        const isLangProtocol = /^(C|CPP|C\+\+|Python|Java|CSharp|C#|MATLAB|Matlab|LabVIEW|Labview)\s+Protocol\s+[12]\.0$/i.test(text);
        const isExampleTitle = ctx && (text.toLowerCase().replace(/\s+/g, '_').replace(/\./g, '_') === `${ctx.lang === 'cpp' ? 'cpp' : ctx.lang === 'csharp' ? 'csharp' : ctx.lang === 'matlab' ? 'matlab' : ctx.lang === 'labview' ? 'labview' : ctx.lang}_${ctx.exampleName}`.toLowerCase()
          || text.toLowerCase() === ctx.title?.toLowerCase());
        // 예제명이 title과 동등한 헤딩 — 단순화: text가 우리가 만든 title과 동일하면 제거
        const titleLower = ctx?.title ? ctx.title.toLowerCase() : '';
        const textLower = text.toLowerCase();
        // 언어 라벨 동의어 처리: C# ↔ CSharp, C++ ↔ CPP, MATLAB ↔ Matlab, LabVIEW ↔ Labview
        const langSynonyms = {
          'c#': ['c#', 'csharp'],
          'c++': ['c++', 'cpp'],
          'matlab': ['matlab'],
          'labview': ['labview'],
        };
        function normalizeForCompare(s) {
          let t = s.toLowerCase().trim().replace(/\s+/g, ' ');
          // 첫 단어가 언어명이면 동의어 변환 시도
          for (const [canonical, alts] of Object.entries(langSynonyms)) {
            for (const alt of alts) {
              const re = new RegExp(`^${alt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
              if (re.test(t)) {
                t = t.replace(re, canonical);
                break;
              }
            }
          }
          return t;
        }
        const isOurTitle = titleLower && (
          textLower === titleLower
          || normalizeForCompare(text) === normalizeForCompare(ctx.title)
        );

        if (isSampleCode || isLangProtocol || isOurTitle) {
          lines.splice(i, 1);
          // trailing 빈 줄 정리
          while (i < lines.length && lines[i].trim() === '') {
            lines.splice(i, 1);
          }
          continue;
        }
      }
      // scaffolding 헤딩이 끝나면 break (그 뒤 본문 헤딩은 그대로)
      break;
    }
    body = lines.join('\n');
  }

  // 3) 코드 fence 정규화
  //    - ```cpp / ``` cpp / ``` (no lang) 모두 처리
  //    - 들여쓰기된 fence (예: c_read_write_protocol_1_0 의 4-space-indented fence)는 그대로 두면
  //      MDX는 들여쓰기를 코드블록 의미로 인식할 수 있어 문제. 들여쓰기를 제거.
  {
    const lines = body.split('\n');
    const out = [];
    let inFence = false;
    let fenceIndent = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!inFence) {
        // fence 시작 감지: 행 전체가 ```[lang]? 형태 (앞뒤 공백 허용)
        const m = line.match(/^(\s*)```\s*([A-Za-z0-9_+\-#.]*)?\s*$/);
        if (m) {
          fenceIndent = m[1] || '';
          let lang = (m[2] || '').toLowerCase();
          if (lang in FENCE_NORMALIZE) lang = FENCE_NORMALIZE[lang];
          out.push('```' + lang);
          inFence = true;
          continue;
        }
        out.push(line);
      } else {
        // fence 종료 감지: 줄 전체가 ``` 인 경우
        const closing = line.match(/^(\s*)```\s*$/);
        if (closing) {
          out.push('```');
          inFence = false;
          fenceIndent = '';
          continue;
        }
        // 또는 줄 끝에 ``` 가 붙은 경우 (예: `  }```  → `  }\n```)
        if (/```\s*$/.test(line)) {
          // ``` 앞에 코드 내용이 있으면 분리
          const idx = line.lastIndexOf('```');
          const codePart = line.slice(0, idx).trimEnd();
          if (fenceIndent && codePart.startsWith(fenceIndent)) {
            out.push(codePart.slice(fenceIndent.length));
          } else if (codePart) {
            out.push(codePart);
          }
          out.push('```');
          inFence = false;
          fenceIndent = '';
          continue;
        }
        // fence 내부: 들여쓰기를 fence 들여쓰기만큼 제거 (있다면)
        if (fenceIndent && line.startsWith(fenceIndent)) {
          out.push(line.slice(fenceIndent.length));
        } else {
          out.push(line);
        }
      }
    }
    body = out.join('\n');
  }

  // 4) 이미지 경로 재작성: /assets/images/sw/sdk/dynamixel_sdk/library_setup/labview/windows/sample_code/...
  //    → /img/software/dynamixel/dynamixel_sdk/sample_code/labview/...
  //    LabVIEW 페이지가 사용하는 경로만 직접 매핑 (다른 경로 안 씀)
  body = body.replace(
    /\/assets\/images\/sw\/sdk\/dynamixel_sdk\/library_setup\/labview\/windows\/sample_code\//g,
    '/img/software/dynamixel/dynamixel_sdk/sample_code/labview/'
  );
  // 일반 fallback: 다른 /assets/images/ 가 등장하면 외부 emanual로 강등 (없을 것)
  body = body.replace(/\]\(\/assets\/([^)\s]+)\)/g, (_, p) => `](https://emanual.robotis.com/assets/${p})`);

  // 5) 내부 링크 재작성:
  //    /docs/{en,kr}/software/dynamixel/dynamixel_sdk/<rest>/(#hash)?
  //
  //    rest가 sample_code/<lang>_<name> 형태면 → /docs/software/dynamixel/dynamixel_sdk/sample_code/<lang>/<name>
  //    그 외(예: device_setup) 는 우선 /docs/software/dynamixel/dynamixel_sdk/<rest> 로 옮기되
  //    아직 변환 안 된 페이지가 많으니 외부 URL 강등이 안전.
  //    → 이 페이지에서 등장하는 cross-link는 거의 device_setup 류 (미변환). 외부 URL 강등.
  //
  //    먼저 sample_code 내부 링크: <lang>_<example>/ 형태
  body = body.replace(
    /\]\(\/docs\/(en|kr)\/software\/dynamixel\/dynamixel_sdk\/sample_code\/(c|cpp|python|java|csharp|labview|matlab)_([a-z0-9_]+?)\/?(#[^)\s]*)?\)/gi,
    (m, lang, slang, name, hash) => `](/docs/software/dynamixel/dynamixel_sdk/sample_code/${slang.toLowerCase()}/${name}${hash || ''})`
  );
  // 그 외 dynamixel_sdk 내 cross-link: 외부 URL 강등 (아직 미변환)
  body = body.replace(
    /\]\(\/docs\/(en|kr)\/software\/dynamixel\/dynamixel_sdk\/([^)\s#]+?)\/?(#[^)\s]*)?\)/g,
    (m, lang, p, hash) => `](https://emanual.robotis.com/docs/${lang}/software/dynamixel/dynamixel_sdk/${p}/${hash || ''})`
  );
  // 더 광범위한 docs/<lang>/... 도 외부 강등 (변환 영역 외)
  body = body.replace(
    /\]\(\/docs\/(en|kr)\/(?!software\/dynamixel\/dynamixel_sdk\/sample_code)([^)\s#]+?)(#[^)\s]*)?\)/g,
    (m, lang, p, hash) => `](https://emanual.robotis.com/docs/${lang}/${p}${hash || ''})`
  );

  // 6) MDX 문제 escape: 본문 (코드블록 외) 의 `<` `>`, `{` `}` 등 처리
  //    sample_code 페이지에는 코드블록 외부에 `<unistd.h>` 같은 stray angle brackets나
  //    inline `dxl_packet_handler<...>` 같은 패턴이 거의 없음.
  //    그래도 안전을 위해 inline `<...>` 가 HTML/JSX로 해석되어 깨질 만한 경우 escape.
  body = mdxEscapeOutsideFences(body);

  // 7) `\n\n\n+` 정리 (코드블록 외부)
  body = collapseBlankLines(body);

  return body;
}

// 코드블록 외부에서 stray angle brackets / 중괄호 escape
function mdxEscapeOutsideFences(src) {
  const lines = src.split('\n');
  let inFence = false;
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;

    // inline code (backtick) 보존 — escape 적용 안 함
    // 매우 보수적으로: `<word>` 패턴 (W는 영문/숫자/.-_) 만 entity escape
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
        // <단어> 형태 (HTML 안전 태그 제외) → escape
        const m = line.slice(i).match(/^<([A-Za-z][A-Za-z0-9._\-]*)>/);
        if (m) {
          const tag = m[1].toLowerCase();
          const safeTags = new Set([
            'br', 'hr', 'img', 'a', 'b', 'i', 'em', 'strong', 'span', 'div',
            'p', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'sub', 'sup', 'code', 'pre',
            'tabs', 'tabitem',
          ]);
          if (!safeTags.has(tag)) {
            out += '&lt;' + m[1] + '&gt;';
            i += m[0].length;
            continue;
          }
        }
        out += ch;
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

function collapseBlankLines(src) {
  return src.replace(/\n{3,}/g, '\n\n');
}

// ------------------------------------------------------------
// 페이지 타이틀 도출
// ------------------------------------------------------------
// ref → title (예: python_ping_protocol_2_0 → "Python Ping Protocol 2.0")
function deriveTitle(lang, exampleName) {
  // exampleName: ping_protocol_2_0
  const langLabel = LANGUAGES[lang].label;
  const parts = exampleName.split('_').map(part => {
    // "2", "0" 같은 숫자 보존
    if (/^\d+$/.test(part)) return part;
    return part.charAt(0).toUpperCase() + part.slice(1);
  });
  // protocol_2_0 → "Protocol 2.0" (마지막 두 숫자가 "X_Y" 형태일 때)
  // join 후 패턴 치환: Protocol 2 0 → Protocol 2.0 등 단순 처리
  let title = `${langLabel} ${parts.join(' ')}`;
  title = title.replace(/Protocol (\d+) (\d+)/g, 'Protocol $1.$2');
  return title;
}

// example name from filename (lang prefix 제거)
function extractExampleName(filename, lang) {
  // filename: c_ping_protocol_2_0.md → ping_protocol_2_0
  const base = filename.replace(/\.md$/, '');
  const prefix = lang + '_';
  if (base.startsWith(prefix)) return base.slice(prefix.length);
  return base;
}

// ------------------------------------------------------------
// 페이지 변환
// ------------------------------------------------------------
function convertPage(srcPath, lang, filename, position) {
  const raw = fs.readFileSync(srcPath, 'utf8');
  const { fm: srcFm, body: srcBody } = splitFrontmatter(raw);

  const exampleName = extractExampleName(filename, lang);
  const title = deriveTitle(lang, exampleName);
  // id는 파일 stem과 일치 (Docusaurus가 URL 슬러그로 사용)
  const id = exampleName;

  const newFm = {
    id,
    title,
    sidebar_label: title,
    sidebar_position: position,
    tags: ['dynamixel_sdk', 'sample_code', lang],
  };

  let body = convertBody(srcBody, { lang, exampleName, title });

  return {
    id,
    title,
    exampleName,
    content: buildFmYaml(newFm) + body.trimStart() + (body.endsWith('\n') ? '' : '\n'),
  };
}

// ------------------------------------------------------------
// ko fallback (en mirror + 안내 admonition)
// ------------------------------------------------------------
function buildKoMirror(enContent, title) {
  // en frontmatter 추출 → ko용으로 재구성
  const m = enContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return enContent;
  const fmText = m[1];
  const bodyText = m[2];

  const notice = '\n:::info\n\n한국어 번역 준비 중입니다. 아래는 영문 원본입니다.\n\n:::\n\n';
  return `---\n${fmText}\n---\n${notice}${bodyText}`;
}

// ------------------------------------------------------------
// _category_.json
// ------------------------------------------------------------
function writeCategoryJson(dir, label, position) {
  const data = {
    label,
    position,
    link: { type: 'generated-index' },
  };
  writeOut(path.join(dir, '_category_.json'), JSON.stringify(data, null, 2) + '\n');
}

// ------------------------------------------------------------
// 자산 복사
// ------------------------------------------------------------
function copyLabviewAssets() {
  const SRC = path.join(ASSET_SRC_ROOT, 'images/sw/sdk/dynamixel_sdk/library_setup/labview/windows/sample_code');
  const DST = path.join(ASSET_OUT_ROOT, 'software/dynamixel/dynamixel_sdk/sample_code/labview');
  if (!fs.existsSync(SRC)) {
    console.warn('[asset] source missing:', SRC);
    return 0;
  }
  let count = 0;
  function walk(d, rel) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      const next = rel ? path.join(rel, e.name) : e.name;
      if (e.isDirectory()) walk(full, next);
      else if (e.isFile()) {
        copyFile(full, path.join(DST, next));
        count++;
      }
    }
  }
  walk(SRC, '');
  return count;
}

// ------------------------------------------------------------
// 메인
// ------------------------------------------------------------
function main() {
  // sample_code 루트 디렉터리에 _category_.json (en/ko)
  ensureDir(OUT_EN);
  ensureDir(OUT_KO);
  writeCategoryJson(OUT_EN, 'Sample Code', 90);
  writeCategoryJson(OUT_KO, '샘플 코드', 90);

  const stats = {};
  const langs = Object.keys(LANGUAGES);

  for (const lang of langs) {
    const srcDir = path.join(SRC_EN, lang);
    if (!fs.existsSync(srcDir)) continue;
    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.md')).sort();

    const outEnLangDir = path.join(OUT_EN, lang);
    const outKoLangDir = path.join(OUT_KO, lang);
    ensureDir(outEnLangDir);
    ensureDir(outKoLangDir);
    writeCategoryJson(outEnLangDir, LANGUAGES[lang].label, LANGUAGES[lang].position);
    writeCategoryJson(outKoLangDir, LANGUAGES[lang].koLabel, LANGUAGES[lang].position);

    files.forEach((filename, idx) => {
      const srcPath = path.join(srcDir, filename);
      const position = idx + 1;
      const result = convertPage(srcPath, lang, filename, position);
      const outFilename = `${result.exampleName}.mdx`;

      const enOut = path.join(outEnLangDir, outFilename);
      const koOut = path.join(outKoLangDir, outFilename);
      writeOut(enOut, result.content);
      writeOut(koOut, buildKoMirror(result.content, result.title));
    });

    stats[lang] = files.length;
  }

  // 자산 복사
  const assetCount = copyLabviewAssets();

  console.log('SDK Sample Code conversion complete.');
  for (const [k, v] of Object.entries(stats)) console.log(`  ${k}: ${v} pages`);
  console.log(`  assets copied: ${assetCount}`);
  console.log(`  total: ${Object.values(stats).reduce((a, b) => a + b, 0)} pages × 2 (en/ko)`);
}

main();
