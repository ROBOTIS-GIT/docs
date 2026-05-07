#!/usr/bin/env node
/**
 * Platform / Manipulator (OpenMANIPULATOR-X / OpenMANIPULATOR-P / Manipulator-H / ai_manipulator_main)
 * 변환 스크립트.
 *
 * 입력:
 *   - source/docs/{en,kr}/platform/openmanipulator_x/*.md  (16 페이지)
 *   - source/docs/{en,kr}/platform/openmanipulator_p/*.md  (21 페이지, kr 없음)
 *   - source/docs/{en,kr}/platform/manipulator_h/*.md      (9 페이지, kr 1개만)
 *   - source/docs/{en,kr}/platform/ai_manipulator_main.md  (1 페이지)
 *   - source/_includes/{en,kr}/platform/openmanipulator_x/**\/*.md (partial fragments)
 *
 * 출력:
 *   - docusaurus/docs/platform/<series>/<ref>.mdx
 *   - docusaurus/i18n/ko/.../current/platform/<series>/<ref>.mdx
 *   - docusaurus/docs/_partials/platform/<series>/<frag>.mdx
 *   - docusaurus/i18n/ko/.../current/_partials/platform/<series>/<frag>.mdx
 *   - docusaurus/docs/platform/ai_manipulator_main.mdx + ko mirror
 *
 * 사용법: node scripts/convert-manipulators.js
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REPO = path.resolve(__dirname, '..');

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
    if (/^```/.test(line)) { inFence = !inFence; continue; }
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

function makeKramdownToMdx(seriesKey) {
  return function kramdownToMdx(src) {
    src = src.replace(/\{::options[^}]*\/\}/g, '');
    src = src.replace(/^\s*\*\s*\n\s*\{:toc\}\s*$/gm, '');
    src = src.replace(/\{:toc\}/g, '');
    src = src.replace(/\{:\s*\.text-center\}/g, '');
    src = src.replace(/\{:\s*\.blank\}/g, '');
    src = src.replace(/\{:\s*\.popup\}/g, '');
    src = src.replace(/\{:\s*width="[^"]*"\s*\}/g, '');
    src = src.replace(/\{:\s*style="[^"]*"\s*\}/g, '');

    src = src.replace(/<style>[\s\S]*?<\/style>/g, '');
    src = src.replace(/<div\s+style="counter-reset:[^"]*"\s*><\/div>/g, '');

    // Notice (admonitionConvert MUST run before the generic {:...} stripper below).
    src = admonitionConvert(src, /^\s*\{:\s*\.notice--danger\}\s*$/, 'danger');
    src = admonitionConvert(src, /^\s*\{:\s*\.notice--warning\}\s*$/, 'warning');
    src = admonitionConvert(src, /^\s*\{:\s*\.notice--info\}\s*$/, 'info');
    src = admonitionConvert(src, /^\s*\{:\s*\.notice--success\}\s*$/, 'tip');
    src = admonitionConvert(src, /^\s*\{:\s*\.notice\}\s*$/, 'note');

    // catch-all kramdown attribute remover (image attributes, leftover markers).
    src = src.replace(/\{:\s*[^}]*\}/g, '');

    // div notices
    src = src.replace(/<div\s+class="notice--success">([\s\S]*?)<\/div>/g, (_, b) => `\n:::tip\n\n${b.trim()}\n\n:::\n`);
    src = src.replace(/<div\s+class="notice--warning">([\s\S]*?)<\/div>/g, (_, b) => `\n:::warning\n\n${b.trim()}\n\n:::\n`);
    src = src.replace(/<div\s+class="notice--info">([\s\S]*?)<\/div>/g, (_, b) => `\n:::info\n\n${b.trim()}\n\n:::\n`);
    src = src.replace(/<div\s+class="notice--danger">([\s\S]*?)<\/div>/g, (_, b) => `\n:::danger\n\n${b.trim()}\n\n:::\n`);
    src = src.replace(/<div\s+class="notice">([\s\S]*?)<\/div>/g, (_, b) => `\n:::note\n\n${b.trim()}\n\n:::\n`);

    // 이미지 경로
    src = src.replace(/\/assets\/images\/platform\//g, '/img/platform/');
    src = src.replace(/\/assets\/images\//g, '/img/');
    // 기타 /assets/docs/... → 외부 URL
    src = src.replace(
      /\]\(\/assets\/([^)\s]+)\)/g,
      (_, p) => `](https://emanual.robotis.com/assets/${p})`
    );
    src = src.replace(
      /^(\[[^\]]+\]):\s*\/assets\/(\S+)$/gm,
      (_, label, p) => `${label}: https://emanual.robotis.com/assets/${p}`
    );

    // 페이지 ref (slug) 정규화: source 가 하이픈을 쓴 경우(`ros-controller-package`)
    // 우리 출력은 underscore (`ros_controller_package`) 이므로 첫 segment에서 - → _ 치환.
    // 단, 해당 시리즈에 underscore 버전 페이지가 존재할 때만.
    function normalizeSlug(p, knownRefs) {
      const segs = p.split('/');
      const candidate = segs[0].replace(/-/g, '_');
      if (knownRefs && knownRefs.has(candidate)) {
        segs[0] = candidate;
      }
      return segs.join('/');
    }

    const SERIES_REFS = {
      openmanipulator_x: new Set(['overview','specification','assembly','quick_start_guide','quick_start_guide_basic_operation','ros_controller_package','ros_controller_check_setting','ros_controller_msg','ros_controller_experiment','ros_operation','ros_simulation','ros_perceptions','ros_applications','tool_modification','mobile_manipulation','friends']),
      openmanipulator_p: new Set(['overview','specification','getting_started','ros_setup','ros_controller_package','ros_operation','ros_simulation','ros_tool','ros_perceptions','ros_controls','ros_applications','ros_manipulator_manager','ros2_setup','ros2_controller_package','ros2_operation','ros2_simulation','ros2_tools','ros2_perceptions','ros2_controls','ros2_applications','ros2_manipulator_manager']),
      manipulator_h: new Set(['introduction','getting_started','manipulator_sdk_programming','examples','references','manipulator_ros_programming','ros_example','ros_reference','firmware_recovery']),
    };

    // Manipulator 시리즈 내부 링크는 유지, 외부 영역 링크는 emanual.robotis.com 으로 강등
    const seriesRefs = SERIES_REFS[seriesKey] || new Set();
    function rewriteSeriesLink(p, hash, knownRefs) {
      const norm = normalizeSlug(p, knownRefs);
      const firstSeg = norm.split('/')[0];
      if (knownRefs.has(firstSeg)) {
        return `/docs/platform/${seriesKey}/${norm}${hash || ''}`;
      }
      // 알 수 없는 페이지 → 외부 URL 강등
      return null;
    }
    const internalSeriesPathRe = new RegExp(
      `\\]\\(\\/docs\\/(en|kr)\\/platform\\/${seriesKey}\\/([^)#\\s]+?)\\/?(#[^)\\s]*)?\\)`,
      'g'
    );
    src = src.replace(internalSeriesPathRe, (m, lang, p, hash) => {
      const r = rewriteSeriesLink(p, hash, seriesRefs);
      if (r) return `](${r})`;
      return `](https://emanual.robotis.com/docs/${lang}/platform/${seriesKey}/${p}/${hash || ''})`;
    });

    const internalSeriesRefRe = new RegExp(
      `^(\\[[^\\]]+\\]):\\s*\\/docs\\/(en|kr)\\/platform\\/${seriesKey}\\/([^\\s#]+?)\\/?(#[^\\s]*)?\\s*$`,
      'gm'
    );
    src = src.replace(internalSeriesRefRe, (m, label, lang, p, hash) => {
      const r = rewriteSeriesLink(p, hash, seriesRefs);
      if (r) return `${label}: ${r}`;
      return `${label}: https://emanual.robotis.com/docs/${lang}/platform/${seriesKey}/${p}/${hash || ''}`;
    });

    // ai_manipulator_main 등 다른 manipulator 시리즈 간 링크 유지
    const KNOWN_SERIES = ['openmanipulator_x', 'openmanipulator_p', 'manipulator_h'];
    for (const s of KNOWN_SERIES) {
      if (s === seriesKey) continue;
      const otherRefs = SERIES_REFS[s] || new Set();
      const re1 = new RegExp(`\\]\\(\\/docs\\/(en|kr)\\/platform\\/${s}\\/([^)#\\s]+?)\\/?(#[^)\\s]*)?\\)`, 'g');
      src = src.replace(re1, (m, lang, p, hash) => {
        const norm = normalizeSlug(p, otherRefs);
        const firstSeg = norm.split('/')[0];
        if (otherRefs.has(firstSeg)) return `](/docs/platform/${s}/${norm}${hash || ''})`;
        return `](https://emanual.robotis.com/docs/${lang}/platform/${s}/${p}/${hash || ''})`;
      });
      const re2 = new RegExp(`^(\\[[^\\]]+\\]):\\s*\\/docs\\/(en|kr)\\/platform\\/${s}\\/([^\\s#]+?)\\/?(#[^\\s]*)?\\s*$`, 'gm');
      src = src.replace(re2, (m, label, lang, p, hash) => {
        const norm = normalizeSlug(p, otherRefs);
        const firstSeg = norm.split('/')[0];
        if (otherRefs.has(firstSeg)) return `${label}: /docs/platform/${s}/${norm}${hash || ''}`;
        return `${label}: https://emanual.robotis.com/docs/${lang}/platform/${s}/${p}/${hash || ''}`;
      });
    }

    // ai_manipulator_main 자체 링크
    src = src.replace(
      /\]\(\/docs\/(en|kr)\/platform\/ai_manipulator_main\/?(#[^)\s]*)?\)/g,
      (_, lang, hash) => `](/docs/platform/ai_manipulator_main${hash || ''})`
    );

    // 절대 docs URL: 다른 변환 안 된 영역 → 외부 URL 강등
    src = src.replace(
      /\]\(\/docs\/(en|kr)\/(?!platform\/(?:openmanipulator_x|openmanipulator_p|manipulator_h|ai_manipulator_main))([^)#\s]+)(#[^)\s]*)?\)/g,
      (_, lang, p, hash) => `](https://emanual.robotis.com/docs/${lang}/${p}${hash || ''})`
    );
    src = src.replace(
      /^(\[[^\]]+\]):\s*\/docs\/(en|kr)\/(?!platform\/(?:openmanipulator_x|openmanipulator_p|manipulator_h|ai_manipulator_main))([^\s#]+)(#[^\s]*)?\s*$/gm,
      (_, label, lang, p, hash) => `${label}: https://emanual.robotis.com/docs/${lang}/${p}${hash || ''}`
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

    // typo: `[Foo](slug)` (bare anchor without `#`) → `[Foo](#slug)`
    src = src.replace(
      /\]\(([a-z][a-z0-9-]+)\]?\)/g,
      (m, anchor) => {
        if (/[\/\.:]/.test(anchor)) return m;
        return `](#${anchor})`;
      }
    );

    // HTML comments 제거
    src = src.replace(/<!--[\s\S]*?-->/g, '');

    // <br>, <hr>, <img> self-closing
    src = src.replace(/<br\s*>/g, '<br />');
    src = src.replace(/<hr\s*>/g, '<hr />');
    src = src.replace(/<img([^>]*[^\/])>/g, '<img$1 />');

    // <sup>*</sup> 등의 별표 escape
    src = src.replace(/<sup>([^<]*)<\/sup>/g, (m, inner) => {
      const escaped = inner.replace(/\*/g, '&#42;');
      return `<sup>${escaped}</sup>`;
    });
    src = src.replace(/<sub>([^<]*)<\/sub>/g, (m, inner) => {
      const escaped = inner.replace(/\*/g, '&#42;');
      return `<sub>${escaped}</sub>`;
    });

    // <img/<a>/<span>/<div>/<p>/<td> style="..." 제거 (JSX는 style={{...}} 객체 형식 필요)
    src = src.replace(/(<(?:img|a|span|div|p|td|tr|tbody|table|li|ul|ol|h\d|hr|br)[^>]*?)\s+style="[^"]*"([^>]*>)/gi, '$1$2');

    // Escape stray angle brackets that are not valid JSX/HTML tags but
    // are emphasised text or C++ template syntax in body text.
    // Operate line-by-line, skipping fenced code blocks.
    {
      const lines = src.split('\n');
      let inFence = false;
      for (let li = 0; li < lines.length; li++) {
        if (/^```/.test(lines[li])) { inFence = !inFence; continue; }
        if (inFence) continue;
        // <**...**> → &lt;**...**&gt;
        lines[li] = lines[li].replace(/<(\*\*[^<>]+\*\*)>/g, '&lt;$1&gt;');
        // std::vector<JointData>*  →  std::vector&lt;JointData&gt;*
        // Pattern: identifier::identifier<Identifier>...  -> escape < and >
        lines[li] = lines[li].replace(
          /([A-Za-z_][\w:]*)<([A-Z][A-Za-z0-9_]*)>/g,
          '$1&lt;$2&gt;'
        );
      }
      src = lines.join('\n');
    }

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
  };
}

// ----- 페이지 변환 -----
function convertPageFromRaw(raw, ref, lang, pageTitle, pagePosition, seriesKey, productGroup) {
  const { fm, body } = splitFrontmatter(raw);
  const ctx = {
    ref: fm.ref || ref,
    product_group: fm.product_group || productGroup,
    lang,
    tab_title1: fm.tab_title1 || '',
    tab_title2: fm.tab_title2 || '',
    tab_title3: fm.tab_title3 || '',
    tab_title4: fm.tab_title4 || '',
    tab_title5: fm.tab_title5 || '',
    tab_title6: fm.tab_title6 || '',
    vars: {},
  };

  const tabTitles = {};
  for (let i = 1; i <= 6; i++) {
    if (fm[`tab_title${i}`]) tabTitles[i] = fm[`tab_title${i}`];
  }

  const importsMap = new Map();

  function partialKeyForLocal(includeSpec) {
    const norm = includeSpec.replace(/^\/+/, '');
    const m = norm.match(new RegExp(`^(?:en|kr)\\/platform\\/${seriesKey}\\/(.+)\\.md$`));
    if (!m) return null;
    return m[1].replace(/[\/\-]/g, '_');
  }

  function handleInclude(spec) {
    const key = partialKeyForLocal(spec);
    if (!key) return `\n{/* include: ${spec} */}\n`;
    const varName = pascalCaseSegments(key);
    importsMap.set(key, varName);
    PARTIAL_QUEUE.push({ key, spec, lang, seriesKey });
    return `\n<${varName} />\n`;
  }

  const tokens = tokenize(body);
  let rendered = render(tokens, ctx, handleInclude);

  // <section data-id="..."> → <Tabs>/<TabItem>
  const sectionLiteralRe = /<section\s+data-id=(?:"|')([^"']+)(?:"|')[^>]*>\s*([\s\S]*?)\s*<\/section>/g;
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
      const merged = new Map();
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

  // Kramdown → MDX
  const kramdownToMdx = makeKramdownToMdx(seriesKey);
  rendered = kramdownToMdx(rendered);

  // Frontmatter
  const titleFromFm = pageTitle || fm.title || (fm.sidebar && fm.sidebar.title);
  const newFm = {
    id: ref,
    title: titleFromFm || ref,
    sidebar_label: undefined,
    sidebar_position: pagePosition !== undefined ? pagePosition : (fm.page_number ? parseInt(fm.page_number, 10) : undefined),
    tags: [productGroup],
  };
  if (Number.isNaN(newFm.sidebar_position)) newFm.sidebar_position = undefined;

  const fmStr = buildFmYaml(newFm);

  const importLines = [];
  if (hasTabs) {
    importLines.push("import Tabs from '@theme/Tabs';");
    importLines.push("import TabItem from '@theme/TabItem';");
  }
  for (const [key, varName] of importsMap) {
    importLines.push(`import ${varName} from '@site/docs/_partials/platform/${seriesKey}/${key}.mdx';`);
  }
  const importsBlock = importLines.length ? importLines.join('\n') + '\n\n' : '';

  return fmStr + importsBlock + rendered.trim() + '\n';
}

// ----- Partial 처리 -----
const PARTIAL_QUEUE = [];
const PARTIAL_DONE = new Set();

function convertPartial(spec, lang, seriesKey) {
  const norm = spec.replace(/^\/+/, '');
  const localized = norm.replace(/^(en|kr)\//, lang + '/');
  let full = path.join(REPO, 'source', '_includes', localized);
  let raw = readSafe(full);
  if (raw === null) {
    if (lang === 'kr') {
      const fallback = path.join(REPO, 'source', '_includes', norm.replace(/^kr\//, 'en/'));
      raw = readSafe(fallback);
    }
    if (raw === null) return null;
  }
  const ctx = {
    ref: seriesKey,
    product_group: seriesKey,
    lang,
    vars: {},
  };
  const nestedImports = new Map();
  function nestedInclude(s) {
    const sNorm = s.replace(/^\/+/, '');
    const m = sNorm.match(new RegExp(`^(?:en|kr)\\/platform\\/${seriesKey}\\/(.+)\\.md$`));
    if (!m) return `\n{/* nested include: ${s} */}\n`;
    const key = m[1].replace(/[\/\-]/g, '_');
    const varName = pascalCaseSegments(key);
    nestedImports.set(key, varName);
    PARTIAL_QUEUE.push({ key, spec: s, lang, seriesKey });
    return `\n<${varName} />\n`;
  }
  const tokens = tokenize(raw);
  let rendered = render(tokens, ctx, nestedInclude);
  const kramdownToMdx = makeKramdownToMdx(seriesKey);
  rendered = kramdownToMdx(rendered);
  let importsBlock = '';
  if (nestedImports.size > 0) {
    const importLines = [];
    for (const [key, varName] of nestedImports) {
      importLines.push(`import ${varName} from '@site/docs/_partials/platform/${seriesKey}/${key}.mdx';`);
    }
    importsBlock = importLines.join('\n') + '\n\n';
  }
  return importsBlock + rendered.trim() + '\n';
}

// ----- 시리즈 정의 -----
const SERIES = {
  openmanipulator_x: {
    label: 'OpenMANIPULATOR-X',
    productGroup: 'openmanipulator_x',
    sourceDir: 'openmanipulator_x',
    pages: [
      { src: 'overview.md',                          ref: 'overview',                       title: 'Overview',                       position: 1 },
      { src: 'specification.md',                     ref: 'specification',                  title: 'Specification',                  position: 2 },
      { src: 'assembly.md',                          ref: 'assembly',                       title: 'Assembly',                       position: 3 },
      { src: 'quick_start_guide.md',                 ref: 'quick_start_guide',              title: 'Quick Start Guide',              position: 4 },
      { src: 'quick_start_guide_basic_operation.md', ref: 'quick_start_guide_basic_operation', title: 'Quick Start: Basic Operation', position: 5 },
      { src: 'ros_controller_package.md',            ref: 'ros_controller_package',         title: 'ROS Controller Package',         position: 6 },
      { src: 'ros_controller_check_setting.md',      ref: 'ros_controller_check_setting',   title: 'ROS Controller Check Setting',   position: 7 },
      { src: 'ros_controller_msg.md',                ref: 'ros_controller_msg',             title: 'ROS Controller Messages',        position: 8 },
      { src: 'ros_controller_experiment.md',         ref: 'ros_controller_experiment',      title: 'ROS Controller Experiment',      position: 9 },
      { src: 'ros_operation.md',                     ref: 'ros_operation',                  title: 'ROS Operation',                  position: 10 },
      { src: 'ros_simulation.md',                    ref: 'ros_simulation',                 title: 'ROS Simulation',                 position: 11 },
      { src: 'ros_perceptions.md',                   ref: 'ros_perceptions',                title: 'ROS Perceptions',                position: 12 },
      { src: 'ros_applications.md',                  ref: 'ros_applications',               title: 'ROS Applications',               position: 13 },
      { src: 'tool_modification.md',                 ref: 'tool_modification',              title: 'Tool Modification',              position: 14 },
      { src: 'mobile_manipulation.md',               ref: 'mobile_manipulation',            title: 'Mobile Manipulation',            position: 15 },
      { src: 'friends.md',                           ref: 'friends',                        title: 'Friends',                        position: 16 },
    ],
    koOverrides: {
      'overview': 'overview.md',
    },
  },
  openmanipulator_p: {
    label: 'OpenMANIPULATOR-P',
    productGroup: 'openmanipulator_p',
    sourceDir: 'openmanipulator_p',
    pages: [
      { src: 'overview.md',                  ref: 'overview',                  title: 'Overview',                position: 1 },
      { src: 'specification.md',             ref: 'specification',             title: 'Specification',           position: 2 },
      { src: 'getting_started.md',           ref: 'getting_started',           title: 'Getting Started',         position: 3 },
      { src: 'ros_setup.md',                 ref: 'ros_setup',                 title: '[ROS] Setup',             position: 4 },
      { src: 'ros_controller_package.md',    ref: 'ros_controller_package',    title: '[ROS] Controller Package', position: 5 },
      { src: 'ros_operation.md',             ref: 'ros_operation',             title: '[ROS] Operation',         position: 6 },
      { src: 'ros_simulation.md',            ref: 'ros_simulation',            title: '[ROS] Simulation',        position: 7 },
      { src: 'ros_tool.md',                  ref: 'ros_tool',                  title: '[ROS] Tool',              position: 8 },
      { src: 'ros_perceptions.md',           ref: 'ros_perceptions',           title: '[ROS] Perceptions',       position: 9 },
      { src: 'ros_controls.md',              ref: 'ros_controls',              title: '[ROS] Controls',          position: 10 },
      { src: 'ros_applications.md',          ref: 'ros_applications',          title: '[ROS] Applications',      position: 11 },
      { src: 'ros_manipulator_manager.md',   ref: 'ros_manipulator_manager',   title: '[ROS] Manipulator Manager', position: 12 },
      { src: 'ros2_setup.md',                ref: 'ros2_setup',                title: '[ROS 2] Setup',           position: 13 },
      { src: 'ros2_controller_package.md',   ref: 'ros2_controller_package',   title: '[ROS 2] Controller Package', position: 14 },
      { src: 'ros2_operation.md',            ref: 'ros2_operation',            title: '[ROS 2] Operation',       position: 15 },
      { src: 'ros2_simulation.md',           ref: 'ros2_simulation',           title: '[ROS 2] Simulation',      position: 16 },
      { src: 'ros2_tools.md',                ref: 'ros2_tools',                title: '[ROS 2] Tools',           position: 17 },
      { src: 'ros2_perceptions.md',          ref: 'ros2_perceptions',          title: '[ROS 2] Perceptions',     position: 18 },
      { src: 'ros2_controls.md',             ref: 'ros2_controls',             title: '[ROS 2] Controls',        position: 19 },
      { src: 'ros2_applications.md',         ref: 'ros2_applications',         title: '[ROS 2] Applications',    position: 20 },
      { src: 'ros2_manipulator_manager.md',  ref: 'ros2_manipulator_manager',  title: '[ROS 2] Manipulator Manager', position: 21 },
    ],
    koOverrides: {},
  },
  manipulator_h: {
    label: 'Manipulator H',
    productGroup: 'manipulator_h',
    sourceDir: 'manipulator_h',
    pages: [
      { src: 'introduction.md',                 ref: 'introduction',                 title: 'Introduction',                 position: 1 },
      { src: 'getting_started.md',              ref: 'getting_started',              title: 'Getting Started',              position: 2 },
      { src: 'manipulator_sdk_programming.md',  ref: 'manipulator_sdk_programming',  title: 'Manipulator SDK Programming',  position: 3 },
      { src: 'examples.md',                     ref: 'examples',                     title: 'Examples',                     position: 4 },
      { src: 'references.md',                   ref: 'references',                   title: 'References',                   position: 5 },
      { src: 'manipulator_ros_programming.md',  ref: 'manipulator_ros_programming',  title: 'Manipulator ROS Programming',  position: 6 },
      { src: 'ros_example.md',                  ref: 'ros_example',                  title: 'ROS Example',                  position: 7 },
      { src: 'ros_reference.md',                ref: 'ros_reference',                title: 'ROS Reference',                position: 8 },
      { src: 'firmware_recovery.md',            ref: 'firmware_recovery',            title: 'Firmware Recovery',            position: 9 },
    ],
    koOverrides: {
      'introduction': 'introduction.md',
    },
  },
};

// ----- 실행 -----
function runSeries(seriesKey, stats) {
  const series = SERIES[seriesKey];
  const SRC_EN_ROOT = path.join(REPO, 'source', 'docs', 'en', 'platform', series.sourceDir);
  const SRC_KR_ROOT = path.join(REPO, 'source', 'docs', 'kr', 'platform', series.sourceDir);
  const OUT_DOC_EN = path.join(REPO, 'docusaurus', 'docs', 'platform', seriesKey);
  const OUT_DOC_KO = path.join(REPO, 'docusaurus', 'i18n', 'ko', 'docusaurus-plugin-content-docs', 'current', 'platform', seriesKey);
  const OUT_PART_EN = path.join(REPO, 'docusaurus', 'docs', '_partials', 'platform', seriesKey);
  const OUT_PART_KO = path.join(REPO, 'docusaurus', 'i18n', 'ko', 'docusaurus-plugin-content-docs', 'current', '_partials', 'platform', seriesKey);

  ensureDir(OUT_DOC_EN);
  ensureDir(OUT_DOC_KO);
  ensureDir(OUT_PART_EN);
  ensureDir(OUT_PART_KO);

  // _category_.json
  const categoryPositionMap = {
    openmanipulator_x: 5,
    openmanipulator_p: 6,
    manipulator_h: 7,
  };
  const catPos = categoryPositionMap[seriesKey] || 10;
  writeOut(
    path.join(OUT_DOC_EN, '_category_.json'),
    JSON.stringify({ label: series.label, position: catPos, link: { type: 'generated-index' } }, null, 2) + '\n'
  );
  writeOut(
    path.join(OUT_DOC_KO, '_category_.json'),
    JSON.stringify({ label: series.label, position: catPos, link: { type: 'generated-index' } }, null, 2) + '\n'
  );

  for (const page of series.pages) {
    const enSrc = path.join(SRC_EN_ROOT, page.src);
    const enRaw = readSafe(enSrc);
    if (enRaw !== null) {
      try {
        const out = convertPageFromRaw(enRaw, page.ref, 'en', page.title, page.position, seriesKey, series.productGroup);
        writeOut(path.join(OUT_DOC_EN, `${page.ref}.mdx`), out);
        stats.en++;
      } catch (e) { stats.errors.push(`${seriesKey}/en/${page.ref}: ${e.message}`); }
    } else {
      stats.errors.push(`${seriesKey}/en/${page.ref}: source missing (${enSrc})`);
    }

    let koRaw = null;
    const koOverride = series.koOverrides[page.ref];
    if (koOverride) {
      koRaw = readSafe(path.join(SRC_KR_ROOT, koOverride));
    }
    if (koRaw === null && enRaw !== null) {
      koRaw = enRaw;
    }
    if (koRaw !== null) {
      try {
        let out = convertPageFromRaw(koRaw, page.ref, 'kr', page.title, page.position, seriesKey, series.productGroup);
        if (!koOverride) {
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
      } catch (e) { stats.errors.push(`${seriesKey}/ko/${page.ref}: ${e.message}`); }
    }
  }

  // partial flush — 시리즈마다
  while (PARTIAL_QUEUE.length > 0) {
    const q = PARTIAL_QUEUE.shift();
    const sig = `${q.lang}|${q.seriesKey}|${q.key}`;
    if (PARTIAL_DONE.has(sig)) continue;
    PARTIAL_DONE.add(sig);
    try {
      const content = convertPartial(q.spec, q.lang, q.seriesKey);
      const dir = q.lang === 'en'
        ? path.join(REPO, 'docusaurus', 'docs', '_partials', 'platform', q.seriesKey)
        : path.join(REPO, 'docusaurus', 'i18n', 'ko', 'docusaurus-plugin-content-docs', 'current', '_partials', 'platform', q.seriesKey);
      if (content === null) {
        stats.errors.push(`partial ${q.lang}/${q.seriesKey}/${q.key}: source missing`);
        const stub = `{/* TODO: missing source for ${q.spec} */}\n`;
        writeOut(path.join(dir, `${q.key}.mdx`), stub);
        if (q.lang === 'en') stats.partials_en++; else stats.partials_ko++;
        continue;
      }
      writeOut(path.join(dir, `${q.key}.mdx`), content);
      if (q.lang === 'en') stats.partials_en++; else stats.partials_ko++;
    } catch (e) { stats.errors.push(`partial ${q.lang}/${q.seriesKey}/${q.key}: ${e.message}`); }
  }
}

function runAiManipulatorMain(stats) {
  const SRC_EN = path.join(REPO, 'source', 'docs', 'en', 'platform', 'ai_manipulator_main.md');
  const SRC_KR = path.join(REPO, 'source', 'docs', 'kr', 'platform', 'ai_manipulator_main.md');
  const OUT_EN = path.join(REPO, 'docusaurus', 'docs', 'platform', 'ai_manipulator_main.mdx');
  const OUT_KO = path.join(REPO, 'docusaurus', 'i18n', 'ko', 'docusaurus-plugin-content-docs', 'current', 'platform', 'ai_manipulator_main.mdx');

  const enRaw = readSafe(SRC_EN);
  if (enRaw !== null) {
    try {
      // 시리즈 키는 임의의 'ai_manipulator_main' 으로 — partial 사용은 없음
      const out = convertPageFromRaw(enRaw, 'ai_manipulator_main', 'en', 'AI Manipulator', 100, 'ai_manipulator_main', 'ai_manipulator');
      writeOut(OUT_EN, out);
      stats.en++;
    } catch (e) { stats.errors.push(`ai_manipulator_main/en: ${e.message}`); }
  } else {
    stats.errors.push(`ai_manipulator_main/en: source missing`);
  }

  let koRaw = readSafe(SRC_KR);
  let isKoOverride = koRaw !== null;
  if (koRaw === null && enRaw !== null) koRaw = enRaw;
  if (koRaw !== null) {
    try {
      let out = convertPageFromRaw(koRaw, 'ai_manipulator_main', 'kr', 'AI Manipulator', 100, 'ai_manipulator_main', 'ai_manipulator');
      if (!isKoOverride) {
        const match = out.match(/^(---\n[\s\S]*?\n---\n\n(?:import [^\n]+\n)*\n?)/);
        if (match) {
          const head = match[1];
          const rest = out.slice(head.length);
          out = head + ':::info\n\n한국어 번역은 준비 중입니다. 영문 콘텐츠를 그대로 표시합니다.\n\n:::\n\n' + rest;
        }
      }
      writeOut(OUT_KO, out);
      stats.ko++;
    } catch (e) { stats.errors.push(`ai_manipulator_main/ko: ${e.message}`); }
  }
}

function run() {
  const stats = { en: 0, ko: 0, partials_en: 0, partials_ko: 0, errors: [] };

  for (const seriesKey of ['openmanipulator_x', 'openmanipulator_p', 'manipulator_h']) {
    runSeries(seriesKey, stats);
  }
  runAiManipulatorMain(stats);

  console.log('Done.', JSON.stringify(stats, null, 2));
  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    stats.errors.forEach(e => console.log('  -', e));
  }
}

run();
