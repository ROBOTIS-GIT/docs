const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const plugin = require('./technical-story-redirects.cjs');
const redirects = require('../src/data/technicalStoryRedirects.json');

for (const baseUrl of ['/', '/ko/', '/pr-preview/123/']) {
  test(`preserves all legacy routes under ${baseUrl}`, async () => {
    const routes = [];
    const data = new Map();
    await plugin({baseUrl}).contentLoaded({actions: {
      createData: async (name, content) => {data.set(name, JSON.parse(content)); return name;},
      addRoute: route => routes.push(route),
    }});
    assert.equal(routes.length, 18);
    assert.equal(new Set(routes.map(route => route.path)).size, routes.length);
    for (const [from, to] of Object.entries(redirects)) {
      const route = routes.find(route => route.path === baseUrl + from.slice(1));
      assert.ok(route, from);
      assert.equal(route.exact, true);
      assert.equal(data.get(route.modules.destination).to, baseUrl + to.slice(1));
      if (to.startsWith('/technical-story/tags/')) {
        const tag = to.split('/').pop();
        assert.match(fs.readFileSync(path.join(__dirname, '../technical-story/tags.yml'), 'utf8'), new RegExp(`^${tag}:`, 'm'));
      } else {
        assert.ok(fs.existsSync(path.join(__dirname, '../technical-story', to.split('/').pop() + '.mdx')), to);
      }
    }
    assert.equal(data.get(routes.find(route => route.path.endsWith('/tactile_inference_revision_1')).modules.destination).to,
      baseUrl + 'technical-story/ai-worker-tactile-inference');
  });
}
