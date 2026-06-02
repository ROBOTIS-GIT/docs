#!/usr/bin/env node
/**
 * Rewrite legacy Jekyll heading anchors to Docusaurus automatic heading slugs.
 *
 * Source headings often look like:
 *   ### <a name="model-number"></a>**[Model Number(0)](#model-number0)**
 *
 * Converted MDX headings look like:
 *   ### Model Number(0)
 *
 * This script maps old anchors such as `#model-number` to the slug Docusaurus
 * creates from the converted heading text, such as `#model-number0`, and removes
 * standalone `<a id="..."></a>` compatibility tags.
 *
 * Usage:
 *   node scripts/inject-heading-anchors.js dxl/y dxl/model_reference/y_series ../emanual/docs
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {createSlugger, parseMarkdownHeadingId} = require(
  path.join(__dirname, '..', 'docusaurus', 'node_modules', '@docusaurus', 'utils'),
);

const REPO_ROOT = path.resolve(__dirname, '..');

function usage() {
  console.error('usage: node scripts/inject-heading-anchors.js <source/series> [output/series] [source-docs-root]');
  console.error('  e.g.  node scripts/inject-heading-anchors.js dxl/y dxl/model_reference/y_series ../emanual/docs');
  process.exit(2);
}

const sourceSeries = process.argv[2];
if (!sourceSeries) usage();

const outputSeries = process.argv[3] || sourceSeries;
const sourceDocsRoot = process.argv[4]
  ? path.resolve(REPO_ROOT, process.argv[4])
  : path.join(REPO_ROOT, 'source', 'docs');

const SOURCE_EN = path.join(sourceDocsRoot, 'en', sourceSeries);
const SOURCE_KR = path.join(sourceDocsRoot, 'kr', sourceSeries);
const OUT_EN = path.join(REPO_ROOT, 'docusaurus', 'docs', outputSeries);
const OUT_KO = path.join(
  REPO_ROOT,
  'docusaurus',
  'i18n',
  'ko',
  'docusaurus-plugin-content-docs',
  'current',
  outputSeries,
);

function normalize(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[​ ]/g, ' ')
    .trim();
}

function cleanHeadingText(body) {
  const parsed = parseMarkdownHeadingId(body, 'classic');
  return parsed.text
    .replace(/<a\s+name=["'][^"']+["']\s*(?:>\s*<\/a>|>)/gi, '')
    .replace(/<a\s+id=["'][^"']+["']\s*\/?\s*>\s*(?:<\/a>)?/gi, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/<\/?[^>]+>/g, '')
    .trim();
}

function extractHeadingAnchors(filepath) {
  const txt = fs.readFileSync(filepath, 'utf8');
  const result = [];
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^(#{1,6})\s+(.*)$/);
    if (!m) continue;

    const headingBody = m[2];
    const anchors = [];
    const reA = /<a\s+name=["']([^"']+)["']\s*(?:>\s*<\/a>|>)/gi;
    let mm;
    while ((mm = reA.exec(headingBody)) !== null) anchors.push(mm[1]);
    if (anchors.length === 0) continue;

    result.push({
      visibleText: cleanHeadingText(headingBody),
      anchors,
    });
  }
  return result;
}

function collectStemsRecursive(rootDir) {
  const map = new Map();
  if (!fs.existsSync(rootDir)) return map;

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.md')) {
        const stem = entry.name.replace(/\.md$/, '');
        if (!map.has(stem)) map.set(stem, full);
      }
    }
  }
  walk(rootDir);
  return map;
}

function candidateSourceStems(stem) {
  const aliases = [];
  const add = (s) => {
    if (s && !aliases.includes(s)) aliases.push(s);
  };

  add(stem);
  if (stem.endsWith('_series')) add(stem.replace(/_series$/, ''));

  const explicit = {
    dyd: ['all_dyd'],
    p_series: ['dxl_p'],
    pro_h_series: ['pro_h'],
    pro_l_series: ['pro_l'],
    pro_m_series: ['pro_m'],
    xh_series: ['x_h'],
    xl_series: ['x_l'],
    xm_series: ['x_m'],
    xc_series: ['x_c'],
  };
  for (const s of explicit[stem] || []) add(s);

  add(`${stem}-t`);
  if (stem === 'xc430-t150bb') add('xc430-w150bb');
  if (stem === 'xc430-t240bb') add('xc430-w240bb');

  return aliases;
}

function resolveSourcePath(index, stem) {
  for (const candidate of candidateSourceStems(stem)) {
    const p = index.get(candidate);
    if (p) return p;
  }
  return undefined;
}

function buildAnchorSlugMap(mdxText, headings) {
  const queues = new Map();
  for (const h of headings) {
    const key = normalize(h.visibleText);
    if (!queues.has(key)) queues.set(key, []);
    queues.get(key).push(h);
  }

  const slugger = createSlugger();
  const map = new Map();
  let unmatched = 0;

  for (const line of mdxText.split(/\r?\n/)) {
    const m = line.match(/^(#{1,6})\s+(.*?)\s*$/);
    if (!m) continue;

    const headingText = cleanHeadingText(m[2]);
    if (!headingText) continue;

    const slug = slugger.slug(headingText);
    const queue = queues.get(normalize(headingText));
    if (!queue || queue.length === 0) continue;

    const h = queue.shift();
    for (const anchor of h.anchors) map.set(anchor, slug);
  }

  for (const [, q] of queues) unmatched += q.length;
  return {map, unmatched};
}

function collectHeadingSlugs(text) {
  const slugger = createSlugger();
  const headings = [];
  const slugSet = new Set();

  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^(#{1,6})\s+(.*?)\s*$/);
    if (!m) continue;

    const headingText = cleanHeadingText(m[2]);
    if (!headingText) continue;

    const slug = slugger.slug(headingText);
    headings.push({
      text: headingText,
      slug,
      norm: normalizeComparable(headingText),
    });
    slugSet.add(slug);
  }

  return {headings, slugSet};
}

function normalizeComparable(text) {
  return cleanHeadingText(text)
    .toLowerCase()
    .replace(/&deg;|°/g, ' deg ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(red|green|blue)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function words(text) {
  return normalizeComparable(text).split(' ').filter(Boolean);
}

function linkAddressFromContext(context) {
  const row = context.match(/^\s*\|\s*(\d+)\s*\|/);
  if (row) return row[1];

  const paren = context.match(/\((\d+)\)/);
  if (paren) return paren[1];

  return null;
}

function scoreHeadingCandidate({label, id, context, heading}) {
  const labelNorm = normalizeComparable(label);
  const idNorm = id.replace(/-/g, ' ');
  const address = linkAddressFromContext(context);
  let score = 0;

  if (!labelNorm) return score;

  if (heading.slug === id) return 1000;
  if (heading.slug.startsWith(`${id}-`) || heading.slug.startsWith(id)) score += 80;
  if (heading.norm === labelNorm) score += 100;
  if (heading.norm.startsWith(`${labelNorm} `)) score += 85;
  if (heading.norm.includes(labelNorm)) score += 70;

  const labelWords = words(labelNorm);
  const headingWords = new Set(words(heading.text));
  const matchedWords = labelWords.filter((w) => headingWords.has(w));
  score += matchedWords.length * 12;

  if (address && new RegExp(`(^|[^0-9])${address}([^0-9]|$)`).test(heading.text)) score += 40;

  if (/^led-(red|green|blue)$/.test(id) && /\brgb led\b/i.test(heading.text)) score += 180;
  if (/\bled\b/.test(labelNorm) && /\brgb led\b/i.test(heading.text)) score += 80;

  if (id === 'registered' && /^registered instruction\b/i.test(heading.text)) score += 150;
  if (id === 'ccw-compliance-alope' && /\bcompliance slope\b/i.test(heading.text)) score += 180;
  if (id === 'protocol-type' && /^protocol type\b/i.test(heading.text)) score += 150;
  if (id === 'temperature-limit-12' && /^temperature limit\b/i.test(heading.text)) score += 150;

  if (/^(velocity|position)-/.test(id) && heading.slug.startsWith(id)) score += 90;
  if (/gain/.test(labelNorm) && /gain/i.test(heading.text)) {
    if (labelNorm.includes('velocity') && /velocity/i.test(heading.text)) score += 80;
    if (labelNorm.includes('position') && /position/i.test(heading.text)) score += 80;
    if (labelNorm.includes('feedforward') && /feedforward/i.test(heading.text)) score += 80;
  }

  if (labelNorm === 'model information' && /^model information\b/i.test(heading.text)) score += 150;
  if (labelNorm === 'homing offset' && /^homing offset\b/i.test(heading.text)) score += 150;
  if (labelNorm === 'torque limit' && /^torque limit\b/i.test(heading.text)) score += 150;

  // Penalize unrelated headings that only share generic words like "limit".
  if (matchedWords.length === 0 && score < 100) return 0;
  if (labelWords.length > 1 && matchedWords.length === 1 && score < 120) score -= 30;
  if (idNorm && heading.norm === idNorm) score += 50;

  return score;
}

function inferFragmentTarget({label, id, context, headings, slugSet}) {
  if (slugSet.has(id)) return null;

  let best = null;
  for (const heading of headings) {
    const score = scoreHeadingCandidate({label, id, context, heading});
    if (score <= 0) continue;
    if (!best || score > best.score) best = {heading, score};
  }

  if (!best || best.score < 100) return null;
  return best.heading.slug;
}

function removeStandaloneAnchorTags(text) {
  return text.replace(/^\s*<a id="[^"]+"\s*><\/a>\s*\r?\n/gm, '');
}

function rewriteFragmentLinks(text, anchorMap) {
  let rewritten = 0;
  let next = text.replace(/(#)([A-Za-z0-9][A-Za-z0-9_-]*)/g, (match, hash, id, offset, full) => {
    const prev = full[offset - 1] || '';
    if (prev === '{') return match;

    const slug = anchorMap.get(id);
    if (!slug || slug === id) return match;

    rewritten++;
    return `${hash}${slug}`;
  });

  return {text: next, rewritten};
}

function rewriteBrokenLocalFragmentLinks(text) {
  const {headings, slugSet} = collectHeadingSlugs(text);
  let rewritten = 0;
  let removedInvalidLinks = 0;
  const unresolved = new Map();

  const rewrite = (match, label, id, offset, full) => {
    if (slugSet.has(id)) return match;

    const lineStart = full.lastIndexOf('\n', offset) + 1;
    const lineEnd = full.indexOf('\n', offset);
    const context = full.slice(lineStart, lineEnd === -1 ? full.length : lineEnd);
    const target = inferFragmentTarget({label, id, context, headings, slugSet});

    if (!target || target === id) {
      if (label) {
        removedInvalidLinks++;
        return label;
      }
      unresolved.set(`${label || ''}#${id}`, (unresolved.get(`${label || ''}#${id}`) || 0) + 1);
      return match;
    }

    rewritten++;
    return match.replace(`#${id}`, `#${target}`);
  };

  const next = text
    .replace(/\[([^\]]+)\]\(#([A-Za-z0-9][A-Za-z0-9_-]*)\)/g, rewrite)
    .replace(/href=(["'])#([A-Za-z0-9][A-Za-z0-9_-]*)\1/g, (match, quote, id, offset, full) => {
      const target = inferFragmentTarget({label: '', id, context: '', headings, slugSet});
      if (!target || target === id) {
        unresolved.set(`#${id}`, (unresolved.get(`#${id}`) || 0) + 1);
        return match;
      }
      rewritten++;
      return `href=${quote}#${target}${quote}`;
    });

  return {text: next, rewritten, removedInvalidLinks, unresolved};
}

function processMdx(mdxPath, sourcePath) {
  if (!sourcePath || !fs.existsSync(sourcePath) || !fs.existsSync(mdxPath)) return null;

  const headings = extractHeadingAnchors(sourcePath);
  const original = fs.readFileSync(mdxPath, 'utf8');
  const {map, unmatched} = buildAnchorSlugMap(original, headings);
  const withoutTags = removeStandaloneAnchorTags(original);
  const {text: legacyRewrittenText, rewritten} = rewriteFragmentLinks(withoutTags, map);
  const {
    text: rewrittenText,
    rewritten: inferredRewritten,
    removedInvalidLinks,
    unresolved,
  } = rewriteBrokenLocalFragmentLinks(legacyRewrittenText);

  if (rewrittenText !== original) fs.writeFileSync(mdxPath, rewrittenText, 'utf8');

  return {
    sourceAnchors: headings.reduce((sum, h) => sum + h.anchors.length, 0),
    mappedAnchors: map.size,
    linksRewritten: rewritten + inferredRewritten,
    inferredLinksRewritten: inferredRewritten,
    removedInvalidLinks,
    removedTags: (original.match(/^\s*<a id="[^"]+"\s*><\/a>\s*$/gm) || []).length
      - (withoutTags.match(/^\s*<a id="[^"]+"\s*><\/a>\s*$/gm) || []).length,
    unresolved,
    unmatched,
  };
}

function main() {
  if (!fs.existsSync(SOURCE_EN)) {
    console.error(`source not found: ${SOURCE_EN}`);
    process.exit(1);
  }

  const mdxStems = fs.existsSync(OUT_EN)
    ? fs.readdirSync(OUT_EN).filter((f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, ''))
    : [];

  const enIndex = collectStemsRecursive(SOURCE_EN);
  const krIndex = collectStemsRecursive(SOURCE_KR);

  let total = {files: 0, links: 0, tags: 0, unmatched: 0};
  for (const stem of mdxStems) {
    const en = processMdx(
      path.join(OUT_EN, `${stem}.mdx`),
      resolveSourcePath(enIndex, stem),
    );
    const ko = processMdx(
      path.join(OUT_KO, `${stem}.mdx`),
      resolveSourcePath(krIndex, stem),
    );

    if (!en && !ko) continue;
    total.files++;

    for (const r of [en, ko].filter(Boolean)) {
      total.links += r.linksRewritten;
      total.tags += r.removedTags;
      total.unmatched += r.unmatched;
    }

    const fmt = (r) => r
      ? `links ${r.linksRewritten}, inferred ${r.inferredLinksRewritten}, removed invalid ${r.removedInvalidLinks}, tags ${r.removedTags}, unmatched ${r.unmatched}, unresolved ${r.unresolved.size}`
      : '-';
    console.log(`${sourceSeries} -> ${outputSeries}/${stem} -> en: ${fmt(en)} | ko: ${fmt(ko)}`);
  }

  console.log('---');
  console.log(`total files processed: ${total.files}`);
  console.log(`fragment links rewritten: ${total.links}`);
  console.log(`anchor tags removed: ${total.tags}`);
  console.log(`source headings not matched in mdx: ${total.unmatched}`);
}

main();
