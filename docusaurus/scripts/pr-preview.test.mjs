import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {selectPages, packagePreview, previewUrl, previewRequest} from './pr-preview.mjs';

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'preview-test-'));
  async function put(file, text = '') {
    await mkdir(path.dirname(path.join(root, file)), {recursive: true});
    await writeFile(path.join(root, file), text);
  }
  await put('docs/a.mdx', "import Part from './_parts/part.mdx';\n<Part />");
  await put('docs/_parts/part.mdx', "import Box from '@site/src/components/Box';\n<Box />");
  await put('src/components/Box/index.tsx', 'export default () => null;');
  await put('docs/b.mdx', '![image](/img/new.png)');
  await put('i18n/ko/a.mdx', '번역');
  const pages = [
    {source: 'docs/a.mdx', route: '/docs/custom-a'},
    {source: 'docs/b.mdx', route: '/docs/b'},
    {source: 'i18n/ko/a.mdx', route: '/ko/docs/custom-a'},
  ];
  return {root, put, pages};
}

test('selects custom-slug pages and transitive partial/component consumers', async () => {
  const {root, pages} = await fixture();
  assert.deepEqual((await selectPages(root, pages, ['docs/_parts/part.mdx'])).map(p => p.route), ['/docs/custom-a']);
  assert.deepEqual((await selectPages(root, pages, ['src/components/Box/index.tsx'])).map(p => p.route), ['/docs/custom-a']);
});

test('selects changed localized pages and consumers of changed static media', async () => {
  const {root, pages} = await fixture();
  assert.deepEqual((await selectPages(root, pages, ['i18n/ko/a.mdx'])).map(p => p.route), ['/ko/docs/custom-a']);
  assert.deepEqual((await selectPages(root, pages, ['static/img/new.png'])).map(p => p.route), ['/docs/b']);
  assert.deepEqual(await selectPages(root, pages, ['docs/deleted.mdx']), []);
  assert.deepEqual(await selectPages(root, pages, ['src/css/custom.css']), []);
});

test('maps selected pages/media into preview, other pages/media into production', () => {
  const config = {prefix: '/pr-preview/12', routes: ['/docs/a', '/ko/docs/a'],
    staticFiles: ['img/old.png', 'img/new.png', 'img/deleted.png'], changedStatic: ['img/new.png', 'img/deleted.png']};
  for (const [input, expected] of [
    ['/docs/a#x', '/pr-preview/12/docs/a#x'],
    ['/pr-preview/12/docs/b', '/docs/b'],
    ['/pr-preview/12/img/old.png', '/img/old.png'],
    ['/ko/img/new.png', '/pr-preview/12/img/new.png'],
    ['/img/deleted.png', '/pr-preview/12/img/deleted.png'],
    ['/pr-preview/12/ko/assets/js/a.js', '/pr-preview/12/ko/assets/js/a.js'],
    ['https://other.test/docs/a', 'https://other.test/docs/a'],
    ['#section', '#section'],
  ]) assert.equal(previewUrl(input, config), expected);
});

test('packages only selected HTML, runtime assets and modified media', async () => {
  const {root, put} = await fixture();
  await put('build/docs/a/index.html', '<html><head><title>A</title></head><body><img src="/img/new.png"></body></html>');
  await put('build/docs/b/index.html', 'not selected');
  await put('build/assets/js/main.js', 'runtime');
  await put('build/ko/assets/js/main.js', 'korean runtime');
  await put('static/img/new.png', 'new');
  await put('static/img/old.png', 'old');
  const manifest = await packagePreview({siteDir: root, outDir: path.join(root, 'preview'),
    pages: [{route: '/docs/a', source: 'docs/a.mdx'}], changed: ['static/img/new.png'],
    number: 12, sha: 'a'.repeat(40)});
  assert.equal(manifest.pages[0].route, '/docs/a');
  assert.match(await readFile(path.join(root, 'preview/docs/a/index.html'), 'utf8'), /preview-runtime.js/);
  await access(path.join(root, 'preview/assets/js/main.js'));
  await access(path.join(root, 'preview/img/new.png'));
  await assert.rejects(access(path.join(root, 'preview/docs/b/index.html')));
  await assert.rejects(access(path.join(root, 'preview/img/old.png')));
});

test('tracks media assembled from a component directory and filename', async () => {
  const {root, put, pages} = await fixture();
  await put('src/components/Box/index.tsx', 'const base = "/img/product/"; const image = `${base}${name}.png`;');
  assert.deepEqual((await selectPages(root, pages, ['static/img/product/example.png'])).map(p => p.route), ['/docs/custom-a']);
});

test('separates unchanged bundled/static media from preview JS and normalizes OMX locale', () => {
  const config = {prefix: '/pr-preview/12', routes: [], staticFiles: ['assets/robot.glb'], changedStatic: [],
    assetFiles: ['assets/images/old-123.png', 'assets/images/new-456.png'], changedAssets: ['assets/images/new-456.png'], interactive: true};
  assert.equal(previewUrl('/pr-preview/12/assets/robot.glb', config), '/assets/robot.glb');
  assert.equal(previewUrl('/pr-preview/12/assets/images/old-123.png', config), '/assets/images/old-123.png');
  assert.equal(previewUrl('/pr-preview/12/assets/images/new-456.png', config), '/pr-preview/12/assets/images/new-456.png');
  assert.equal(previewUrl('/pr-preview/12/ko/interactive/omx/index.html', config), '/pr-preview/12/interactive/omx/index.html');
});

