#!/usr/bin/env node
/**
 * Platform / TurtleBot3 변환 스크립트.
 *
 * 입력:
 *   - source/docs/en/platform/turtlebot3/**\/*.md  (46 페이지)
 *   - source/docs/kr/platform/turtlebot3/*.md      (overview.md, index.md만 존재)
 *   - source/_includes/en/platform/turtlebot3/**\/*.md (수많은 fragment)
 *
 * 출력:
 *   - docusaurus/docs/platform/turtlebot3/<ref>.mdx
 *   - docusaurus/i18n/ko/.../current/platform/turtlebot3/<ref>.mdx
 *   - docusaurus/docs/_partials/platform/turtlebot3/<frag>.mdx
 *   - docusaurus/i18n/ko/.../current/_partials/platform/turtlebot3/<frag>.mdx
 *
 * 특이사항:
 *   - tabs 컴포넌트: tabs frontmatter와 <section data-id="{{ page.tab_title* }}"> 패턴을
 *     <Tabs>/<TabItem> MDX 컴포넌트로 변환.
 *   - Korean: 원본이 거의 없음 → en 컨텐츠를 그대로 미러 (locale=kr로 다시 평가)하고
 *     상단에 "한국어 번역은 준비 중" notice 표시.
 *
 * 사용법: node scripts/convert-turtlebot3.js
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REPO = path.resolve(__dirname, '..');
const SRC_EN_ROOT = path.join(REPO, 'source', 'docs', 'en', 'platform', 'turtlebot3');
const SRC_KR_ROOT = path.join(REPO, 'source', 'docs', 'kr', 'platform', 'turtlebot3');
const INC_EN_ROOT = path.join(REPO, 'source', '_includes', 'en', 'platform', 'turtlebot3');
const INC_KR_ROOT = path.join(REPO, 'source', '_includes', 'kr', 'platform', 'turtlebot3');
const OUT_DOC_EN = path.join(REPO, 'docusaurus', 'docs', 'platform', 'turtlebot3');
const OUT_DOC_KO = path.join(REPO, 'docusaurus', 'i18n', 'ko', 'docusaurus-plugin-content-docs', 'current', 'platform', 'turtlebot3');
const OUT_PART_EN = path.join(REPO, 'docusaurus', 'docs', '_partials', 'platform', 'turtlebot3');
const OUT_PART_KO = path.join(REPO, 'docusaurus', 'i18n', 'ko', 'docusaurus-plugin-content-docs', 'current', '_partials', 'platform', 'turtlebot3');

// ----- 유틸 -----
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function writeOut(p, c) { ensureDir(path.dirname(p)); fs.writeFileSync(p, c); }
function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } }

function pascalCaseSegments(s) {
  let r = s.split(/[_\-\/.]+/).filter(Boolean)
    .map(x => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join('');
  if (/^\d/.test(r)) r = 'P' + r;
  return r;
}

// ----- Frontmatter -----
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

// ----- Liquid parser -----
function tokenize(src) {
  const tokens = [];
  const re = /\{%-?\s*([\s\S]*?)\s*-?%\}|\{\{\s*([\s\S]*?)\s*\}\}/g;
  let last = 0, m;
  while ((m = re.exec(src)) !== null) {
    if (m.index > last) tokens.push({ type: 'text', value: src.slice(last, m.index) });
    if (m[1] !== undefined) tokens.push({ type: 'tag', value: m[1].trim() });
    else tokens.push({ type: 'output', value: m[2].trim() });
    last = re.lastIndex;
  }
  if (last < src.length) tokens.push({ type: 'text', value: src.slice(last) });
  return tokens;
}

function evalAtomic(cond, ctx) {
  cond = cond.trim();
  let m;
  if ((m = cond.match(/^page\.(\w+)\s*(==|!=)\s*['"]([^'"]*)['"]$/))) {
    const v = ctx[m[1]];
    return m[2] === '==' ? v === m[3] : v !== m[3];
  }
  if ((m = cond.match(/^page\.(\w+)$/))) return Boolean(ctx[m[1]]);
  if ((m = cond.match(/^(\w+)\s*(==|!=)\s*['"]([^'"]*)['"]$/))) {
    const v = ctx.vars[m[1]];
    return m[2] === '==' ? v === m[3] : v !== m[3];
  }
  if ((m = cond.match(/^['"]([^'"]*)['"]\s*(==|!=)\s*['"]([^'"]*)['"]$/))) {
    return m[2] === '==' ? m[1] === m[3] : m[1] !== m[3];
  }
  return false;
}

function evalCond(expr, ctx) {
  expr = expr.replace(/^\s*(if|elsif|unless)\s+/, '').trim();
  if (expr.includes(' or ')) return expr.split(/\s+or\s+/).some(c => evalAtomic(c, ctx));
  if (expr.includes(' and ')) return expr.split(/\s+and\s+/).every(c => evalAtomic(c, ctx));
  return evalAtomic(expr, ctx);
}

function evalOutput(expr, ctx) {
  const pipes = expr.split('|').map(s => s.trim());
  let base = pipes[0];
  let val;
  let m;
  if ((m = base.match(/^page\.(\w+)$/))) {
    val = ctx[m[1]];
  } else if (ctx.vars && Object.prototype.hasOwnProperty.call(ctx.vars, base)) {
    val = ctx.vars[base];
  }
  if (val === undefined) return `{{ ${expr} }}`;
  return String(val);
}

function render(tokens, ctx, includeHandler) {
  let out = '';
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t.type === 'text') { out += t.value; i++; continue; }
    if (t.type === 'output') { out += evalOutput(t.value, ctx); i++; continue; }
    const tag = t.value;
    if (/^assign\s+/.test(tag)) {
      const m = tag.match(/^assign\s+(\w+)\s*=\s*(.+)$/);
      if (m) {
        let raw = m[2].trim();
        if ((raw[0] === '"' && raw.endsWith('"')) || (raw[0] === "'" && raw.endsWith("'"))) {
          ctx.vars[m[1]] = raw.slice(1, -1);
        } else if (/^\w+$/.test(raw) && Object.prototype.hasOwnProperty.call(ctx.vars, raw)) {
          ctx.vars[m[1]] = ctx.vars[raw];
        } else {
          ctx.vars[m[1]] = raw;
        }
      }
      i++; continue;
    }
    if (/^capture\s+/.test(tag)) {
      const name = tag.match(/^capture\s+(\w+)$/)[1];
      const sub = []; i++;
      let depth = 1;
      while (i < tokens.length && depth > 0) {
        const tt = tokens[i];
        if (tt.type === 'tag') {
          if (/^capture\s+/.test(tt.value)) { depth++; sub.push(tt); }
          else if (tt.value === 'endcapture') { depth--; if (depth === 0) { i++; break; } else sub.push(tt); }
          else sub.push(tt);
        } else sub.push(tt);
        i++;
      }
      ctx.vars[name] = render(sub, ctx, includeHandler);
      continue;
    }
    if (/^if\b/.test(tag) || /^unless\b/.test(tag)) {
      const branches = [];
      let curCond = tag;
      let curTokens = [];
      i++;
      let depth = 1;
      while (i < tokens.length && depth > 0) {
        const tt = tokens[i];
        if (tt.type === 'tag') {
          if (/^if\b/.test(tt.value) || /^unless\b/.test(tt.value)) { depth++; curTokens.push(tt); }
          else if (tt.value === 'endif' || tt.value === 'endunless') {
            depth--;
            if (depth === 0) { branches.push({ cond: curCond, tokens: curTokens }); i++; break; }
            else curTokens.push(tt);
          } else if (depth === 1 && (/^elsif\b/.test(tt.value) || tt.value === 'else')) {
            branches.push({ cond: curCond, tokens: curTokens });
            curCond = tt.value;
            curTokens = [];
          } else curTokens.push(tt);
        } else curTokens.push(tt);
        i++;
      }
      let chosen = null;
      for (const b of branches) {
        if (b.cond === 'else') { chosen = b; break; }
        if (/^unless\b/.test(b.cond)) {
          if (!evalCond(b.cond.replace(/^unless\b/, 'if'), ctx)) { chosen = b; break; }
        } else if (evalCond(b.cond, ctx)) { chosen = b; break; }
      }
      if (chosen) out += render(chosen.tokens, ctx, includeHandler);
      continue;
    }
    if (/^include\s+/.test(tag)) {
      const m = tag.match(/^include\s+(\S+)/);
      if (m && includeHandler) out += includeHandler(m[1].replace(/^\//, ''));
      i++; continue;
    }
    // unknown tag — skip
    i++;
  }
  return out;
}

// ----- Kramdown / MDX 변환 -----
function escapeMdxBraces(src) {
  const lines = src.split('\n');
  let inFence = false;
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
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
        // 모든 brace를 escape — turtlebot3 콘텐츠에는 진짜 JSX expression 변수가
        // 거의 없고 대부분 shell 변수(`${TB3_MODEL}` 등)이므로 안전하게 escape.
        if (inner === '') {
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
  src = src.replace(/\{::options[^}]*\/\}/g, '');
  src = src.replace(/^\s*\*\s*\n\s*\{:toc\}\s*$/gm, '');
  src = src.replace(/\{:toc\}/g, '');
  src = src.replace(/\{:\s*\.text-center\}/g, '');
  src = src.replace(/\{:\s*\.blank\}/g, '');
  src = src.replace(/\{:\s*\.popup\}/g, '');
  // 잔여 width/style 주입 attribute
  src = src.replace(/\{:\s*width="[^"]*"\s*\}/g, '');
  src = src.replace(/\{:\s*style="[^"]*"\s*\}/g, '');
  // Kramdown attribute on image: ![](url){: width="30px"} → 그냥 제거
  src = src.replace(/\{:\s*[^}]*\}/g, '');

  // 카운터 / inline style 블록 제거
  src = src.replace(/<style>[\s\S]*?<\/style>/g, '');
  src = src.replace(/<div\s+style="counter-reset:[^"]*"\s*><\/div>/g, '');

  // Notice
  src = admonitionConvert(src, /^\s*\{:\s*\.notice--danger\}\s*$/, 'danger');
  src = admonitionConvert(src, /^\s*\{:\s*\.notice--warning\}\s*$/, 'warning');
  src = admonitionConvert(src, /^\s*\{:\s*\.notice--info\}\s*$/, 'info');
  src = admonitionConvert(src, /^\s*\{:\s*\.notice--success\}\s*$/, 'tip');
  src = admonitionConvert(src, /^\s*\{:\s*\.notice\}\s*$/, 'note');

  // div notices
  src = src.replace(/<div\s+class="notice--success">([\s\S]*?)<\/div>/g, (_, b) => `\n:::tip\n\n${b.trim()}\n\n:::\n`);
  src = src.replace(/<div\s+class="notice--warning">([\s\S]*?)<\/div>/g, (_, b) => `\n:::warning\n\n${b.trim()}\n\n:::\n`);
  src = src.replace(/<div\s+class="notice--info">([\s\S]*?)<\/div>/g, (_, b) => `\n:::info\n\n${b.trim()}\n\n:::\n`);
  src = src.replace(/<div\s+class="notice--danger">([\s\S]*?)<\/div>/g, (_, b) => `\n:::danger\n\n${b.trim()}\n\n:::\n`);
  src = src.replace(/<div\s+class="notice">([\s\S]*?)<\/div>/g, (_, b) => `\n:::note\n\n${b.trim()}\n\n:::\n`);

  // 이미지 경로
  src = src.replace(/\/assets\/images\/platform\//g, '/img/platform/');
  src = src.replace(/\/assets\/images\//g, '/img/');
  // 기타 /assets/docs/... → 외부 URL (emanual.robotis.com 에 호스팅됨)
  src = src.replace(
    /\]\(\/assets\/([^)\s]+)\)/g,
    (_, p) => `](https://emanual.robotis.com/assets/${p})`
  );
  src = src.replace(
    /^(\[[^\]]+\]):\s*\/assets\/(\S+)$/gm,
    (_, label, p) => `${label}: https://emanual.robotis.com/assets/${p}`
  );

  // 절대 docs URL: 다른 변환 안 된 영역 → 외부 URL 강등
  src = src.replace(
    /\]\(\/docs\/(en|kr)\/(?!platform\/turtlebot3\/)([^)#\s]+)(#[^)\s]*)?\)/g,
    (_, lang, p, hash) => `](https://emanual.robotis.com/docs/${lang}/${p}${hash || ''})`
  );
  src = src.replace(
    /^(\[[^\]]+\]):\s*\/docs\/(en|kr)\/(?!platform\/turtlebot3\/)([^\s#]+)(#[^\s]*)?$/gm,
    (_, label, lang, p, hash) => `${label}: https://emanual.robotis.com/docs/${lang}/${p}${hash || ''}`
  );

  // turtlebot3 내부 링크: /docs/en/platform/turtlebot3/<page>/  → /docs/platform/turtlebot3/<page>
  // permalink slug → 파일명 매핑 (예: quick-start → quick_start)
  const slugToRef = {
    'quick-start': 'quick_start',
  };
  // 현재 변환된 페이지 ref 집합 (이 안에 없으면 외부 URL 강등)
  const KNOWN_REFS = new Set([
    'overview', 'challenges', 'features', 'common_notice', 'export_turtlebot3_model',
    'quick_start', 'sbc_setup', 'opencr_setup', 'hardware_setup', 'bringup',
    'basic_operation', 'docker_setup', 'teleoperation', 'basic_examples',
    'simulation', 'slam_simulation', 'nav_simulation', 'fakenode_simulation',
    'standalone_gazebo_simulation', 'slam', 'navigation', 'manipulation',
    'home_service_challenge', 'autonomous_driving', 'autonomous_driving_autorace',
    'machine_learning', 'tensorflow', 'applications', 'locomotion',
    'learn', 'projects', 'videos', 'appendixes', 'additional_sensors',
    'appendix_dynamixel', 'appendix_lds_01', 'appendix_lds_02', 'appendix_lds_03',
    'appendix_opencr1_0', 'appendix_raspi_cam', 'appendix_realsense',
    'compatible_devices', 'other_ros_versions', 'opensource', 'contact_us', 'faq',
  ]);
  function mapSlug(p) {
    const segs = p.split('/');
    if (slugToRef[segs[0]]) segs[0] = slugToRef[segs[0]];
    return segs.join('/');
  }
  function rewriteTb3Link(p, hash, lang) {
    const mapped = mapSlug(p);
    const firstSeg = mapped.split('/')[0];
    if (KNOWN_REFS.has(firstSeg)) {
      return `/docs/platform/turtlebot3/${mapped}${hash || ''}`;
    }
    // 알 수 없는 페이지 → 외부 URL 강등
    return `https://emanual.robotis.com/docs/${lang}/platform/turtlebot3/${p}/${hash || ''}`;
  }
  src = src.replace(
    /\]\(\/docs\/(en|kr)\/platform\/turtlebot3\/([^)#\s]+?)\/?(#[^)\s]*)?\)/g,
    (_, lang, p, hash) => `](${rewriteTb3Link(p, hash, lang)})`
  );
  src = src.replace(
    /^(\[[^\]]+\]):\s*\/docs\/(en|kr)\/platform\/turtlebot3\/([^\s#]+?)\/?(#[^\s]*)?$/gm,
    (_, label, lang, p, hash) => `${label}: ${rewriteTb3Link(p, hash, lang)}`
  );

  // 정적 자산 reference 정의 → inline anchor
  {
    const refs = new Map();
    src = src.replace(
      /^\[([^\]]+)\]:\s*(\/img\/[^\s]+)\s*$/gm,
      (m, label, url) => {
        refs.set(label.trim().toLowerCase(), url);
        return '';
      }
    );
    if (refs.size > 0) {
      src = src.replace(/\[([^\]]+)\]/g, (m, label) => {
        const url = refs.get(label.trim().toLowerCase());
        if (!url) return m;
        return `<a href="${url}" target="_blank">${label}</a>`;
      });
    }
  }

  src = src.replace(
    /\[([^\]\[]+)\]\((\/img\/[^)\s]+\.(?:jpg|jpeg|png|gif|svg|pdf|webp))\)/g,
    (m, label, url) => `<a href="${url}" target="_blank">${label}</a>`
  );

  // 원본 typo: `[Foo](slug)` 또는 `[Foo](slug])` (bare anchor without `#`) → `[Foo](#slug)`
  src = src.replace(
    /\]\(([a-z][a-z0-9-]+)\]?\)/g,
    (m, anchor) => {
      if (/[\/\.:]/.test(anchor)) return m;
      return `](#${anchor})`;
    }
  );

  // HTML comments 제거
  src = src.replace(/<!--[\s\S]*?-->/g, '');

  // <br> → <br />
  src = src.replace(/<br\s*>/g, '<br />');
  src = src.replace(/<hr\s*>/g, '<hr />');
  // <img> self-closing
  src = src.replace(/<img([^>]*[^\/])>/g, '<img$1 />');
  // <iframe>은 닫는 태그가 있으므로 그대로 둠

  // <sup>*</sup>, <sub>*</sub>, <sup>**</sup> 등 — MDX 파서가 *를 emphasis로 잘못 해석.
  // HTML entity로 escape.
  src = src.replace(/<sup>([^<]*)<\/sup>/g, (m, inner) => {
    const escaped = inner.replace(/\*/g, '&#42;');
    return `<sup>${escaped}</sup>`;
  });
  src = src.replace(/<sub>([^<]*)<\/sub>/g, (m, inner) => {
    const escaped = inner.replace(/\*/g, '&#42;');
    return `<sub>${escaped}</sub>`;
  });

  // <img ... style="key: value; ..."> — JSX는 객체 형식 필요. 단순화: style 속성 제거.
  // (대부분 width/height는 hard-coded inline style이므로 제거해도 시각적 손상 적음)
  src = src.replace(/(<img[^>]*?)\s+style="[^"]*"([^>]*>)/g, '$1$2');
  src = src.replace(/(<a[^>]*?)\s+style="[^"]*"([^>]*>)/g, '$1$2');

  // MDX brace escaping
  src = escapeMdxBraces(src);

  // 헤딩 anchor 정리
  src = src.replace(
    /^(#{1,6})((?:\s*<a name="[^"]+"><\/a>)+)(.*)$/gm,
    (m, h, anchors, rest) => `${h}${rest}`
  );
  src = src.replace(
    /^(#{1,6})\s*\*\*\[([^\]]+?)\]\(#[^)]+\)\*\*\s*$/gm,
    '$1 $2'
  );
  src = src.replace(
    /^(#{1,6})\s*\[([^\]]+?)\]\(#[^)]+\)\s*$/gm,
    '$1 $2'
  );
  src = src.replace(
    /^(#{1,6})\s*\*\*([^*]+)\*\*\s*$/gm,
    '$1 $2'
  );

  return src;
}

// ----- Section/Tab 처리 -----
/**
 * 본문에서 <section data-id="{{ page.tab_titleN }}"> ... </section> 블록을 찾아
 * 인접한 그룹별로 <Tabs>/<TabItem> 으로 변환.
 *
 * 실제 패턴:
 *   <section data-id="{{ page.tab_title1 }}" class="tab_contents">
 *   <body>
 *   </section>
 *   <section data-id="{{ page.tab_title2 }}" class="tab_contents">
 *   <body>
 *   </section>
 *   <section data-id="{{ page.tab_title3 }}" class="tab_contents">
 *   <body>
 *   </section>
 *
 * 원본 frontmatter의 tab_title1, tab_title2, ... 값을 label로 사용.
 */
function processTabSections(body, tabTitles) {
  // 블록을 직접 정규식으로 추출
  const sectionRe = /<section\s+data-id=(?:"|')\{\{\s*page\.tab_title(\d+)\s*\}\}(?:"|')[^>]*>\s*([\s\S]*?)\s*<\/section>/g;
  // 인접한 section 그룹을 찾아 한 번에 변환
  // 전략: 모든 매치를 추출 → 같은 위치에 인접하면 한 그룹
  const matches = [];
  let m;
  while ((m = sectionRe.exec(body)) !== null) {
    matches.push({ start: m.index, end: m.index + m[0].length, num: parseInt(m[1], 10), inner: m[2] });
  }
  if (matches.length === 0) return { body, hasTabs: false };

  // group inputs by adjacency (separator between sections is whitespace only)
  const groups = [];
  let cur = [matches[0]];
  for (let i = 1; i < matches.length; i++) {
    const prev = matches[i - 1];
    const sep = body.slice(prev.end, matches[i].start);
    if (/^\s*$/.test(sep)) cur.push(matches[i]);
    else { groups.push(cur); cur = [matches[i]]; }
  }
  groups.push(cur);

  // 그룹마다 <Tabs>/<TabItem> 으로 치환
  // groupId 는 그룹 내 첫 section의 순번을 기준으로 'ros' 사용 (단일 페이지 내 모든 그룹 같은 ID로 동기화)
  let result = '';
  let cursor = 0;
  let hasTabs = false;
  for (const g of groups) {
    result += body.slice(cursor, g[0].start);
    hasTabs = true;
    let tabs = `\n<Tabs groupId="ros" queryString>\n`;
    for (const sec of g) {
      const label = tabTitles[sec.num] || `Tab${sec.num}`;
      const value = label.toLowerCase().replace(/\s+/g, '-');
      tabs += `<TabItem value="${value}" label="${label}">\n\n${sec.inner.trim()}\n\n</TabItem>\n`;
    }
    tabs += `</Tabs>\n`;
    result += tabs;
    cursor = g[g.length - 1].end;
  }
  result += body.slice(cursor);
  return { body: result, hasTabs };
}

// ----- Partial 처리 -----
const PARTIAL_QUEUE = [];
const PARTIAL_DONE = new Set();

/**
 * include path → partial key
 * "en/platform/turtlebot3/quick_start/quickstart_humble.md" → key "quick_start_quickstart_humble"
 * "en/platform/turtlebot3/slam/slam_intro_humble.md" → "slam_slam_intro_humble"
 * "en/platform/turtlebot3/autonomous_driving/humble/foo.md" → "autonomous_driving_humble_foo"
 */
function partialKeyFor(includeSpec) {
  const norm = includeSpec.replace(/^\/+/, '');
  let m = norm.match(/^(?:en|kr)\/platform\/turtlebot3\/(.+)\.md$/);
  if (!m) return null;
  return m[1].replace(/[\/\-]/g, '_');
}

function importVarFor(partialKey) {
  return pascalCaseSegments(partialKey);
}

// ----- 페이지 변환 -----
function convertPageFromRaw(raw, ref, lang, srcDir, pageTitle, pagePosition) {
  const { fm, body } = splitFrontmatter(raw);
  const ctx = {
    ref: fm.ref || ref,
    product_group: fm.product_group || 'turtlebot3',
    lang,
    tab_title1: fm.tab_title1 || '',
    tab_title2: fm.tab_title2 || '',
    tab_title3: fm.tab_title3 || '',
    tab_title4: fm.tab_title4 || '',
    tab_title5: fm.tab_title5 || '',
    vars: {},
  };

  // tab_titles 매핑
  const tabTitles = {};
  for (let i = 1; i <= 5; i++) {
    if (fm[`tab_title${i}`]) tabTitles[i] = fm[`tab_title${i}`];
  }

  const importsMap = new Map();

  function handleInclude(spec) {
    const key = partialKeyFor(spec);
    if (!key) return `\n{/* include: ${spec} */}\n`;
    const varName = importVarFor(key);
    importsMap.set(key, varName);
    PARTIAL_QUEUE.push({ key, spec, lang });
    return `\n<${varName} />\n`;
  }

  // 1) tab_title* 변수가 본문에서도 사용됨 → ctx에 frontmatter 값 그대로 포함되었음 (위)
  // 2) Liquid 평가 (include는 partial로 치환)
  const tokens = tokenize(body);
  let rendered = render(tokens, ctx, handleInclude);

  // 3) <section data-id="{{ page.tab_titleN }}"> → <Tabs>/<TabItem>
  // tokens 평가 단계에서 {{ page.tab_titleN }} 가 이미 치환되었을 수 있으나,
  // section 블록 내부의 Liquid attribute는 src 자체가 raw로 전달되어 평가됐으므로
  // 본문의 data-id는 실제 라벨로 치환되었다. 호환성 차원에서 두 경우 모두 처리.
  const sectionLiteralRe = /<section\s+data-id=(?:"|')([^"']+)(?:"|')[^>]*>\s*([\s\S]*?)\s*<\/section>/g;
  // 인접 section 그룹 처리
  const matches = [];
  let mm;
  while ((mm = sectionLiteralRe.exec(rendered)) !== null) {
    matches.push({ start: mm.index, end: mm.index + mm[0].length, label: mm[1], inner: mm[2] });
  }
  let hasTabs = false;
  if (matches.length > 0) {
    const groups = [];
    let cur = [matches[0]];
    for (let i = 1; i < matches.length; i++) {
      const prev = matches[i - 1];
      const sep = rendered.slice(prev.end, matches[i].start);
      if (/^\s*$/.test(sep)) cur.push(matches[i]);
      else { groups.push(cur); cur = [matches[i]]; }
    }
    groups.push(cur);

    let result = '';
    let cursor = 0;
    for (const g of groups) {
      result += rendered.slice(cursor, g[0].start);
      hasTabs = true;
      // 같은 라벨이 그룹에 여러 번 나타나면 컨텐츠 합침 (duplicate value 방지)
      const merged = new Map(); // value → { label, parts: string[] }
      for (const sec of g) {
        let label = sec.label.trim();
        const m2 = label.match(/page\.tab_title(\d+)/);
        if (m2) label = tabTitles[parseInt(m2[1], 10)] || `Tab${m2[1]}`;
        const value = label.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
        if (!merged.has(value)) merged.set(value, { label, parts: [] });
        merged.get(value).parts.push(sec.inner.trim());
      }
      let tabs = `\n<Tabs groupId="ros" queryString>\n`;
      for (const [value, item] of merged) {
        tabs += `<TabItem value="${value}" label="${item.label}">\n\n${item.parts.join('\n\n')}\n\n</TabItem>\n`;
      }
      tabs += `</Tabs>\n`;
      result += tabs;
      cursor = g[g.length - 1].end;
    }
    result += rendered.slice(cursor);
    rendered = result;
  }

  // 4) Kramdown → MDX
  rendered = kramdownToMdx(rendered);

  // 5) Frontmatter
  const titleFromFm = pageTitle || fm.title || (fm.sidebar && fm.sidebar.title);
  const newFm = {
    id: ref,
    title: titleFromFm || ref,
    sidebar_label: undefined,
    sidebar_position: pagePosition !== undefined ? pagePosition : (fm.page_number ? parseInt(fm.page_number, 10) : undefined),
    tags: fm.product_group ? [fm.product_group] : ['turtlebot3'],
  };
  if (Number.isNaN(newFm.sidebar_position)) newFm.sidebar_position = undefined;

  const fmStr = buildFmYaml(newFm);

  // imports
  const importLines = [];
  if (hasTabs) {
    importLines.push("import Tabs from '@theme/Tabs';");
    importLines.push("import TabItem from '@theme/TabItem';");
  }
  for (const [key, varName] of importsMap) {
    importLines.push(`import ${varName} from '@site/docs/_partials/platform/turtlebot3/${key}.mdx';`);
  }
  const importsBlock = importLines.length ? importLines.join('\n') + '\n\n' : '';

  return fmStr + importsBlock + rendered.trim() + '\n';
}

function convertPartial(spec, lang) {
  const norm = spec.replace(/^\/+/, '');
  // locale 교체
  const localized = norm.replace(/^(en|kr)\//, lang + '/');
  let full = path.join(REPO, 'source', '_includes', localized);
  let raw = readSafe(full);
  if (raw === null) {
    // ko 없으면 en으로 fallback
    if (lang === 'kr') {
      const fallback = path.join(REPO, 'source', '_includes', norm.replace(/^kr\//, 'en/'));
      raw = readSafe(fallback);
    }
    if (raw === null) return null;
  }
  const ctx = {
    ref: 'turtlebot3',
    product_group: 'turtlebot3',
    lang,
    vars: {},
  };
  const nestedImports = new Map();
  function nestedInclude(s) {
    const key = partialKeyFor(s);
    if (!key) return `\n{/* nested include: ${s} */}\n`;
    const varName = importVarFor(key);
    nestedImports.set(key, varName);
    PARTIAL_QUEUE.push({ key, spec: s, lang });
    return `\n<${varName} />\n`;
  }
  const tokens = tokenize(raw);
  let rendered = render(tokens, ctx, nestedInclude);
  rendered = kramdownToMdx(rendered);
  // 중첩 partial용 imports 생성
  let importsBlock = '';
  if (nestedImports.size > 0) {
    const importLines = [];
    for (const [key, varName] of nestedImports) {
      importLines.push(`import ${varName} from '@site/docs/_partials/platform/turtlebot3/${key}.mdx';`);
    }
    importsBlock = importLines.join('\n') + '\n\n';
  }
  return importsBlock + rendered.trim() + '\n';
}

// ----- 페이지 매핑 -----
// 원본 위치 → 출력 ref (파일명, frontmatter id)
const PAGES = [
  { src: 'overview/overview.md',                      ref: 'overview',                       title: 'Overview',                           position: 1 },
  { src: 'overview/challenges.md',                    ref: 'challenges',                     title: 'Challenges',                         position: 2 },
  { src: 'features/features.md',                      ref: 'features',                       title: 'Features',                           position: 3 },
  { src: 'quick_start/quick_start.md',                ref: 'quick_start',                    title: 'Quick Start Guide',                  position: 10 },
  { src: 'quick_start/sbc_setup.md',                  ref: 'sbc_setup',                      title: 'SBC Setup',                          position: 11 },
  { src: 'quick_start/opencr_setup.md',               ref: 'opencr_setup',                   title: 'OpenCR Setup',                       position: 12 },
  { src: 'quick_start/hardware_setup.md',             ref: 'hardware_setup',                 title: 'Hardware Setup',                     position: 13 },
  { src: 'quick_start/bringup.md',                    ref: 'bringup',                        title: 'Bringup',                            position: 14 },
  { src: 'quick_start/basic_operation.md',            ref: 'basic_operation',                title: 'Basic Operation',                    position: 15 },
  { src: 'quick_start/docker_setup.md',               ref: 'docker_setup',                   title: 'Docker Setup',                       position: 16 },
  { src: 'basic_examples/basic_examples.md',          ref: 'basic_examples',                 title: 'Basic Examples',                     position: 20 },
  { src: 'simulation/simulation.md',                  ref: 'simulation',                     title: 'Simulation',                         position: 30 },
  { src: 'simulation/slam_simulation.md',             ref: 'slam_simulation',                title: 'SLAM Simulation',                    position: 31 },
  { src: 'simulation/nav_simulation.md',              ref: 'nav_simulation',                 title: 'Navigation Simulation',              position: 32 },
  { src: 'simulation/fakenode_simulation.md',         ref: 'fakenode_simulation',            title: 'Fake Node Simulation',               position: 33 },
  { src: 'simulation/standalone_gazebo_simulation.md',ref: 'standalone_gazebo_simulation',   title: 'Standalone Gazebo Simulation',       position: 34 },
  { src: 'slam/slam.md',                              ref: 'slam',                           title: 'SLAM',                               position: 40 },
  { src: 'navigation/navigation.md',                  ref: 'navigation',                     title: 'Navigation',                         position: 41 },
  { src: 'manipulation/manipulation.md',              ref: 'manipulation',                   title: 'Manipulation',                       position: 50 },
  { src: 'manipulation/home_service_challenge.md',    ref: 'home_service_challenge',         title: 'Home Service Challenge',             position: 51 },
  { src: 'autonomous_driving/autonomous_driving.md',  ref: 'autonomous_driving',             title: 'Autonomous Driving',                 position: 60 },
  { src: 'autonomous_driving/autonomous_driving_autorace.md', ref: 'autonomous_driving_autorace', title: 'Autonomous Driving (AutoRace)', position: 61 },
  { src: 'machine_learning/machine_learning.md',      ref: 'machine_learning',               title: 'Machine Learning',                   position: 70 },
  { src: 'applications/applications.md',              ref: 'applications',                   title: 'Applications',                       position: 80 },
  { src: 'friends(locomotion)/locomotion.md',         ref: 'locomotion',                     title: 'TurtleBot3 Friends',                 position: 81 },
  { src: 'learn/learn.md',                            ref: 'learn',                          title: 'Learn',                              position: 90 },
  { src: 'learn/projects.md',                         ref: 'projects',                       title: 'Projects',                           position: 91 },
  { src: 'learn/videos.md',                           ref: 'videos',                         title: 'Videos',                             position: 92 },
  { src: 'more_info/appendixes.md',                   ref: 'appendixes',                     title: 'Appendixes',                         position: 100 },
  { src: 'more_info/additional_sensors.md',           ref: 'additional_sensors',             title: 'Additional Sensors',                 position: 101 },
  { src: 'more_info/appendix_dynamixel.md',           ref: 'appendix_dynamixel',             title: 'Appendix: DYNAMIXEL',                position: 102 },
  { src: 'more_info/appendix_lds_01.md',              ref: 'appendix_lds_01',                title: 'Appendix: LDS-01',                   position: 103 },
  { src: 'more_info/appendix_lds_02.md',              ref: 'appendix_lds_02',                title: 'Appendix: LDS-02',                   position: 104 },
  { src: 'more_info/appendix_lds_03.md',              ref: 'appendix_lds_03',                title: 'Appendix: LDS-03',                   position: 105 },
  { src: 'more_info/appendix_opencr1_0.md',           ref: 'appendix_opencr1_0',             title: 'Appendix: OpenCR 1.0',               position: 106 },
  { src: 'more_info/appendix_raspi_cam.md',           ref: 'appendix_raspi_cam',             title: 'Appendix: Raspberry Pi Camera',      position: 107 },
  { src: 'more_info/appendix_realsense.md',           ref: 'appendix_realsense',             title: 'Appendix: RealSense',                position: 108 },
  { src: 'more_info/compatible_devices.md',           ref: 'compatible_devices',             title: 'Compatible Devices',                 position: 109 },
  { src: 'more_info/other_ros_versions.md',           ref: 'other_ros_versions',             title: 'Other ROS Versions',                 position: 110 },
  { src: 'more_info/opensource.md',                   ref: 'opensource',                     title: 'Open Source',                        position: 111 },
  { src: 'more_info/contact_us.md',                   ref: 'contact_us',                     title: 'Contact Us',                         position: 112 },
  { src: 'faq/faq.md',                                ref: 'faq',                            title: 'FAQ',                                position: 120 },
  { src: 'common_notice.md',                          ref: 'common_notice',                  title: 'Common Notice',                      position: 5 },
  { src: 'export_turtlebot3_model.md',                ref: 'export_turtlebot3_model',        title: 'Export TURTLEBOT3_MODEL',            position: 17 },
  { src: 'teleoperation.md',                          ref: 'teleoperation',                  title: 'Teleoperation',                      position: 18 },
  { src: 'tensorflow.md',                             ref: 'tensorflow',                     title: 'TensorFlow',                         position: 71 },
];

// Korean override pages (한국어 원본 있음)
const KO_OVERRIDES = {
  // ko의 overview.md → en의 overview/overview.md ref와 동일
  'overview': 'overview.md',
};

// ----- 실행 -----
function run() {
  ensureDir(OUT_DOC_EN);
  ensureDir(OUT_DOC_KO);
  ensureDir(OUT_PART_EN);
  ensureDir(OUT_PART_KO);

  // _category_.json
  writeOut(
    path.join(OUT_DOC_EN, '_category_.json'),
    JSON.stringify({ label: 'TurtleBot3', position: 1, link: { type: 'generated-index' } }, null, 2) + '\n'
  );
  writeOut(
    path.join(OUT_DOC_KO, '_category_.json'),
    JSON.stringify({ label: 'TurtleBot3', position: 1, link: { type: 'generated-index' } }, null, 2) + '\n'
  );

  const stats = { en: 0, ko: 0, partials_en: 0, partials_ko: 0, errors: [] };

  for (const page of PAGES) {
    const enSrc = path.join(SRC_EN_ROOT, page.src);
    const enRaw = readSafe(enSrc);
    if (enRaw !== null) {
      try {
        const out = convertPageFromRaw(enRaw, page.ref, 'en', path.dirname(enSrc), page.title, page.position);
        writeOut(path.join(OUT_DOC_EN, `${page.ref}.mdx`), out);
        stats.en++;
      } catch (e) { stats.errors.push(`en/${page.ref}: ${e.message}`); }
    } else {
      stats.errors.push(`en/${page.ref}: source missing (${enSrc})`);
    }

    // ko: override 있으면 사용, 없으면 en raw를 lang=kr로 변환 + 한국어 안내 notice 부착
    let koRaw = null;
    const koOverride = KO_OVERRIDES[page.ref];
    if (koOverride) {
      koRaw = readSafe(path.join(SRC_KR_ROOT, koOverride));
    }
    if (koRaw === null && enRaw !== null) {
      koRaw = enRaw;
    }
    if (koRaw !== null) {
      try {
        let out = convertPageFromRaw(koRaw, page.ref, 'kr', SRC_KR_ROOT, page.title, page.position);
        // Korean fallback notice (when 원본이 en에서 미러된 경우)
        // imports 블록 다음에 notice 부착하기 위해, frontmatter+imports 끝 위치를 찾음
        if (!koOverride) {
          // frontmatter `---\n...\n---\n\n` 다음, 이어지는 import 라인 끝까지 스킵 후 notice 삽입
          const match = out.match(/^(---\n[\s\S]*?\n---\n\n(?:import [^\n]+\n)*\n?)/);
          if (match) {
            const head = match[1];
            const rest = out.slice(head.length);
            out = head + ':::info\n\n한국어 번역은 준비 중입니다. 영문 콘텐츠를 그대로 표시합니다.\n\n:::\n\n' + rest;
          } else {
            out = out.replace(/^---\n([\s\S]*?)\n---\n\n/, (m) => {
              return m + ':::info\n\n한국어 번역은 준비 중입니다. 영문 콘텐츠를 그대로 표시합니다.\n\n:::\n\n';
            });
          }
        }
        writeOut(path.join(OUT_DOC_KO, `${page.ref}.mdx`), out);
        stats.ko++;
      } catch (e) { stats.errors.push(`ko/${page.ref}: ${e.message}`); }
    }
  }

  // partial flush
  while (PARTIAL_QUEUE.length > 0) {
    const q = PARTIAL_QUEUE.shift();
    const sig = `${q.lang}|${q.key}`;
    if (PARTIAL_DONE.has(sig)) continue;
    PARTIAL_DONE.add(sig);
    try {
      const content = convertPartial(q.spec, q.lang);
      if (content === null) {
        stats.errors.push(`partial ${q.lang}/${q.key}: source missing`);
        // 빈 stub 파일 생성 (broken import 방지)
        const stub = `{/* TODO: missing source for ${q.spec} */}\n`;
        const dir = q.lang === 'en' ? OUT_PART_EN : OUT_PART_KO;
        writeOut(path.join(dir, `${q.key}.mdx`), stub);
        if (q.lang === 'en') stats.partials_en++; else stats.partials_ko++;
        continue;
      }
      const dir = q.lang === 'en' ? OUT_PART_EN : OUT_PART_KO;
      writeOut(path.join(dir, `${q.key}.mdx`), content);
      if (q.lang === 'en') stats.partials_en++; else stats.partials_ko++;
    } catch (e) { stats.errors.push(`partial ${q.lang}/${q.key}: ${e.message}`); }
  }

  console.log('Done.', JSON.stringify(stats, null, 2));
  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    stats.errors.forEach(e => console.log('  -', e));
  }
}

run();
