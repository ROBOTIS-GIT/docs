#!/usr/bin/env node
// Render the procedural scissors scene to the first carton clip (no live WebGL).
// Requires Three.js, Playwright/Chromium and FFmpeg. Optional environment:
// THREE_BUILD_DIR, CHROME_PATH, FFMPEG. For still-frame QA: --preview <directory>.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {spawn} = require('node:child_process');
const {once} = require('node:events');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const threeBuild = process.env.THREE_BUILD_DIR || path.dirname(require.resolve('three'));
const step = JSON.parse(fs.readFileSync(path.join(root, 'src/components/AiWorkerUnboxing/steps.json')))[0].steps[0];
const output = path.join(root, 'static/img/systems/aiworker/quick_start_guide/setup_hardware/unboxing/carton', `${step.id}.mp4`);
const preview = process.argv[2] === '--preview' ? process.argv[3] : undefined;
const duration = (step.end - step.start) / 4;
const fps = 24;

(async () => {
  const routes = {
    '/scene.mjs': path.join(__dirname, 'unboxing-cutting-scene.mjs'),
    '/three/three.module.js': path.join(threeBuild, 'three.module.js'),
    '/three/three.core.js': path.join(threeBuild, 'three.core.js'),
  };
  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      res.setHeader('Content-Type', 'text/html');
      return res.end('<!doctype html><style>body{margin:0}canvas{display:block}</style><script type="importmap">{"imports":{"three":"/three/three.module.js"}}</script><script type="module" src="/scene.mjs"></script>');
    }
    const file = routes[req.url];
    if (!file) {res.writeHead(404); return res.end();}
    res.setHeader('Content-Type', 'text/javascript');
    fs.createReadStream(file).pipe(res);
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  let browser, encoder;
  const temporary = output.replace(/\.mp4$/, '.rendering.mp4');
  try {
    browser = await chromium.launch({executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
    const page = await browser.newPage({viewport: {width: 1120, height: 704}, deviceScaleFactor: 1});
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.waitForFunction(() => typeof window.renderUnboxingFrame === 'function');
    if (preview) {
      fs.mkdirSync(preview, {recursive: true});
      for (const t of [0, 1.5, 2.7, 3.45, 4.3, 5.6, 6.65, 7.5, 8.7]) {
        await page.evaluate(t => window.renderUnboxingFrame(t), t);
        await page.screenshot({path: path.join(preview, `${t}.png`)});
      }
    } else {
      fs.mkdirSync(path.dirname(output), {recursive: true});
      encoder = spawn(process.env.FFMPEG || 'ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-vcodec', 'png', '-i', 'pipe:0', '-an', '-c:v', 'libx264', '-crf', '22', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-threads', '2', temporary], {stdio: ['pipe', 'inherit', 'inherit']});
      let encoderFailure;
      encoder.stdin.on('error', error => {encoderFailure = error;});
      // Handle rejection immediately so spawn failures still reach finally.
      const completed = once(encoder, 'close').then(
        ([code]) => {
          if (code !== 0 || !encoder.stdin.writableEnded) {
            encoderFailure ??= new Error(`FFmpeg exited early or failed (${code})`);
          }
        },
        error => {encoderFailure = error;},
      );
      for (let frame = 0; frame < Math.round(duration * fps); frame++) {
        await page.evaluate(t => window.renderUnboxingFrame(t), frame * 2 / fps);
        const png = await page.screenshot();
        if (encoderFailure) throw encoderFailure;
        if (!encoder.stdin.write(png)) await once(encoder.stdin, 'drain');
        if (frame % fps === 0) console.log(`Rendering ${frame / fps}s / ${duration}s`);
      }
      encoder.stdin.end();
      await completed;
      if (encoderFailure) throw encoderFailure;
      if (errors.length) throw new Error(errors.join('\n'));
      fs.renameSync(temporary, output);
      console.log(`Rendered ${output}`);
    }
    if (errors.length) throw new Error(errors.join('\n'));
  } finally {
    encoder?.stdin.destroy();
    if (encoder && encoder.exitCode === null) encoder.kill();
    await browser?.close();
    server.close();
    fs.rmSync(temporary, {force: true});
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
