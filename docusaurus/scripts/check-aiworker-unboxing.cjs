// Run against the running docs site. Requires Playwright in NODE_PATH or locally.
// UNBOXING_TEST_URL, CHROME_PATH and UNBOXING_SCREENSHOT_DIR are optional.
const assert = require('node:assert/strict');
const {chromium} = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined,
    headless: true,
    args: ['--no-sandbox'],
  });
  try {
    const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.UNBOXING_TEST_URL || 'http://localhost:5715/docs/systems/aiworker/quick_start_guide/setup_hardware');
    const guide = page.getByRole('region', {name: 'Unboxing guide', exact: true});
    await guide.waitFor({timeout: 10000});
    const video = guide.locator('video');
    assert.equal(await video.count(), 1);
    assert.equal(await video.evaluate(v => v.paused), true, 'initial visit must stay paused');
    assert.ok(await video.getAttribute('poster'));
    assert.equal(await guide.getByRole('button', {name: 'Previous', exact: true}).isDisabled(), true);

    for (const [name, count, directory, durations] of [
      ['Cardboard box', 5, 'carton', [4.4375, 4, 3, 1.8125, 4.875]],
      ['Wooden crate', 4, 'wooden', [4.1875, 3, 1.8125, 4.875]],
    ]) {
      await guide.getByRole('button', {name, exact: true}).click();
      const steps = guide.getByRole('navigation', {name: 'Unboxing steps'}).getByRole('button');
      assert.equal(await steps.count(), count);
      for (let i = 0; i < count; i++) {
        await steps.nth(i).click();
        await page.waitForFunction(() => {
          const v = document.querySelector('[aria-label="Unboxing guide"] video');
          return v && v.readyState >= 2 && !v.paused;
        });
        const state = await video.evaluate(v => ({src: v.currentSrc, loop: v.loop, muted: v.muted, controls: v.controls, duration: v.duration, width: v.videoWidth}));
        assert.ok(state.src.includes(`/${directory}/`));
        assert.ok(state.loop && state.muted && state.controls);
        assert.ok(state.width > 0);
        assert.ok(Math.abs(state.duration - durations[i]) < 0.06, `${directory} step ${i + 1} must play at 4x speed`);
        assert.equal(await steps.nth(i).getAttribute('aria-current'), 'step');
      }
      assert.equal(await guide.getByRole('button', {name: 'Next', exact: true}).isDisabled(), true);
      await guide.getByRole('button', {name: 'Previous', exact: true}).click();
      assert.equal(await steps.nth(count - 2).getAttribute('aria-current'), 'step');
    }

    const steps = guide.getByRole('navigation', {name: 'Unboxing steps'}).getByRole('button');
    await steps.nth(0).focus();
    await page.keyboard.press('Enter');
    assert.equal(await steps.nth(0).getAttribute('aria-current'), 'step');
    await page.waitForFunction(() => document.querySelector('[aria-label="Unboxing guide"] video').readyState >= 2);
    await video.evaluate(v => {v.pause(); v.currentTime = v.duration / 2;});
    await steps.nth(0).click();
    await page.waitForFunction(() => {
      const v = document.querySelector('[aria-label="Unboxing guide"] video');
      return v && !v.paused && v.currentTime < 1;
    });
    await video.evaluate(v => {v.currentTime = v.duration - 0.1;});
    await page.waitForFunction(() => document.querySelector('[aria-label="Unboxing guide"] video').currentTime < 1);
    assert.equal(await steps.nth(0).getAttribute('aria-current'), 'step', 'loop must not advance the step');
    await video.evaluate(v => v.pause());
    assert.equal(await video.evaluate(v => v.paused), true);

    await guide.getByRole('button', {name: 'Cardboard box', exact: true}).click();
    assert.equal(await steps.nth(0).getAttribute('aria-current'), 'step');
    assert.equal(await guide.getByRole('button', {name: 'Previous', exact: true}).isDisabled(), true);
    if (process.env.UNBOXING_SCREENSHOT_DIR) {
      await guide.screenshot({path: `${process.env.UNBOXING_SCREENSHOT_DIR}/desktop.png`});
    }
    await page.setViewportSize({width: 390, height: 844});
    assert.equal(await guide.evaluate(el => el.scrollWidth <= el.clientWidth), true, 'guide must fit mobile width');
    await steps.nth(4).click();
    assert.equal(await steps.nth(4).getAttribute('aria-current'), 'step');
    if (process.env.UNBOXING_SCREENSHOT_DIR) {
      await guide.screenshot({path: `${process.env.UNBOXING_SCREENSHOT_DIR}/mobile.png`});
    }
    assert.deepEqual(errors, []);
    console.log('PASS: all 9 merged clips at 4x speed, paused entry, selection/replay, looping, package reset, navigation boundaries, keyboard and mobile layout.');
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
