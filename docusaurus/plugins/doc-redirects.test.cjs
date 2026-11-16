const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const plugin = require('./doc-redirects.cjs');
const redirects = require('../src/data/docRedirects.json');

const root = path.join(__dirname, '../docs');
const published = new Set();
function visit(dir) {
  for (const item of fs.readdirSync(dir, {withFileTypes: true})) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) {if (item.name !== '_partials') visit(file); continue;}
    if (!/\.mdx?$/.test(item.name)) continue;
    const parts = path.relative(root, file).replace(/\.mdx?$/, '').split(path.sep);
    const slug = fs.readFileSync(file, 'utf8').match(/^slug:\s*(\S+)\s*$/m)?.[1];
    if (slug?.startsWith('/')) {
      published.add(`/docs${slug}`);
    } else if (slug) {
      published.add(`/docs/${[...parts.slice(0, -1), slug].join('/')}`);
    } else {
      if (['index', parts.at(-2)].includes(parts.at(-1))) parts.pop();
      published.add(`/docs/${parts.join('/')}`);
    }
  }
}
visit(path.join(root, 'systems/aiworker'));
visit(path.join(root, 'software/cyclo'));
visit(path.join(root, 'common'));

for (const baseUrl of ['/', '/ko/', '/pr-preview/123/']) {
  test(`moved docs have one valid destination under ${baseUrl}`, async () => {
    const routes = [];
    const data = new Map();
    await plugin({baseUrl}).contentLoaded({actions: {
      createData: async (name, content) => {data.set(name, JSON.parse(content)); return name;},
      addRoute: route => routes.push(route),
    }});
    assert.equal(routes.length, Object.keys(redirects).length);
    assert.equal(new Set(routes.map(route => route.path)).size, routes.length);
    for (const [from, value] of Object.entries(redirects)) {
      const to = typeof value === 'string' ? value : value.to;
      const target = to.split('#')[0];
      assert.ok(published.has(target), `Missing destination: ${to}`);
      assert.ok(!published.has(from), `Old document still exists: ${from}`);
      assert.ok(!redirects[target], `Redirect chain: ${from}`);
      const route = routes.find(item => item.path === baseUrl + from.slice(1));
      assert.ok(route, from);
      assert.equal(data.get(route.modules.destination).to, baseUrl + to.slice(1));
    }
    assert.ok(!Object.keys(redirects).some(item => item.includes('/diagnostic')));
    assert.ok(!published.has('/docs/systems/aiworker/quick_start_guide/diagnostic'));
  });
}
