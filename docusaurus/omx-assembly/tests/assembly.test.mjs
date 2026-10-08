import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { sampleTrack, stepPosition, activeParts } from "../src/timeline.mjs";
const data = (kind) =>
  JSON.parse(
    readFileSync(new URL(`../public/models/${kind}.json`, import.meta.url)),
  );
test("Scrubbing reaches original poses and interpolates inside each sampled motion", () => {
  const keys = [
    [0, 1, 2, 3],
    [0.3, 4, 2, -1],
    [1, 4, 9, -1],
  ];
  assert.deepEqual(sampleTrack(keys, -1), [1, 2, 3]);
  assert.deepEqual(sampleTrack(keys, 2), [4, 9, -1]);
  assert.deepEqual(sampleTrack(keys, 0.15), [2.5, 2, 1]);
  assert(
    sampleTrack(keys, 0.65).every(
      (v, i) => Math.abs(v - [4, 5.5, -1][i]) < 1e-12,
    ),
  );
});
for (const kind of ["leader", "follower"])
  test(`${kind}: all assembly steps address real GLB nodes and finite CAD poses`, () => {
    const m = data(kind);
    const ids = new Set(m.parts.map((p) => p.id));
    assert.equal(ids.size, m.parts.length);
    assert.equal(m.steps.length, kind === "leader" ? 58 : 72);
    const glb = readFileSync(
      new URL(`../public/models/${kind}.glb`, import.meta.url),
    );
    assert.equal(glb.toString("ascii", 0, 4), "glTF");
    const gltf = JSON.parse(
      glb.toString("utf8", 20, 20 + glb.readUInt32LE(12)),
    );
    const nodes = new Set(gltf.nodes.map((n) => n.name));
    for (const p of m.parts) {
      assert(nodes.has(p.node), p.node);
      assert(p.finalPosition.every(Number.isFinite));
      assert(!/connector.*cover/i.test(p.sourceName));
    }
    for (const [i, s] of m.steps.entries()) {
      assert.equal(s.index, i);
      assert(s.visible.length > 0, `${s.title}: empty scene`);
      assert(s.duration > 0);
      assert(s.camera.scale > 0);
      assert(s.camera.target.every(Number.isFinite));
      for (const id of [...s.visible, ...activeParts(s)])
        assert(ids.has(id), `${s.title}: missing ${id}`);
      for (const [id, keys] of Object.entries(s.tracks)) {
        assert(s.visible.includes(Number(id)));
        assert.equal(keys[0][0], 0);
        assert.equal(keys.at(-1)[0], 1);
        for (let k = 0; k < keys.length; k++) {
          assert(keys[k].every(Number.isFinite));
          if (k) assert(keys[k][0] > keys[k - 1][0]);
        }
        assert.deepEqual(
          stepPosition(
            m.parts.find((p) => p.id === +id),
            s,
            1,
          ),
          keys.at(-1).slice(1),
        );
      }
    }
    const board = m.parts.filter((p) => p.group === 2);
    assert.equal(board.length, 136);
    const fit = m.steps.find((s) => s.title === "Fit controller");
    assert.equal(fit.active.length, 136);
    assert(board.every((p) => fit.active.includes(p.id)));
  });
test("Module joining animates the whole subassembly without resetting its staged pose", () => {
  const m = data("leader");
  const joins = m.steps.filter((s) => s.isJoin);
  assert(joins.length);
  for (const s of joins) {
    assert(activeParts(s).length > 0);
    for (const p of m.parts.filter((p) => s.offsets[p.id]))
      assert.deepEqual(stepPosition(p, s, 0.5), s.offsets[p.id]);
  }
});
