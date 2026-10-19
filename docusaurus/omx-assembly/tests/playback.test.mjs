import test from "node:test";
import assert from "node:assert/strict";
import { advancePlayback } from "../src/playback.mjs";
test("Autoplay waits for camera framing before advancing the assembly", () => {
  let s = { progress: 0, delay: 0.75 };
  for (let i = 0; i < 7; i++)
    s = advancePlayback(s.progress, s.delay, 0.1, 4, 1);
  assert.equal(s.progress, 0);
  s = advancePlayback(s.progress, s.delay, 0.1, 4, 1);
  assert.equal(s.delay, 0);
  assert.equal(s.progress, 0);
  s = advancePlayback(s.progress, s.delay, 0.1, 4, 1);
  assert.equal(s.progress, 0.025);
});
test("Playback shows the exact seated pose, holds it, and repeats without reversing", () => {
  let s = advancePlayback(0.99, 0, 0.1, 4, 1);
  assert.deepEqual(s, { progress: 1, delay: 1.5 });
  for (let i = 0; i < 14; i++)
    s = advancePlayback(s.progress, s.delay, 0.1, 4, 1);
  assert.equal(s.progress, 1);
  while (s.delay > 0) s = advancePlayback(s.progress, s.delay, 0.1, 4, 1);
  assert.equal(s.progress, 1);
  s = advancePlayback(s.progress, s.delay, 0.1, 4, 1);
  assert.equal(s.progress, 0);
  s = advancePlayback(s.progress, s.delay, 0.1, 4, 1);
  assert(s.progress > 0 && s.progress < 1);
});
test("Playback speed changes motion time but not the seated inspection hold", () => {
  assert.equal(
    advancePlayback(0, 0, 0.1, 4, 1.5).progress,
    0.037500000000000006,
  );
  assert.deepEqual(advancePlayback(1, 1.5, 0.1, 4, 1.5), {
    progress: 1,
    delay: 1.4,
  });
});
