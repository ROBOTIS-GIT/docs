import {access, cp, mkdir, readFile, readdir, rm, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

async function files(dir, prefix = '') {
  const result = [];
  for (const entry of await readdir(dir, {withFileTypes: true}).catch(() => [])) {
    const name = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...await files(path.join(dir, entry.name), name));
    else if (entry.isFile()) result.push(name);
  }
  return result;
}

// Resolve local imports, including extensionless component directory imports.
async function resolveImport(siteDir, source, specifier) {
  const relative = specifier.startsWith('@site/') ? specifier.slice(6)
    : specifier.startsWith('.') ? path.posix.join(path.posix.dirname(source), specifier) : null;
  if (!relative || relative.startsWith('../')) return null;
  for (const suffix of ['', '.mdx', '.md', '.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts', '/index.jsx', '/index.js']) {
    if ((await stat(path.join(siteDir, relative + suffix)).catch(() => null))?.isFile()) return relative + suffix;
  }
  // Keep deleted dependencies in the graph so their importers are selected too.
  return relative;
}

export async function selectPages(siteDir, pages, changed) {
  const changes = new Set(changed);
  const globalChange = changed.some(p => /^(docusaurus\.config\.|sidebars\.|package(?:-lock)?\.json|src\/(?:css|theme|clients)\/|plugins\/)/.test(p)
    || /(?:^|\/)_(?:category_)\.json$/.test(p) || /i18n\/.*\.json$/.test(p));
  if (globalChange) return pages;
  const cache = new Map();
  async function dependencies(source, seen = new Set()) {
    if (!source || seen.has(source)) return false;
    if (changes.has(source)) return true;
    seen.add(source);
    let record = cache.get(source);
    if (!record) {
      const text = /\.(?:mdx?|[cm]?[jt]sx?|css|json)$/.test(source)
        ? await readFile(path.join(siteDir, source), 'utf8').catch(() => '') : '';
      const imports = [...text.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?|\brequire\s*\(\s*)['"]([^'"]+)['"]/g)].map(m => m[1]);
      record = {text, imports: (await Promise.all(imports.map(s => resolveImport(siteDir, source, s)))).filter(Boolean)};
      cache.set(source, record);
    }
    if (changed.some(p => p.startsWith('static/') && (
      record.text.includes(p.slice(7)) ||
      [...record.text.matchAll(/["'`](\/(?:img|videos|assets|fonts)\/[^"'`$]*)/g)]
        .some(match => {
          const directory = match[1].replace(/\/$/, '');
          return !path.posix.extname(directory) && p.slice(7).startsWith(directory.slice(1) + '/');
        })
    ))) return true;
    if (changed.some(p => p.startsWith('omx-assembly/')) && record.text.includes('/interactive/omx')) return true;
    for (const dependency of record.imports) if (await dependencies(dependency, seen)) return true;
    return false;
  }
  const sharedSources = ['docusaurus.config.ts', ...await files(path.join(siteDir, 'src/css'), 'src/css'),
    ...await files(path.join(siteDir, 'src/theme'), 'src/theme'), ...await files(path.join(siteDir, 'src/clients'), 'src/clients')];
  for (const source of sharedSources) if (await dependencies(source)) return pages;
  const selected = [];
  for (const page of pages) {
    if (await dependencies(page.source)
      || (!page.source && page.route.includes('/technical-story') && changed.some(p => p.startsWith('technical-story/')))) selected.push(page);
  }
  return selected;
}

// Self-contained: the same function is embedded in the preview runtime.
export function previewUrl(value, config) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return value;
  const match = value.match(/^([^?#]*)(.*)$/);
  let pathname = match[1];
  if (config.locale === 'ko' && pathname.startsWith('/docs/')) pathname = '/ko' + pathname;
  const suffix = match[2];
  if (pathname === config.prefix || pathname === config.prefix + '/') return config.prefix + '/' + suffix;
  if (pathname.startsWith(config.prefix + '/')) pathname = pathname.slice(config.prefix.length);
  let staticPath = pathname.slice(1);
  if (staticPath.startsWith('ko/') && config.staticFiles.includes(staticPath.slice(3))) staticPath = staticPath.slice(3);
  if (config.staticFiles.includes(staticPath)) {
    return (config.changedStatic.includes(staticPath) ? config.prefix : '') + '/' + staticPath + suffix;
  }
  if (/^\/(?:ko\/)?interactive\/omx\//.test(pathname)) {
    pathname = pathname.replace(/^\/ko\//, '/');
    return (config.interactive ? config.prefix : '') + pathname + suffix;
  }
  if (config.assetFiles?.includes(pathname.slice(1))) {
    return (config.changedAssets.includes(pathname.slice(1)) ? config.prefix : '') + pathname + suffix;
  }
  if (/^\/(?:ko\/)?assets\//.test(pathname) || pathname === '/preview-runtime.js' || pathname === '/changes.html') return config.prefix + pathname + suffix;
  const route = pathname.replace(/\/$/, '') || '/';
  return (config.routes.includes(route) ? config.prefix : '') + pathname + suffix;
}

export function previewRequest(input, config, origin) {
  const value = input instanceof Request ? input.url : String(input);
  if (!value.startsWith('/') && !/^https?:/.test(value)) return input;
  const parsed = new URL(value, origin);
  if (parsed.origin !== origin) return input;
  const mapped = previewUrl(parsed.pathname + parsed.search + parsed.hash, config);
  const next = parsed.origin + mapped;
  if (next === parsed.href) return input;
  return input instanceof Request ? new Request(next, input) : next;
}

function runtime(config) {
  config = {...config, locale: window.location.pathname.startsWith(config.prefix + '/ko/') ? 'ko' : 'en'};
  const url = value => previewUrl(value, config);
  function update(element) {
    if (!(element instanceof Element)) return;
    for (const attr of ['href', 'src', 'poster']) {
      const before = element.getAttribute(attr);
      const after = url(before);
      if (after !== before) element.setAttribute(attr, after);
    }
    const srcset = element.getAttribute('srcset');
    if (srcset && !srcset.includes('data:')) {
      const next = srcset.split(',').map(part => part.trim().replace(/^\S+/, url)).join(', ');
      if (next !== srcset) element.setAttribute('srcset', next);
    }
  }
  function scan(root) {
    update(root);
    root.querySelectorAll?.('[href],[src],[poster],[srcset]').forEach(update);
  }
  new MutationObserver(records => records.forEach(record => {
    if (record.type === 'attributes') update(record.target);
    else record.addedNodes.forEach(scan);
  })).observe(document.documentElement, {subtree: true, childList: true, attributes: true,
    attributeFilter: ['href', 'src', 'poster', 'srcset']});
  scan(document.documentElement);
  // Full navigation avoids the bundled router showing pages omitted from the preview.
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
    const href = url(link.getAttribute('href'));
    if (!href?.startsWith('/') || href.startsWith('//')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(href);
  }, true);
  // Components also fetch static models/JSON without adding a DOM resource element.
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    return originalFetch.call(this, previewRequest(input, config, window.location.origin), init);
  };
}

export async function packagePreview({siteDir, outDir, pages, changed, number, sha}) {
  if (!Number.isSafeInteger(number) || number < 1 || !/^[a-f0-9]{40}$/.test(sha)) throw new Error('Invalid PR identity');
  await rm(outDir, {recursive: true, force: true});
  await mkdir(outDir, {recursive: true});
  const prefix = `/pr-preview/${number}`;
  const staticFiles = await files(path.join(siteDir, 'static'));
  const changedStatic = changed.filter(p => p.startsWith('static/')).map(p => p.slice(7));
  const config = {prefix, routes: pages.map(p => p.route.replace(/\/$/, '') || '/'),
    staticFiles: [...new Set([...staticFiles, ...changedStatic])], changedStatic,
    interactive: changed.some(p => p.startsWith('omx-assembly/'))};
  const build = path.join(siteDir, 'build');
  const assetSources = Object.assign({}, ...await Promise.all(['en', 'ko'].map(async locale =>
    JSON.parse(await readFile(path.join(build, `preview-assets-${locale}.json`), 'utf8').catch(() => '{}')))));
  config.assetFiles = Object.keys(assetSources).filter(f => !/\.(?:js|css)$/.test(f));
  config.changedAssets = config.assetFiles.filter(f => changed.includes(assetSources[f]));
  for (const assets of new Set(pages.map(p => p.route.startsWith('/ko/') ? 'ko/assets' : 'assets'))) {
    for (const relative of await files(path.join(build, assets))) {
      const file = `${assets}/${relative}`;
      if (!/\.(?:js|css)$/.test(file) && !config.changedAssets.includes(file)) continue;
      // Static files under /assets must not be mistaken for generated bundles.
      if (staticFiles.includes(file.replace(/^ko\//, ''))) continue;
      await mkdir(path.dirname(path.join(outDir, file)), {recursive: true});
      if (file.endsWith('.css')) {
        let css = await readFile(path.join(build, file), 'utf8');
        css = css.replace(/url\((['"]?)([^)'"]+)\1\)/g, (match, quote, value) => {
          if (/^(?:data:|https?:|\/\/|#)/.test(value)) return match;
          const absolute = value.startsWith('/') ? value : '/' + path.posix.normalize(path.posix.join(path.posix.dirname(file), value));
          return `url(${quote}${previewUrl(absolute, config)}${quote})`;
        });
        await writeFile(path.join(outDir, file), css);
      } else await cp(path.join(build, file), path.join(outDir, file));
    }
  }
  for (const file of pages.length ? changedStatic : []) {
    if (!staticFiles.includes(file)) continue; // deleted media intentionally has no preview file
    await mkdir(path.dirname(path.join(outDir, file)), {recursive: true});
    await cp(path.join(siteDir, 'static', file), path.join(outDir, file));
  }
  if (config.interactive && pages.length) await cp(path.join(build, 'interactive'), path.join(outDir, 'interactive'), {recursive: true});
  const published = [];
  for (const page of pages) {
    const relative = decodeURI(page.route).replace(/^\//, '');
    if (relative.split('/').includes('..')) throw new Error('Unsafe route');
    const candidates = relative ? [`${relative.replace(/\/$/, '')}/index.html`, `${relative}.html`] : ['index.html'];
    const file = (await Promise.all(candidates.map(async f => await access(path.join(build, f)).then(() => f, () => null)))).find(Boolean);
    if (!file) throw new Error(`No rendered HTML for ${page.route}`);
    let html = await readFile(path.join(build, file), 'utf8');
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1] ?? page.route;
    const pageConfig = {...config, locale: page.route.startsWith('/ko/') ? 'ko' : 'en'};
    // Handle Docusaurus' minified (often unquoted) HTML before the preload scanner.
    html = html.replace(/<(?:a|img|link|script|source|video|audio|iframe|embed|object)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi, tag =>
      tag.replace(/(\s(?:href|src|poster)=)(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
        (attribute, name, double, single, bare) => {
          const value = double ?? single ?? bare;
          const next = previewUrl(value, pageConfig);
          return next === value ? attribute : `${name}"${next.replace(/"/g, '&quot;')}"`;
        }));
    html = html.replace(/<head>/, `<head><meta name="robots" content="noindex,nofollow"><script src="${prefix}/preview-runtime.js"></script>`);
    await mkdir(path.dirname(path.join(outDir, file)), {recursive: true});
    await writeFile(path.join(outDir, file), html);
    published.push({...page, title});
  }
  await writeFile(path.join(outDir, 'preview-runtime.js'), `const previewUrl = ${previewUrl.toString()};\nconst previewRequest = ${previewRequest.toString()};\n(${runtime.toString()})(${JSON.stringify(config)});`);
  // The preview root is always an index of the actually published pages.
  const escape = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const links = published.map(p => `<li><a href="${escape(prefix + p.route)}">${escape(p.title)}</a></li>`).join('\n');
  await writeFile(path.join(outDir, 'changes.html'), `<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>PR #${number} preview</title><h1>PR #${number}</h1><p>Commit ${sha}</p><ul>${links}</ul><p>Only affected pages are published. Other links open the production site.</p>`);
  if (!published.some(p => p.route === '/')) await cp(path.join(outDir, 'changes.html'), path.join(outDir, 'index.html'));
  const manifest = {number, sha, pages: published.map(({route, title}) => ({route, title}))};
  await writeFile(path.join(outDir, 'preview-manifest.json'), JSON.stringify(manifest));
  let size = 0;
  for (const f of await files(outDir)) size += (await stat(path.join(outDir, f))).size;
  if (size > 400 * 1024 * 1024) throw new Error(`Preview exceeds 400 MiB: ${size} bytes`);
  console.log(`Preview: ${published.length} pages, ${(size / 1024 / 1024).toFixed(1)} MiB`);
  return manifest;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const siteDir = path.resolve('docusaurus');
  const number = Number(process.env.PR_NUMBER);
  const sha = process.env.PR_HEAD_SHA;
  const base = process.env.PR_BASE_SHA;
  if (!/^[a-f0-9]{40}$/.test(base ?? '') || !/^[a-f0-9]{40}$/.test(sha ?? '')) throw new Error('Invalid diff SHAs');
  const changed = execFileSync('git', ['diff', '--name-only', '-z', `${base}...${sha}`, '--', 'docusaurus/'], {encoding: 'utf8'}).split('\0').filter(Boolean).map(f => f.slice('docusaurus/'.length));
  const manifests = ['en', 'ko'].map(locale => path.join(siteDir, 'build', `preview-routes-${locale}.json`));
  const pages = (await Promise.all(manifests.map(async f => JSON.parse(await readFile(f, 'utf8'))))).flat();
  await packagePreview({siteDir, outDir: path.resolve('pr-preview'),
    pages: await selectPages(siteDir, pages, changed), changed, number, sha});
}
