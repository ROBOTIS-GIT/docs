#!/usr/bin/env node
/**
 * Platform / Rest (RH-P12-RN, OMY, msgs, common, platform.md)
 * 변환 스크립트.
 *
 * 입력:
 *   - source/docs/{en,kr}/platform/rh_p12_rn/*.md   (en 7, kr 8)
 *   - source/docs/{en,kr}/platform/rh_p12_rn_main.md (en 1, kr 1)
 *   - source/docs/{en,kr}/platform/omy/*.md         (en 6, kr 1)
 *   - source/docs/en/platform/msgs/*.md             (en 26)
 *   - source/docs/en/platform/common/*.md           (en 5)
 *   - source/docs/{en,kr}/platform/platform.md      (en/kr 1)
 *
 * 출력:
 *   - docusaurus/docs/platform/rh_p12_rn/<ref>.mdx (rh_p12_rn / rh_p12_rna / rh_p12_rn_ur 페이지 모두 같은 폴더)
 *   - docusaurus/docs/platform/rh_p12_rn_main.mdx
 *   - docusaurus/docs/platform/omy/<ref>.mdx
 *   - docusaurus/docs/platform/msgs/<ref>.mdx
 *   - docusaurus/docs/platform/common/<ref>.mdx
 *   - docusaurus/docs/platform/index.mdx
 *   - docusaurus/docs/_partials/platform/omy/<frag>.mdx
 *   - docusaurus/i18n/ko/.../current/platform/... (ko mirror)
 *
 * 특이사항:
 *   - rh_p12_rn 시리즈는 dxl/pro/<frag> partial을 다수 import (이미 변환되어 있음)
 *   - OMY는 자체 partial (operation/, simulation/, imitation_learning/) 사용
 *   - msgs / common 은 partial / liquid 거의 없음 (단순 reference)
 *
 * 사용법: node scripts/convert-platform-rest.js
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

// ----- Liquid parser (재사용) -----
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
  // markdownify 등은 무시 — capture 본문을 그대로 출력
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
    i++;
  }
  return out;
}

// ----- div notice 변환을 markdownify 출력 직후에 적용 -----
function convertCapturedDivNotices(src) {
  // <div class="notice--xxx">CONTENT</div> → :::xxx CONTENT :::
  // capture로 만든 markdown 변수가 그대로 출력되므로 그 뒤의 <div class=...> 패턴 처리
  src = src.replace(/<div\s+class="notice--success">\s*([\s\S]*?)\s*<\/div>/g, (_, b) => `\n:::tip\n\n${b.trim()}\n\n:::\n`);
  src = src.replace(/<div\s+class="notice--warning">\s*([\s\S]*?)\s*<\/div>/g, (_, b) => `\n:::warning\n\n${b.trim()}\n\n:::\n`);
  src = src.replace(/<div\s+class="notice--info">\s*([\s\S]*?)\s*<\/div>/g, (_, b) => `\n:::info\n\n${b.trim()}\n\n:::\n`);
  src = src.replace(/<div\s+class="notice--danger">\s*([\s\S]*?)\s*<\/div>/g, (_, b) => `\n:::danger\n\n${b.trim()}\n\n:::\n`);
  src = src.replace(/<div\s+class="notice">\s*([\s\S]*?)\s*<\/div>/g, (_, b) => `\n:::note\n\n${b.trim()}\n\n:::\n`);
  return src;
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

// 알려진 페이지 ref (시리즈별 내부 링크 인식)
const SERIES_PAGE_REFS = {
  rh_p12_rn: new Set(['rh_p12_rn', 'rh_p12_rna', 'rh_p12_rn_ur', 'rh_p12_rn_dr', 'examples', 'examples_rna', 'gazebo', 'gazebo_rna']),
  omy: new Set(['overview', 'specification', 'quick_start_guide', 'ros2_operation', 'ros2_simulation', 'ros2_imitation_learning']),
  msgs: new Set([
    'BalanceParam_msg', 'DampingBalanceParam_msg', 'GetPresentJointOffsetData_srv',
    'JointFeedBackGain_msg', 'JointOffsetPositionData_msg', 'JointTorqueOnOff_msg',
    'JointTorqueOnOffArray_msg', 'PoseXYZRPY_msg', 'PoseZRPY_msg',
    'Step2D_msg', 'Step2DArray_msg', 'StepData_msg', 'StepPositionData_msg', 'StepTimeData_msg',
    'geometry_msgs_Pose2D_msg', 'geometry_msgs_Pose_msg',
    'op3_GetPresentJointOffsetData_srv', 'op3_JointOffsetPositionData_msg', 'op3_JointPose_msg',
    'op3_JointTorqueOnOff_msg', 'op3_JointTorqueOnOffArray_msg', 'op3_KinematicsPose_msg',
    'op3_PreviewRequest_msg', 'op3_PreviewResponse_msg', 'op3_WalkingParam_msg',
    'std_msgs_header',
  ]),
  common: new Set(['arduino_examples_op3', 'arduino_setup_linux', 'humanoid_navigation', 'op3_robot_operating_system', 'robotis_math']),
};

// rh_p12_rn 페이지의 source ref → output ref 매핑 (rh_p12_rn 시리즈는 자체 페이지명을 ref로 사용)
const RHP12_PAGE_MAP = {
  // source filename -> {ref, productGroup, title}
  'rh_p12_rn.md':       { ref: 'rh_p12_rn',     productGroup: 'rh_p12_rn',     title: 'RH-P12-RN' },
  'rh-p12-rna.md':      { ref: 'rh_p12_rna',    productGroup: 'rh_p12_rna',    title: 'RH-P12-RN(A)' },
  'rh_p12_rn_ur.md':    { ref: 'rh_p12_rn_ur',  productGroup: 'rh_p12_rn_ur',  title: 'RH-P12-RN-UR' },
  'rh_p12_rn_dr.md':    { ref: 'rh_p12_rn_dr',  productGroup: 'rh_p12_rn_dr',  title: 'RH-P12-RN-DR' },
  'examples.md':        { ref: 'examples',      productGroup: 'rh_p12_rn',     title: 'RH-P12-RN Examples' },
  'examples_rna.md':    { ref: 'examples_rna',  productGroup: 'rh_p12_rna',    title: 'RH-P12-RN(A) Examples' },
  'gazebo.md':          { ref: 'gazebo',        productGroup: 'rh_p12_rn',     title: 'RH-P12-RN Gazebo' },
  'gazebo_rna.md':      { ref: 'gazebo_rna',    productGroup: 'rh_p12_rna',    title: 'RH-P12-RN(A) Gazebo' },
};

// 다른 시리즈 (manipulator 등) 로의 cross-link 보존을 위한 known refs
const KNOWN_PLATFORM_SERIES = {
  openmanipulator_x: new Set(['overview', 'specification', 'assembly', 'quick_start_guide', 'quick_start_guide_basic_operation', 'ros_controller_package', 'ros_controller_check_setting', 'ros_controller_msg', 'ros_controller_experiment', 'ros_operation', 'ros_simulation', 'ros_perceptions', 'ros_applications', 'tool_modification', 'mobile_manipulation', 'friends']),
  openmanipulator_p: new Set(['overview', 'specification', 'getting_started', 'ros_setup', 'ros_controller_package', 'ros_operation', 'ros_simulation', 'ros_tool', 'ros_perceptions', 'ros_controls', 'ros_applications', 'ros_manipulator_manager', 'ros2_setup', 'ros2_controller_package', 'ros2_operation', 'ros2_simulation', 'ros2_tools', 'ros2_perceptions', 'ros2_controls', 'ros2_applications', 'ros2_manipulator_manager']),
  manipulator_h: new Set(['introduction', 'getting_started', 'manipulator_sdk_programming', 'examples', 'references', 'manipulator_ros_programming', 'ros_example', 'ros_reference', 'firmware_recovery']),
  op3: new Set(['introduction', 'getting_started', 'application', 'arduino_setup', 'opencr_setup', 'robotis_op3_common', 'robotis_op3_demo', 'robotis_op3_tutorials', 'tools']),
  op2: new Set(['getting_started', 'reference']),
  op: new Set(['getting_started', 'tools', 'opencm_setup', 'arduino_setup', 'reference']),
  thormang3: new Set(['introduction', 'quick_start', 'getting_started', 'parts_list', 'ros_packages', 'thormang3_kinematics_dynamics', 'thormang3_simulation']),
  turtlebot3: new Set(['overview']),
  rh_p12_rn: SERIES_PAGE_REFS.rh_p12_rn,
  omy: SERIES_PAGE_REFS.omy,
  msgs: SERIES_PAGE_REFS.msgs,
  common: SERIES_PAGE_REFS.common,
};

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

    // Notice
    src = admonitionConvert(src, /^\s*\{:\s*\.notice--danger\s*\}\s*$/, 'danger');
    src = admonitionConvert(src, /^\s*\{:\s*\.notice--warning\s*\}\s*$/, 'warning');
    src = admonitionConvert(src, /^\s*\{:\s*\.notice--info\s*\}\s*$/, 'info');
    src = admonitionConvert(src, /^\s*\{:\s*\.notice--success\s*\}\s*$/, 'tip');
    src = admonitionConvert(src, /^\s*\{:\s*\.notice\s*\}\s*$/, 'note');

    // catch-all kramdown attribute remover
    src = src.replace(/\{:\s*[^}]*\}/g, '');

    // div notices (capture로 만든 본문이 인라인된 경우 포함)
    src = convertCapturedDivNotices(src);

    // 이미지 경로
    src = src.replace(/\/assets\/images\/platform\//g, '/img/platform/');
    src = src.replace(/\/assets\/images\//g, '/img/');
    src = src.replace(
      /\]\(\/assets\/([^)\s]+)\)/g,
      (_, p) => `](https://emanual.robotis.com/assets/${p})`
    );
    src = src.replace(
      /^(\[[^\]]+\]):\s*\/assets\/(\S+)$/gm,
      (_, label, p) => `${label}: https://emanual.robotis.com/assets/${p}`
    );

    function normalizeSlug(p, knownRefs) {
      const segs = p.split('/');
      const candidate = segs[0].replace(/-/g, '_');
      if (knownRefs && knownRefs.has(candidate)) {
        segs[0] = candidate;
      }
      return segs.join('/');
    }

    // 자기 자신 시리즈 내부 링크 (rh_p12_rn 시리즈는 모든 ref가 rh_p12_rn 폴더 안)
    // rh_p12_rn / rh_p12_rna / rh_p12_rn_ur 등의 별도 path들을 폴더로 mount
    if (seriesKey === 'rh_p12_rn') {
      // /docs/{en|kr}/platform/rh_p12_rn/ → /docs/platform/rh_p12_rn/rh_p12_rn
      // /docs/{en|kr}/platform/rh_p12_rna/ → /docs/platform/rh_p12_rn/rh_p12_rna
      // /docs/{en|kr}/platform/rh_p12_rn_ur/ → /docs/platform/rh_p12_rn/rh_p12_rn_ur
      // /docs/{en|kr}/platform/rh_p12_rn_dr/ → /docs/platform/rh_p12_rn/rh_p12_rn_dr
      // /docs/{en|kr}/platform/rh_p12_rn/examples → /docs/platform/rh_p12_rn/examples
      // /docs/{en|kr}/platform/rh_p12_rn/gazebo → /docs/platform/rh_p12_rn/gazebo
      const rnRefs = SERIES_PAGE_REFS.rh_p12_rn;
      // 형태 A: /docs/<lang>/platform/<page>/(#hash)?  where page in {rh_p12_rn, rh_p12_rna, rh_p12_rn_ur, rh_p12_rn_dr}
      // rh_p12_rn 자기 자신은 폴더 인덱스 슬러그(/docs/platform/rh_p12_rn) 로 라우팅됨 (파일명-폴더명 동일)
      const subPagesA = [
        { src: 'rh_p12_rn',     out: '/docs/platform/rh_p12_rn' },
        { src: 'rh_p12_rna',    out: '/docs/platform/rh_p12_rn/rh_p12_rna' },
        { src: 'rh_p12_rn_ur',  out: '/docs/platform/rh_p12_rn/rh_p12_rn_ur' },
        { src: 'rh_p12_rn_dr',  out: '/docs/platform/rh_p12_rn/rh_p12_rn_dr' },
      ];
      for (const sp of subPagesA) {
        const re = new RegExp(`\\]\\(\\/docs\\/(en|kr)\\/platform\\/${sp.src}\\/?(#[^)\\s]*)?\\)`, 'g');
        src = src.replace(re, (m, lang, hash) => `](${sp.out}${hash || ''})`);
        const re2 = new RegExp(`^(\\[[^\\]]+\\]):\\s*\\/docs\\/(en|kr)\\/platform\\/${sp.src}\\/?(#[^\\s]*)?\\s*$`, 'gm');
        src = src.replace(re2, (m, label, lang, hash) => `${label}: ${sp.out}${hash || ''}`);
      }
      // 형태 B: /docs/<lang>/platform/rh_p12_rn/<sub>(/)?(#hash)? where sub ∈ examples / gazebo / examples_rna / gazebo_rna
      const re = /\]\(\/docs\/(en|kr)\/platform\/rh_p12_rn\/([^)#\s]+?)\/?(#[^)\s]*)?\)/g;
      src = src.replace(re, (m, lang, p, hash) => {
        const norm = normalizeSlug(p, rnRefs);
        const firstSeg = norm.split('/')[0];
        if (rnRefs.has(firstSeg)) return `](/docs/platform/rh_p12_rn/${norm}${hash || ''})`;
        return `](https://emanual.robotis.com/docs/${lang}/platform/rh_p12_rn/${p}/${hash || ''})`;
      });
      const re2 = /^(\[[^\]]+\]):\s*\/docs\/(en|kr)\/platform\/rh_p12_rn\/([^\s#]+?)\/?(#[^\s]*)?\s*$/gm;
      src = src.replace(re2, (m, label, lang, p, hash) => {
        const norm = normalizeSlug(p, rnRefs);
        const firstSeg = norm.split('/')[0];
        if (rnRefs.has(firstSeg)) return `${label}: /docs/platform/rh_p12_rn/${norm}${hash || ''}`;
        return `${label}: https://emanual.robotis.com/docs/${lang}/platform/rh_p12_rn/${p}/${hash || ''}`;
      });
      // rh_p12_rn_main
      src = src.replace(
        /\]\(\/docs\/(en|kr)\/platform\/rh_p12_rn_main\/?(#[^)\s]*)?\)/g,
        (_, lang, hash) => `](/docs/platform/rh_p12_rn_main${hash || ''})`
      );
    } else {
      // 자기 시리즈 내부 링크
      const knownRefs = SERIES_PAGE_REFS[seriesKey] || new Set();
      const rPath = new RegExp(`\\]\\(\\/docs\\/(en|kr)\\/platform\\/${seriesKey}\\/([^)#\\s]+?)\\/?(#[^)\\s]*)?\\)`, 'g');
      src = src.replace(rPath, (m, lang, p, hash) => {
        const norm = normalizeSlug(p, knownRefs);
        const firstSeg = norm.split('/')[0];
        if (knownRefs.has(firstSeg)) return `](/docs/platform/${seriesKey}/${norm}${hash || ''})`;
        return `](https://emanual.robotis.com/docs/${lang}/platform/${seriesKey}/${p}/${hash || ''})`;
      });
      const rRef = new RegExp(`^(\\[[^\\]]+\\]):\\s*\\/docs\\/(en|kr)\\/platform\\/${seriesKey}\\/([^\\s#]+?)\\/?(#[^\\s]*)?\\s*$`, 'gm');
      src = src.replace(rRef, (m, label, lang, p, hash) => {
        const norm = normalizeSlug(p, knownRefs);
        const firstSeg = norm.split('/')[0];
        if (knownRefs.has(firstSeg)) return `${label}: /docs/platform/${seriesKey}/${norm}${hash || ''}`;
        return `${label}: https://emanual.robotis.com/docs/${lang}/platform/${seriesKey}/${p}/${hash || ''}`;
      });
    }

    // 다른 platform 시리즈로의 cross-link
    for (const [s, refs] of Object.entries(KNOWN_PLATFORM_SERIES)) {
      if (s === seriesKey) continue;
      if (s === 'rh_p12_rn') {
        // 다른 시리즈 → rh_p12_rn 시리즈 링크
        // rh_p12_rn (메인) 은 폴더 인덱스 슬러그
        const subPages = [
          { src: 'rh_p12_rn',     out: '/docs/platform/rh_p12_rn' },
          { src: 'rh_p12_rna',    out: '/docs/platform/rh_p12_rn/rh_p12_rna' },
          { src: 'rh_p12_rn_ur',  out: '/docs/platform/rh_p12_rn/rh_p12_rn_ur' },
          { src: 'rh_p12_rn_dr',  out: '/docs/platform/rh_p12_rn/rh_p12_rn_dr' },
        ];
        for (const sp of subPages) {
          const re = new RegExp(`\\]\\(\\/docs\\/(en|kr)\\/platform\\/${sp.src}\\/?(#[^)\\s]*)?\\)`, 'g');
          src = src.replace(re, (m, lang, hash) => `](${sp.out}${hash || ''})`);
          const re2 = new RegExp(`^(\\[[^\\]]+\\]):\\s*\\/docs\\/(en|kr)\\/platform\\/${sp.src}\\/?(#[^\\s]*)?\\s*$`, 'gm');
          src = src.replace(re2, (m, label, lang, hash) => `${label}: ${sp.out}${hash || ''}`);
        }
        // rh_p12_rn 시리즈 sub-page (examples, gazebo, etc)
        const re = /\]\(\/docs\/(en|kr)\/platform\/rh_p12_rn\/([^)#\s]+?)\/?(#[^)\s]*)?\)/g;
        src = src.replace(re, (m, lang, p, hash) => {
          const norm = normalizeSlug(p, refs);
          const firstSeg = norm.split('/')[0];
          if (refs.has(firstSeg)) return `](/docs/platform/rh_p12_rn/${norm}${hash || ''})`;
          return `](https://emanual.robotis.com/docs/${lang}/platform/rh_p12_rn/${p}/${hash || ''})`;
        });
        continue;
      }
      const re1 = new RegExp(`\\]\\(\\/docs\\/(en|kr)\\/platform\\/${s}\\/([^)#\\s]+?)\\/?(#[^)\\s]*)?\\)`, 'g');
      src = src.replace(re1, (m, lang, p, hash) => {
        const norm = normalizeSlug(p, refs);
        const firstSeg = norm.split('/')[0];
        if (refs.has(firstSeg)) return `](/docs/platform/${s}/${norm}${hash || ''})`;
        return `](https://emanual.robotis.com/docs/${lang}/platform/${s}/${p}/${hash || ''})`;
      });
      const re2 = new RegExp(`^(\\[[^\\]]+\\]):\\s*\\/docs\\/(en|kr)\\/platform\\/${s}\\/([^\\s#]+?)\\/?(#[^\\s]*)?\\s*$`, 'gm');
      src = src.replace(re2, (m, label, lang, p, hash) => {
        const norm = normalizeSlug(p, refs);
        const firstSeg = norm.split('/')[0];
        if (refs.has(firstSeg)) return `${label}: /docs/platform/${s}/${norm}${hash || ''}`;
        return `${label}: https://emanual.robotis.com/docs/${lang}/platform/${s}/${p}/${hash || ''}`;
      });
    }

    // ai_manipulator_main / rh_p12_rn_main
    src = src.replace(
      /\]\(\/docs\/(en|kr)\/platform\/ai_manipulator_main\/?(#[^)\s]*)?\)/g,
      (_, lang, hash) => `](/docs/platform/ai_manipulator_main${hash || ''})`
    );
    src = src.replace(
      /\]\(\/docs\/(en|kr)\/platform\/rh_p12_rn_main\/?(#[^)\s]*)?\)/g,
      (_, lang, hash) => `](/docs/platform/rh_p12_rn_main${hash || ''})`
    );
    // /docs/<lang>/platform/  index 링크
    src = src.replace(
      /\]\(\/docs\/(en|kr)\/platform\/?(#[^)\s]*)?\)/g,
      (_, lang, hash) => `](/docs/platform${hash || ''})`
    );

    // 절대 docs URL (다른 영역 — dxl/software/edu/parts/faq) → 외부 URL 강등
    src = src.replace(
      /\]\(\/docs\/(en|kr)\/(?!platform\/(?:openmanipulator_x|openmanipulator_p|manipulator_h|ai_manipulator_main|rh_p12_rn|rh_p12_rna|rh_p12_rn_ur|rh_p12_rn_dr|rh_p12_rn_main|omy|msgs|common|op|op2|op3|thormang3|turtlebot3))([^)#\s]+)(#[^)\s]*)?\)/g,
      (_, lang, p, hash) => `](https://emanual.robotis.com/docs/${lang}/${p}${hash || ''})`
    );
    src = src.replace(
      /^(\[[^\]]+\]):\s*\/docs\/(en|kr)\/(?!platform\/(?:openmanipulator_x|openmanipulator_p|manipulator_h|ai_manipulator_main|rh_p12_rn|rh_p12_rna|rh_p12_rn_ur|rh_p12_rn_dr|rh_p12_rn_main|omy|msgs|common|op|op2|op3|thormang3|turtlebot3))([^\s#]+)(#[^\s]*)?\s*$/gm,
      (_, label, lang, p, hash) => `${label}: https://emanual.robotis.com/docs/${lang}/${p}${hash || ''}`
    );

    // 끝에 도달했을 때, 외부 도메인이 아니고 / 로 시작하지 않는 fragment 참조는
    // 외부 ROBOTIS wiki(github) 로 강등. (예: OP3-How-to-kill-... )
    src = src.replace(
      /^(\[[^\]]+\]):\s*([A-Za-z][A-Za-z0-9_\-]+(?:#[^\s]*)?)\s*$/gm,
      (m, label, target) => `${label}: https://github.com/ROBOTIS-GIT/ROBOTIS-OP3/wiki/${target}`
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

    // typo: `[Foo](slug)` (bare anchor) → `[Foo](#slug)`
    // - 영문 slug + 한국어/일본어 등 unicode slug 모두 처리
    src = src.replace(
      /\]\(([\p{L}][\p{L}\p{N}_\-]+)\]?\)/gu,
      (m, anchor) => {
        if (/[\/\.:]/.test(anchor)) return m;
        return `](#${anchor})`;
      }
    );

    // HTML comments
    src = src.replace(/<!--[\s\S]*?-->/g, '');

    // self-closing
    src = src.replace(/<br\s*>/g, '<br />');
    src = src.replace(/<hr\s*>/g, '<hr />');
    src = src.replace(/<img([^>]*[^\/])>/g, '<img$1 />');

    // sup/sub asterisk escape
    src = src.replace(/<sup>([^<]*)<\/sup>/g, (m, inner) => {
      const escaped = inner.replace(/\*/g, '&#42;');
      return `<sup>${escaped}</sup>`;
    });
    src = src.replace(/<sub>([^<]*)<\/sub>/g, (m, inner) => {
      const escaped = inner.replace(/\*/g, '&#42;');
      return `<sub>${escaped}</sub>`;
    });

    // strip style="" on common HTML tags (JSX requires object form)
    src = src.replace(/(<(?:img|a|span|div|p|td|tr|tbody|table|li|ul|ol|h\d|hr|br)[^>]*?)\s+style="[^"]*"([^>]*>)/gi, '$1$2');

    // Stray angle brackets
    {
      const lines = src.split('\n');
      let inFence = false;
      for (let li = 0; li < lines.length; li++) {
        if (/^```/.test(lines[li])) { inFence = !inFence; continue; }
        if (inFence) continue;
        lines[li] = lines[li].replace(/<(\*\*[^<>]+\*\*)>/g, '&lt;$1&gt;');
        lines[li] = lines[li].replace(
          /([A-Za-z_][\w:]*)<([A-Z][A-Za-z0-9_]*)>/g,
          '$1&lt;$2&gt;'
        );
        // <math> ... </math>: 비표준 인라인 (MDX/JSX 미지원) → entity escape
        lines[li] = lines[li].replace(/<math>/g, '&lt;math&gt;').replace(/<\/math>/g, '&lt;/math&gt;');
      }
      src = lines.join('\n');
    }

    // MDX brace escaping
    src = escapeMdxBraces(src);

    // 헤딩 anchor 정리 (closed/open form both)
    src = src.replace(
      /^(#{1,6})((?:\s*<a name="[^"]+"\s*>(?:\s*<\/a>)?)+)(.*)$/gm,
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
function convertPageFromRaw(raw, ref, lang, pageTitle, pagePosition, seriesKey, productGroup, opts) {
  opts = opts || {};
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

  // Imports for partials (per-series)
  // Map<importKey, {varName, partialPath}>
  const importsMap = new Map();

  function omyPartialKey(includeSpec) {
    const norm = includeSpec.replace(/^\/+/, '');
    const m = norm.match(/^(?:en|kr)\/platform\/omy\/(.+)\.md$/);
    if (!m) return null;
    return m[1].replace(/[\/\-]/g, '_');
  }

  function dxlPartialKey(includeSpec) {
    const norm = includeSpec.replace(/^\/+/, '');
    let m = norm.match(/^(?:en|kr)\/dxl\/(.+)\.md$/);
    if (!m) return null;
    let tail = m[1];
    if (tail.startsWith('p/')) return 'p_' + tail.slice(2).replace(/[\/\-]/g, '_');
    return tail.replace(/[\/\-]/g, '_');
  }

  function handleInclude(spec) {
    if (seriesKey === 'omy') {
      const key = omyPartialKey(spec);
      if (key) {
        const varName = pascalCaseSegments('omy_' + key);
        importsMap.set(`omy/${key}`, { varName, partialPath: `@site/docs/_partials/platform/omy/${key}.mdx` });
        OMY_PARTIAL_QUEUE.push({ key, spec, lang });
        return `\n<${varName} />\n`;
      }
    }
    if (seriesKey === 'rh_p12_rn') {
      // dxl partial로 매핑 (이미 _partials/dxl/pro/ 에 변환되어 있음)
      const key = dxlPartialKey(spec);
      if (key) {
        const varName = pascalCaseSegments('dxl_' + key);
        importsMap.set(`dxl/${key}`, { varName, partialPath: `@site/docs/_partials/dxl/pro/${key}.mdx` });
        return `\n<${varName} />\n`;
      }
    }
    return `\n{/* include: ${spec} */}\n`;
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
    tags: productGroup ? [productGroup] : [],
  };
  if (Number.isNaN(newFm.sidebar_position)) newFm.sidebar_position = undefined;

  const fmStr = buildFmYaml(newFm);

  const importLines = [];
  if (hasTabs) {
    importLines.push("import Tabs from '@theme/Tabs';");
    importLines.push("import TabItem from '@theme/TabItem';");
  }
  for (const [, info] of importsMap) {
    importLines.push(`import ${info.varName} from '${info.partialPath}';`);
  }
  const importsBlock = importLines.length ? importLines.join('\n') + '\n\n' : '';

  return fmStr + importsBlock + rendered.trim() + '\n';
}

// ----- OMY Partial 처리 -----
const OMY_PARTIAL_QUEUE = [];
const OMY_PARTIAL_DONE = new Set();

function convertOmyPartial(spec, lang) {
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
    ref: 'omy',
    product_group: 'omy',
    lang,
    vars: {},
  };
  const tokens = tokenize(raw);
  let rendered = render(tokens, ctx, (s) => `\n{/* nested include: ${s} */}\n`);
  const kramdownToMdx = makeKramdownToMdx('omy');
  rendered = kramdownToMdx(rendered);
  return rendered.trim() + '\n';
}

// ----- 시리즈 정의 -----
const RH_P12_RN_PAGES = [
  { src: 'rh_p12_rn.md',     ref: 'rh_p12_rn',     productGroup: 'rh_p12_rn',     title: 'RH-P12-RN',          position: 1 },
  { src: 'rh-p12-rna.md',    ref: 'rh_p12_rna',    productGroup: 'rh_p12_rna',    title: 'RH-P12-RN(A)',       position: 2 },
  { src: 'examples.md',      ref: 'examples',      productGroup: 'rh_p12_rn',     title: 'RH-P12-RN Examples', position: 3 },
  { src: 'examples_rna.md',  ref: 'examples_rna',  productGroup: 'rh_p12_rna',    title: 'RH-P12-RN(A) Examples', position: 4 },
  { src: 'gazebo.md',        ref: 'gazebo',        productGroup: 'rh_p12_rn',     title: 'RH-P12-RN Gazebo',   position: 5 },
  { src: 'gazebo_rna.md',    ref: 'gazebo_rna',    productGroup: 'rh_p12_rna',    title: 'RH-P12-RN(A) Gazebo', position: 6 },
  { src: 'rh_p12_rn_ur.md',  ref: 'rh_p12_rn_ur',  productGroup: 'rh_p12_rn_ur',  title: 'RH-P12-RN-UR',       position: 7 },
];

// ko 전용 추가 페이지
const RH_P12_RN_KO_EXTRA = [
  { src: 'rh_p12_rn_dr.md',  ref: 'rh_p12_rn_dr',  productGroup: 'rh_p12_rn_dr',  title: 'RH-P12-RN-DR',       position: 8 },
];

const OMY_PAGES = [
  { src: 'overview.md',                  ref: 'overview',                  title: 'Overview',                  position: 1 },
  { src: 'specification.md',             ref: 'specification',             title: 'Specification',             position: 2 },
  { src: 'quick_start_guide.md',         ref: 'quick_start_guide',         title: 'Quick Start Guide',         position: 3 },
  { src: 'ros2_operation.md',            ref: 'ros2_operation',            title: '[ROS 2] Operation',         position: 4 },
  { src: 'ros2_simulation.md',           ref: 'ros2_simulation',           title: '[ROS 2] Simulation',        position: 5 },
  { src: 'ros2_imitation_learning.md',   ref: 'ros2_imitation_learning',   title: '[ROS 2] Imitation Learning', position: 6 },
];

const MSGS_PAGES = [
  { src: 'BalanceParam_msg.md',                     ref: 'BalanceParam_msg' },
  { src: 'DampingBalanceParam_msg.md',              ref: 'DampingBalanceParam_msg' },
  { src: 'GetPresentJointOffsetData_srv.md',        ref: 'GetPresentJointOffsetData_srv' },
  { src: 'JointFeedBackGain_msg.md',                ref: 'JointFeedBackGain_msg' },
  { src: 'JointOffsetPositionData_msg.md',          ref: 'JointOffsetPositionData_msg' },
  { src: 'JointTorqueOnOff_msg.md',                 ref: 'JointTorqueOnOff_msg' },
  { src: 'JointTorqueOnOffArray_msg.md',            ref: 'JointTorqueOnOffArray_msg' },
  { src: 'PoseXYZRPY_msg.md',                       ref: 'PoseXYZRPY_msg' },
  { src: 'PoseZRPY_msg.md',                         ref: 'PoseZRPY_msg' },
  { src: 'Step2D_msg.md',                           ref: 'Step2D_msg' },
  { src: 'Step2DArray_msg.md',                      ref: 'Step2DArray_msg' },
  { src: 'StepData_msg.md',                         ref: 'StepData_msg' },
  { src: 'StepPositionData_msg.md',                 ref: 'StepPositionData_msg' },
  { src: 'StepTimeData_msg.md',                     ref: 'StepTimeData_msg' },
  { src: 'geometry_msgs_Pose2D_msg.md',             ref: 'geometry_msgs_Pose2D_msg' },
  { src: 'geometry_msgs_Pose_msg.md',               ref: 'geometry_msgs_Pose_msg' },
  { src: 'op3_GetPresentJointOffsetData_srv.md',    ref: 'op3_GetPresentJointOffsetData_srv' },
  { src: 'op3_JointOffsetPositionData_msg.md',      ref: 'op3_JointOffsetPositionData_msg' },
  { src: 'op3_JointPose_msg.md',                    ref: 'op3_JointPose_msg' },
  { src: 'op3_JointTorqueOnOff_msg.md',             ref: 'op3_JointTorqueOnOff_msg' },
  { src: 'op3_JointTorqueOnOffArray_msg.md',        ref: 'op3_JointTorqueOnOffArray_msg' },
  { src: 'op3_KinematicsPose_msg.md',               ref: 'op3_KinematicsPose_msg' },
  { src: 'op3_PreviewRequest_msg.md',               ref: 'op3_PreviewRequest_msg' },
  { src: 'op3_PreviewResponse_msg.md',              ref: 'op3_PreviewResponse_msg' },
  { src: 'op3_WalkingParam_msg.md',                 ref: 'op3_WalkingParam_msg' },
  { src: 'std_msgs_header.md',                      ref: 'std_msgs_header' },
];

const COMMON_PAGES = [
  { src: 'arduino_examples_op3.md',         ref: 'arduino_examples_op3',         title: 'OPENCR OP3',                  position: 1 },
  { src: 'arduino_setup_linux.md',          ref: 'arduino_setup_linux',          title: 'Arduino Setup (Linux)',       position: 2 },
  { src: 'humanoid_navigation.md',          ref: 'humanoid_navigation',          title: 'Humanoid Navigation',         position: 3 },
  { src: 'op3_robot_operating_system.md',   ref: 'op3_robot_operating_system',   title: 'OP3 Robot Operating System',  position: 4 },
  { src: 'robotis_math.md',                 ref: 'robotis_math',                 title: 'ROBOTIS Math',                position: 5 },
];

// ----- ko fallback notice -----
function injectKoFallbackNotice(out) {
  const match = out.match(/^(---\n[\s\S]*?\n---\n\n(?:import [^\n]+\n)*\n?)/);
  if (match) {
    const head = match[1];
    const rest = out.slice(head.length);
    return head + ':::info\n\n한국어 번역은 준비 중입니다. 영문 콘텐츠를 그대로 표시합니다.\n\n:::\n\n' + rest;
  }
  return out.replace(/^---\n([\s\S]*?)\n---\n\n/, (m) => {
    return m + ':::info\n\n한국어 번역은 준비 중입니다. 영문 콘텐츠를 그대로 표시합니다.\n\n:::\n\n';
  });
}

// ----- Path helpers -----
function outDocPath(seriesKey, ref, lang) {
  const base = lang === 'en'
    ? path.join(REPO, 'docusaurus', 'docs', 'platform', seriesKey)
    : path.join(REPO, 'docusaurus', 'i18n', 'ko', 'docusaurus-plugin-content-docs', 'current', 'platform', seriesKey);
  return path.join(base, `${ref}.mdx`);
}

function outDocRoot(seriesKey, lang) {
  return lang === 'en'
    ? path.join(REPO, 'docusaurus', 'docs', 'platform', seriesKey)
    : path.join(REPO, 'docusaurus', 'i18n', 'ko', 'docusaurus-plugin-content-docs', 'current', 'platform', seriesKey);
}

function writeCategory(seriesKey, label, position, link) {
  const linkSpec = link || { type: 'generated-index' };
  for (const lang of ['en', 'ko']) {
    const root = lang === 'en'
      ? path.join(REPO, 'docusaurus', 'docs', 'platform', seriesKey)
      : path.join(REPO, 'docusaurus', 'i18n', 'ko', 'docusaurus-plugin-content-docs', 'current', 'platform', seriesKey);
    writeOut(
      path.join(root, '_category_.json'),
      JSON.stringify({ label, position, link: linkSpec }, null, 2) + '\n'
    );
  }
}

// ----- Series runners -----
function runRhP12Rn(stats) {
  const SRC_EN = path.join(REPO, 'source', 'docs', 'en', 'platform', 'rh_p12_rn');
  const SRC_KR = path.join(REPO, 'source', 'docs', 'kr', 'platform', 'rh_p12_rn');
  ensureDir(outDocRoot('rh_p12_rn', 'en'));
  ensureDir(outDocRoot('rh_p12_rn', 'ko'));

  writeCategory('rh_p12_rn', 'RH-P12-RN', 8);

  for (const page of RH_P12_RN_PAGES) {
    const enRaw = readSafe(path.join(SRC_EN, page.src));
    if (enRaw !== null) {
      try {
        const out = convertPageFromRaw(enRaw, page.ref, 'en', page.title, page.position, 'rh_p12_rn', page.productGroup);
        writeOut(outDocPath('rh_p12_rn', page.ref, 'en'), out);
        stats.en++;
      } catch (e) { stats.errors.push(`rh_p12_rn/en/${page.ref}: ${e.message}`); }
    } else {
      stats.errors.push(`rh_p12_rn/en/${page.ref}: source missing`);
    }

    let koRaw = readSafe(path.join(SRC_KR, page.src));
    let isKoOverride = koRaw !== null;
    if (koRaw === null && enRaw !== null) koRaw = enRaw;
    if (koRaw !== null) {
      try {
        let out = convertPageFromRaw(koRaw, page.ref, 'kr', page.title, page.position, 'rh_p12_rn', page.productGroup);
        if (!isKoOverride) out = injectKoFallbackNotice(out);
        writeOut(outDocPath('rh_p12_rn', page.ref, 'ko'), out);
        stats.ko++;
      } catch (e) { stats.errors.push(`rh_p12_rn/ko/${page.ref}: ${e.message}`); }
    }
  }

  // ko-only extra pages (rh_p12_rn_dr)
  for (const page of RH_P12_RN_KO_EXTRA) {
    const koRaw = readSafe(path.join(SRC_KR, page.src));
    if (koRaw !== null) {
      try {
        const out = convertPageFromRaw(koRaw, page.ref, 'kr', page.title, page.position, 'rh_p12_rn', page.productGroup);
        writeOut(outDocPath('rh_p12_rn', page.ref, 'ko'), out);
        stats.ko++;
        // en도 동일하게 두되 fallback 표시
        const enOut = injectKoFallbackNotice(
          convertPageFromRaw(koRaw, page.ref, 'en', page.title, page.position, 'rh_p12_rn', page.productGroup)
            .replace(':::info\n\n한국어 번역은 준비 중입니다. 영문 콘텐츠를 그대로 표시합니다.\n\n:::\n\n', '')
        );
        // 더 간단한 방법: en 콘텐츠는 한국어 원본 그대로 + EN-fallback notice
        const enFallback = enOut.replace(
          /^---\n([\s\S]*?)\n---\n\n((?:import [^\n]+\n)*\n?)/,
          (m, fm, imp) => `---\n${fm}\n---\n\n${imp}:::info\n\nThe English version of this page is being prepared. The Korean source is shown below.\n\n:::\n\n`
        );
        writeOut(outDocPath('rh_p12_rn', page.ref, 'en'), enFallback);
        stats.en++;
      } catch (e) { stats.errors.push(`rh_p12_rn/ko/${page.ref}: ${e.message}`); }
    }
  }
}

function runRhP12RnMain(stats) {
  const SRC_EN = path.join(REPO, 'source', 'docs', 'en', 'platform', 'rh_p12_rn_main.md');
  const SRC_KR = path.join(REPO, 'source', 'docs', 'kr', 'platform', 'rh_p12_rn_main.md');
  const OUT_EN = path.join(REPO, 'docusaurus', 'docs', 'platform', 'rh_p12_rn_main.mdx');
  const OUT_KO = path.join(REPO, 'docusaurus', 'i18n', 'ko', 'docusaurus-plugin-content-docs', 'current', 'platform', 'rh_p12_rn_main.mdx');

  const enRaw = readSafe(SRC_EN);
  if (enRaw !== null) {
    try {
      const out = convertPageFromRaw(enRaw, 'rh_p12_rn_main', 'en', 'RH-P12-RN Series', 90, 'rh_p12_rn', 'rh_p12_rn');
      writeOut(OUT_EN, out);
      stats.en++;
    } catch (e) { stats.errors.push(`rh_p12_rn_main/en: ${e.message}`); }
  }

  let koRaw = readSafe(SRC_KR);
  let isKoOverride = koRaw !== null;
  if (koRaw === null && enRaw !== null) koRaw = enRaw;
  if (koRaw !== null) {
    try {
      let out = convertPageFromRaw(koRaw, 'rh_p12_rn_main', 'kr', 'RH-P12-RN Series', 90, 'rh_p12_rn', 'rh_p12_rn');
      if (!isKoOverride) out = injectKoFallbackNotice(out);
      writeOut(OUT_KO, out);
      stats.ko++;
    } catch (e) { stats.errors.push(`rh_p12_rn_main/ko: ${e.message}`); }
  }
}

function runOmy(stats) {
  const SRC_EN = path.join(REPO, 'source', 'docs', 'en', 'platform', 'omy');
  const SRC_KR = path.join(REPO, 'source', 'docs', 'kr', 'platform', 'omy');
  ensureDir(outDocRoot('omy', 'en'));
  ensureDir(outDocRoot('omy', 'ko'));
  const PART_EN = path.join(REPO, 'docusaurus', 'docs', '_partials', 'platform', 'omy');
  const PART_KO = path.join(REPO, 'docusaurus', 'i18n', 'ko', 'docusaurus-plugin-content-docs', 'current', '_partials', 'platform', 'omy');
  ensureDir(PART_EN);
  ensureDir(PART_KO);

  writeCategory('omy', 'OMY', 4);

  for (const page of OMY_PAGES) {
    const enRaw = readSafe(path.join(SRC_EN, page.src));
    if (enRaw !== null) {
      try {
        const out = convertPageFromRaw(enRaw, page.ref, 'en', page.title, page.position, 'omy', 'omy');
        writeOut(outDocPath('omy', page.ref, 'en'), out);
        stats.en++;
      } catch (e) { stats.errors.push(`omy/en/${page.ref}: ${e.message}`); }
    } else {
      stats.errors.push(`omy/en/${page.ref}: source missing`);
    }

    let koRaw = readSafe(path.join(SRC_KR, page.src));
    let isKoOverride = koRaw !== null;
    if (koRaw === null && enRaw !== null) koRaw = enRaw;
    if (koRaw !== null) {
      try {
        let out = convertPageFromRaw(koRaw, page.ref, 'kr', page.title, page.position, 'omy', 'omy');
        if (!isKoOverride) out = injectKoFallbackNotice(out);
        writeOut(outDocPath('omy', page.ref, 'ko'), out);
        stats.ko++;
      } catch (e) { stats.errors.push(`omy/ko/${page.ref}: ${e.message}`); }
    }
  }

  // omy partial flush — both en and ko
  while (OMY_PARTIAL_QUEUE.length > 0) {
    const q = OMY_PARTIAL_QUEUE.shift();
    const sig = `${q.lang}|omy|${q.key}`;
    if (OMY_PARTIAL_DONE.has(sig)) continue;
    OMY_PARTIAL_DONE.add(sig);
    try {
      const content = convertOmyPartial(q.spec, q.lang);
      const dir = q.lang === 'en' ? PART_EN : PART_KO;
      if (content === null) {
        stats.errors.push(`partial omy/${q.lang}/${q.key}: source missing`);
        const stub = `{/* TODO: missing source for ${q.spec} */}\n`;
        writeOut(path.join(dir, `${q.key}.mdx`), stub);
        if (q.lang === 'en') stats.partials_en++; else stats.partials_ko++;
        continue;
      }
      writeOut(path.join(dir, `${q.key}.mdx`), content);
      if (q.lang === 'en') stats.partials_en++; else stats.partials_ko++;
    } catch (e) { stats.errors.push(`partial omy/${q.lang}/${q.key}: ${e.message}`); }
  }
}

function runMsgs(stats) {
  const SRC_EN = path.join(REPO, 'source', 'docs', 'en', 'platform', 'msgs');
  ensureDir(outDocRoot('msgs', 'en'));
  ensureDir(outDocRoot('msgs', 'ko'));

  writeCategory('msgs', 'ROS Messages', 9);

  for (let i = 0; i < MSGS_PAGES.length; i++) {
    const page = MSGS_PAGES[i];
    const position = i + 1;
    const enRaw = readSafe(path.join(SRC_EN, page.src));
    if (enRaw !== null) {
      try {
        const out = convertPageFromRaw(enRaw, page.ref, 'en', page.ref, position, 'msgs', 'msgs');
        writeOut(outDocPath('msgs', page.ref, 'en'), out);
        stats.en++;
        // ko fallback (same content + notice)
        let koOut = convertPageFromRaw(enRaw, page.ref, 'kr', page.ref, position, 'msgs', 'msgs');
        koOut = injectKoFallbackNotice(koOut);
        writeOut(outDocPath('msgs', page.ref, 'ko'), koOut);
        stats.ko++;
      } catch (e) { stats.errors.push(`msgs/${page.ref}: ${e.message}`); }
    } else {
      stats.errors.push(`msgs/${page.ref}: source missing`);
    }
  }
}

function runCommon(stats) {
  const SRC_EN = path.join(REPO, 'source', 'docs', 'en', 'platform', 'common');
  ensureDir(outDocRoot('common', 'en'));
  ensureDir(outDocRoot('common', 'ko'));

  writeCategory('common', 'Common', 10);

  for (const page of COMMON_PAGES) {
    const enRaw = readSafe(path.join(SRC_EN, page.src));
    if (enRaw !== null) {
      try {
        const out = convertPageFromRaw(enRaw, page.ref, 'en', page.title, page.position, 'common', 'common');
        writeOut(outDocPath('common', page.ref, 'en'), out);
        stats.en++;
        // ko fallback
        let koOut = convertPageFromRaw(enRaw, page.ref, 'kr', page.title, page.position, 'common', 'common');
        koOut = injectKoFallbackNotice(koOut);
        writeOut(outDocPath('common', page.ref, 'ko'), koOut);
        stats.ko++;
      } catch (e) { stats.errors.push(`common/${page.ref}: ${e.message}`); }
    } else {
      stats.errors.push(`common/${page.ref}: source missing`);
    }
  }
}

function runPlatformIndex(stats) {
  const SRC_EN = path.join(REPO, 'source', 'docs', 'en', 'platform', 'platform.md');
  const SRC_KR = path.join(REPO, 'source', 'docs', 'kr', 'platform', 'platform.md');
  // 기존 placeholder index.md → 삭제 후 index.mdx
  const OLD_INDEX = path.join(REPO, 'docusaurus', 'docs', 'platform', 'index.md');
  if (fs.existsSync(OLD_INDEX)) fs.unlinkSync(OLD_INDEX);

  const OUT_EN = path.join(REPO, 'docusaurus', 'docs', 'platform', 'index.mdx');
  const OUT_KO = path.join(REPO, 'docusaurus', 'i18n', 'ko', 'docusaurus-plugin-content-docs', 'current', 'platform', 'index.mdx');

  const enRaw = readSafe(SRC_EN);
  if (enRaw !== null) {
    try {
      let out = convertPageFromRaw(enRaw, 'platform', 'en', 'Platform', 1, 'platform_index', '');
      // index 페이지는 frontmatter id 'platform' + slug '/' (root)
      // 그대로 두면 platform/index.mdx → URL /docs/platform/  (auto)
      writeOut(OUT_EN, out);
      stats.en++;
    } catch (e) { stats.errors.push(`platform/en: ${e.message}`); }
  }

  let koRaw = readSafe(SRC_KR);
  let isKoOverride = koRaw !== null;
  if (koRaw === null && enRaw !== null) koRaw = enRaw;
  if (koRaw !== null) {
    try {
      let out = convertPageFromRaw(koRaw, 'platform', 'kr', 'Platform', 1, 'platform_index', '');
      if (!isKoOverride) out = injectKoFallbackNotice(out);
      writeOut(OUT_KO, out);
      stats.ko++;
    } catch (e) { stats.errors.push(`platform/ko: ${e.message}`); }
  }
}

function run() {
  const stats = { en: 0, ko: 0, partials_en: 0, partials_ko: 0, errors: [] };

  runOmy(stats);
  runRhP12Rn(stats);
  runRhP12RnMain(stats);
  runCommon(stats);
  runMsgs(stats);
  runPlatformIndex(stats);

  console.log('Done.', JSON.stringify(stats, null, 2));
  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    stats.errors.forEach(e => console.log('  -', e));
  }
}

run();
