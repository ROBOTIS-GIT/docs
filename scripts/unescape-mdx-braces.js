#!/usr/bin/env node
/**
 * Restore literal `{` / `}` in MDX sources migrated from Jekyll.
 *
 * - Inside fenced code blocks and inline `code`: `{` / `}`
 * - Kramdown image attrs `![](url){: width="..."}` → <img width="..." />
 * - Prose (MDX-safe): {'{'} / {'}'}
 *
 * Usage: node scripts/unescape-mdx-braces.js
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', 'docusaurus');

function toLiteralBraces(s) {
  return s.replace(/&#123;/g, '{').replace(/&#125;/g, '}');
}

function toMdxBraces(s) {
  return s.replace(/&#123;/g, "{'{'}").replace(/&#125;/g, "{'}'}");
}

function fixKramdownImages(content) {
  return content.replace(
    /!\[\]\(([^)]+)\)&#123;:\s*width=['"]([^'"]+)['"]\s*&#125;/g,
    '<img src="$1" width="$2" alt="" />',
  );
}

function processInlineCode(line, transform) {
  return line.replace(/(`+)([^`]*?)\1/g, (full, ticks, inner) => {
    if (!inner.includes('&#123;') && !inner.includes('&#125;')) return full;
    return ticks + transform(inner) + ticks;
  });
}

function processContent(content) {
  content = fixKramdownImages(content);

  const lines = content.split('\n');
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) {
      inFence = !inFence;
      continue;
    }

    if (!lines[i].includes('&#123;') && !lines[i].includes('&#125;')) continue;

    if (inFence) {
      lines[i] = toLiteralBraces(lines[i]);
      continue;
    }

    let line = processInlineCode(lines[i], toLiteralBraces);
    if (line.includes('&#123;') || line.includes('&#125;')) {
      line = toMdxBraces(line);
    }
    lines[i] = line;
  }

  return lines.join('\n');
}

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, {withFileTypes: true})) {
    if (['node_modules', '.docusaurus', 'build'].includes(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(mdx?)$/.test(ent.name)) files.push(p);
  }
  return files;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const orig = fs.readFileSync(file, 'utf8');
  if (!orig.includes('&#123;') && !orig.includes('&#125;')) continue;
  let next = processContent(orig);

  // Broken Jekyll leftover on STEAM FAQ stub
  if (file.endsWith('faq/faq_steam.mdx')) {
    next = next.replace(/\n&#123; :notice&#125;\n/, '\n');
  }

  if (next !== orig) {
    fs.writeFileSync(file, next);
    changed++;
    console.log('fixed', path.relative(ROOT, file));
  }
}

console.log(`\n${changed} files updated`);
