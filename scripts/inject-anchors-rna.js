#!/usr/bin/env node
/**
 * rh-p12-rna.md → rh_p12_rna.mdx 의 헤딩 anchor 주입.
 * inject-heading-anchors.js 가 stem 매칭 기반이므로
 * rh-p12-rna (source) ↔ rh_p12_rna (output) 같은 매핑은 수동 처리한다.
 */
'use strict';
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');

const REPO = path.resolve(__dirname, '..');

// 동일 코드 사용 — extractHeadingAnchors / injectIntoMdx 만 재사용하기 위해
// inject-heading-anchors.js 의 함수를 inline 으로 가져온다.
function extractHeadingAnchors(filepath) {
  const txt = fs.readFileSync(filepath, 'utf8');
  const result = [];
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^(#{1,6})\s+(.*)$/);
    if (!m) continue;
    const headingBody = m[2];
    const anchors = [];
    const reA = /<a\s+name=["']([^"']+)["']\s*>\s*<\/a>/gi;
    let mm;
    while ((mm = reA.exec(headingBody)) !== null) anchors.push(mm[1]);
    if (anchors.length === 0) continue;
    let visible = headingBody
      .replace(/<a\s+[^>]*>\s*<\/a>/gi, '')
      .replace(/<\/?[^>]+>/g, '')
      .trim();
    visible = visible.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
    visible = visible.replace(/\*\*/g, '').trim();
    result.push({ visibleText: visible, anchors });
  }
  return result;
}

function normalize(text) {
  return text.replace(/\s+/g, ' ').replace(/[​ ]/g, ' ').trim();
}

function injectIntoMdx(mdxPath, headings) {
  if (!fs.existsSync(mdxPath)) return { skipped: true };
  const original = fs.readFileSync(mdxPath, 'utf8');
  const lines = original.split(/\r?\n/);
  const queues = new Map();
  for (const h of headings) {
    const key = normalize(h.visibleText);
    if (!queues.has(key)) queues.set(key, []);
    queues.get(key).push(h);
  }
  const out = [];
  let injected = 0, alreadyHadId = 0, unmatched = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^(#{1,6})\s+(.*?)\s*$/);
    if (!m) { out.push(line); continue; }
    const body = m[2];
    const visibleNorm = normalize(
      body.replace(/<a\s+name=["'][^"']+["']\s*>\s*<\/a>/gi, '')
          .replace(/<a\s+id=["'][^"']+["']\s*\/?\s*>\s*(?:<\/a>)?/gi, '')
          .replace(/\*\*/g, '')
    );
    const queue = queues.get(visibleNorm);
    if (!queue || queue.length === 0) { out.push(line); continue; }
    const prevLine = out.length > 0 ? out[out.length - 1] : '';
    if (/^<a id="[^"]+"\s*><\/a>$/.test(prevLine.trim())) {
      out.push(line); alreadyHadId++; queue.shift(); continue;
    }
    const h = queue.shift();
    for (const a of h.anchors) { out.push(`<a id="${a}"></a>`); injected++; }
    out.push(line);
  }
  for (const [, q] of queues) unmatched += q.length;
  const next = out.join('\n');
  if (next === original) return { changed: false, injected, alreadyHadId, unmatched };
  fs.writeFileSync(mdxPath, next, 'utf8');
  return { changed: true, injected, alreadyHadId, unmatched };
}

const TASKS = [
  // [sourceMd, outputMdx]
  {
    sourceEn: 'source/docs/en/platform/rh_p12_rn/rh-p12-rna.md',
    sourceKr: 'source/docs/kr/platform/rh_p12_rn/rh-p12-rna.md',
    outEn:    'docusaurus/docs/platform/rh_p12_rn/rh_p12_rna.mdx',
    outKo:    'docusaurus/i18n/ko/docusaurus-plugin-content-docs/current/platform/rh_p12_rn/rh_p12_rna.mdx',
  },
];

let total = { injected: 0, alreadyHadId: 0, unmatched: 0 };
for (const t of TASKS) {
  for (const [sourceKey, outKey, label] of [['sourceEn', 'outEn', 'en'], ['sourceKr', 'outKo', 'ko']]) {
    const src = path.join(REPO, t[sourceKey]);
    const out = path.join(REPO, t[outKey]);
    if (!fs.existsSync(src) || !fs.existsSync(out)) continue;
    const headings = extractHeadingAnchors(src);
    const r = injectIntoMdx(out, headings);
    console.log(`${t[outKey]} (${label}) +${r.injected} skipped=${r.alreadyHadId} unmatched=${r.unmatched}`);
    total.injected += r.injected || 0;
    total.alreadyHadId += r.alreadyHadId || 0;
    total.unmatched += r.unmatched || 0;
  }
}
console.log('---', JSON.stringify(total));