test('omits unchanged bundled media and always emits a separate page listing', async () => {
  const {root, put} = await fixture();
  await put('build/index.html', '<html><head></head><body>Home</body></html>');
  await put('build/assets/js/main.js', 'runtime');
  await put('build/assets/images/old-123.png', 'old');
  await put('build/assets/images/new-456.png', 'new');
  await put('build/preview-assets-en.json', JSON.stringify({
    'assets/images/old-123.png': 'static/img/old.png', 'assets/images/new-456.png': 'static/img/new.png'}));
  await put('static/img/new.png', 'new');
  await packagePreview({siteDir: root, outDir: path.join(root, 'preview'), pages: [{route: '/', source: 'src/pages/index.tsx'}],
    changed: ['static/img/new.png'], number: 12, sha: 'a'.repeat(40)});
  await assert.rejects(access(path.join(root, 'preview/assets/images/old-123.png')));
  await access(path.join(root, 'preview/assets/images/new-456.png'));
  assert.match(await readFile(path.join(root, 'preview/changes.html'), 'utf8'), /PR #12/);
  assert.match(await readFile(path.join(root, 'preview/index.html'), 'utf8'), /Home/);
});

test('global-only media changes do not select documents and Korean URLs stay localized', async () => {
  const {root, put, pages} = await fixture();
  await put('docusaurus.config.ts', 'const logo = "/img/logo.png";');
  assert.deepEqual(await selectPages(root, pages, ['static/img/logo.png']), []);
  const config = {prefix: '/pr-preview/12', locale: 'ko', routes: ['/docs/a', '/ko/docs/a'], staticFiles: [], changedStatic: []};
  assert.equal(previewUrl('/docs/a', config), '/pr-preview/12/ko/docs/a');
  assert.equal(previewUrl('/pr-preview/12/docs/a', config), '/pr-preview/12/docs/a');
});

test('rewrites initial SSR resource URLs before browser preload and handles sibling images precisely', async () => {
  const {root, put, pages} = await fixture();
  await put('docs/b.mdx', '![other](/img/product/other.png)');
  assert.deepEqual(await selectPages(root, pages, ['static/img/product/example.png']), []);
  await put('build/docs/a/index.html', '<html><head><link rel=preload as=image href=/pr-preview/12/img/old.png></head><body><img src="/pr-preview/12/img/old.png"><img src=/img/new.png></body></html>');
  await put('static/img/old.png', 'old');
  await put('static/img/new.png', 'new');
  await packagePreview({siteDir: root, outDir: path.join(root, 'preview'), pages: [{route:'/docs/a',source:'docs/a.mdx'}],
    changed:['static/img/new.png'], number:12, sha:'a'.repeat(40)});
  const html = await readFile(path.join(root,'preview/docs/a/index.html'),'utf8');
  assert.doesNotMatch(html,/\/pr-preview\/12\/img\/old.png/);
  assert.match(html,/src="\/pr-preview\/12\/img\/new.png"/);
});


test('maps Request and URL objects used by asset loaders without losing request options', () => {
  const config = {prefix: '/pr-preview/12', routes: [], staticFiles: ['assets/robot.stl'], changedStatic: []};
  const original = new Request('https://docs.robotis.com/pr-preview/12/assets/robot.stl', {headers: {'X-Test':'kept'}});
  const mapped = previewRequest(original, config, 'https://docs.robotis.com');
  assert.equal(mapped.url, 'https://docs.robotis.com/assets/robot.stl');
  assert.equal(mapped.headers.get('X-Test'), 'kept');
  assert.equal(previewRequest(new URL(original.url), config, 'https://docs.robotis.com'), 'https://docs.robotis.com/assets/robot.stl');
  const external = new Request('https://example.test/pr-preview/12/assets/robot.stl');
  assert.equal(previewRequest(external, config, 'https://docs.robotis.com'), external);
});


test('tracks asset directory constants without a trailing slash', async () => {
  const {root, put, pages} = await fixture();
  await put('src/components/Box/index.tsx', 'const base = "/assets/robot"; const url = `${base}/meshes/part.stl`;');
  assert.deepEqual((await selectPages(root, pages, ['static/assets/robot/meshes/part.stl'])).map(p=>p.route), ['/docs/custom-a']);
});


test('config, navbar translations and blog-only changes never select unrelated DXL pages', async () => {
  const {root, put, pages} = await fixture();
  await put('src/theme/BlogListPage/index.tsx', "import Grid from '@site/src/components/StoryGrid';");
  await put('src/components/StoryGrid/index.tsx', 'export default () => null;');
  await put('technical-story/story.mdx', 'A story');
  const routes = [...pages,
    {source: 'technical-story/story.mdx', route: '/technical-story/story'},
    {source: null, route: '/technical-story'},
    {source: null, route: '/ko/technical-story'},
    {source: null, route: '/technical-story/tags/robot'},
    {source: null, route: '/docs/tags'},
  ];
  const common = ['docusaurus.config.ts', 'i18n/ko/docusaurus-theme-classic/navbar.json', 'src/css/custom.css'];
  assert.deepEqual(await selectPages(root, routes, common), []);
  assert.deepEqual((await selectPages(root, routes, [...common, 'technical-story/story.mdx'])).map(p => p.route),
    ['/technical-story/story', '/technical-story', '/ko/technical-story', '/technical-story/tags/robot']);
  assert.deepEqual((await selectPages(root, routes, ['src/components/StoryGrid/index.tsx'])).map(p => p.route),
    ['/technical-story', '/ko/technical-story', '/technical-story/tags/robot']);
  assert.deepEqual((await selectPages(root, routes, [...common, 'docs/a.mdx'])).map(p => p.route), ['/docs/custom-a']);
});
