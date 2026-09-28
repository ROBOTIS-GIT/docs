import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const load = (n) =>
  JSON.parse(
    readFileSync(new URL(`../public/models/${n}.json`, import.meta.url)),
  );
const current = load("follower"),
  legacy = load("follower-xl4015");
const changed = new Set([221, 310, 394, 395, 396, 397]);
test("XL4015 variant changes only scoped parts and removes incompatible BIC30 cable plugs", () => {
  assert.equal(legacy.steps.length, current.steps.length);
  for (const p of legacy.parts)
    if (p.id < 1200 && !changed.has(p.id))
      assert.deepEqual(
        p,
        current.parts.find((x) => x.id === p.id),
      );
  assert(!legacy.parts.some((p) => p.id === 1003 || p.id === 1004));
  assert(!legacy.cables.some((p) => p.partId === 1003 || p.partId === 1004));
  const ids = new Set(legacy.parts.map((p) => p.id));
  for (const s of legacy.steps) {
    for (const id of [
      ...s.visible,
      ...s.active,
      ...Object.keys(s.tracks).map(Number),
    ])
      assert(ids.has(id));
  }
});
test("Legacy converter mounting screws use the 21 x 56.5 mm source pattern", () => {
  const p = [394, 395, 396, 397].map((id) =>
    legacy.parts.find((p) => p.id === id),
  );
  assert(
    Math.abs(
      Math.max(...p.map((p) => p.finalPosition[0])) -
        Math.min(...p.map((p) => p.finalPosition[0])) -
        0.021,
    ) < 1e-9,
  );
  assert(
    Math.abs(
      Math.max(...p.map((p) => p.finalPosition[2])) -
        Math.min(...p.map((p) => p.finalPosition[2])) -
        0.0565,
    ) < 1e-9,
  );
  for (const s of legacy.steps)
    for (const [id, track] of Object.entries(s.tracks))
      if (changed.has(+id))
        track
          .at(-1)
          .slice(1)
          .forEach((x, k) =>
            assert(
              Math.abs(
                x - legacy.parts.find((p) => p.id === +id).finalPosition[k],
              ) < 1e-6,
            ),
          );
});
test("Legacy harness seats input before output and ends with all six connections seated", () => {
  const a = legacy.steps[68],
    b = legacy.steps[69];
  assert(!a.staticReview && !b.staticReview);
  assert.equal(a.wiringCable, 1200);
  assert.deepEqual(
    a.morphTracks["1200"].at(-1).slice(1),
    b.morphTracks["1200"][0].slice(1),
  );
  assert.deepEqual(b.morphTracks["1200"].at(-1).slice(1), [0, 0, 0, 0, 0, 0]);
  assert.deepEqual(
    a.routing.openings.map((x) => x.label),
    ["IN+", "IN−"],
  );
  assert.deepEqual(
    b.routing.openings.map((x) => x.label),
    ["OUT+", "OUT−"],
  );
  for (const step of [a, b]) {
    const keys = step.morphTracks["1200"];
    for (let i = 1; i < keys.length; i++) assert(keys[i][0] >= keys[i - 1][0]);
    for (const key of keys)
      for (const w of key.slice(1)) assert(w >= 0 && w <= 1);
    assert(
      step.reference.url.startsWith(
        "https://www.youtube.com/watch?v=mFXQkIDG69k",
      ),
    );
  }
});
test("Legacy parts resolve to their own GLB nodes", () => {
  const glb = readFileSync(
    new URL("../public/models/follower-xl4015.glb", import.meta.url),
  );
  const g = JSON.parse(glb.toString("utf8", 20, 20 + glb.readUInt32LE(12)));
  const nodes = new Set(g.nodes.map((n) => n.name));
  for (const p of legacy.parts) assert(nodes.has(p.node));
});

test("Legacy input and output insert every corresponding endpoint at the same gradual speed", async () => {
  const { sampleTrack } = await import("../src/timeline.mjs");
  const a = legacy.steps[68],
    b = legacy.steps[69];
  assert.equal(a.duration, b.duration);
  for (let i = 0; i <= 1000; i++) {
    const x = sampleTrack(a.morphTracks["1200"], i / 1000),
      y = sampleTrack(b.morphTracks["1200"], i / 1000);
    for (const [input, output] of [
      [2, 4],
      [3, 5],
      [0, 1],
    ])
      assert(
        Math.abs(x[input] - y[output]) < 1e-9,
        `Endpoint ${output} disagrees at ${i / 1000}`,
      );
  }
  for (const [t, endpoint] of [
    [0.215, 4],
    [0.495, 5],
    [0.795, 1],
  ])
    assert(
      Math.abs(sampleTrack(b.morphTracks["1200"], t)[endpoint] - 0.5) < 1e-9,
    );
});
