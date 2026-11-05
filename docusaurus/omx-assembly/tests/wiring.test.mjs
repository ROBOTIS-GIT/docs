import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { cableInsertion } from "../src/timeline.mjs";
const load = (kind) =>
  JSON.parse(
    readFileSync(new URL(`../public/models/${kind}.json`, import.meta.url)),
  );
test("Two keyed plugs seat sequentially with continuous insertion", () => {
  assert.deepEqual(cableInsertion(0), [1, 1]);
  assert.deepEqual(cableInsertion(0.5), [0, 1]);
  assert.deepEqual(cableInsertion(1), [0, 0]);
  let last = [1, 1];
  for (let i = 0; i <= 1000; i++) {
    const now = cableInsertion(i / 1000);
    now.forEach((x, j) => {
      assert(x >= 0 && x <= 1);
      assert(x <= last[j] + 1e-12);
      assert(Math.abs(x - last[j]) < 0.008);
    });
    last = now;
  }
});
for (const kind of ["leader", "follower"])
  test(`${kind}: wiring preserves mechanical tracks and uses separate sockets`, () => {
    const m = load(kind),
      before = JSON.parse(
        readFileSync(
          new URL(`./fixtures/${kind}-mechanical.json`, import.meta.url),
        ),
      );
    // Official package labels are metadata; mechanical poses/tracks must remain identical.
    const mechanical = m.steps
      .slice(0, before.steps.length)
      .map(
        ({ officialLabel, officialLabelSource, officialLabelNote, ...step }) =>
          step,
      );
    // The added Leader shunt follows the existing board, verified in power.test.
    // Keep the original mechanical regression comparison for every existing part.
    if (kind === "leader") {
      for (const s of mechanical) {
        s.visible = s.visible.filter((id) => id !== 1303);
        s.active = s.active.filter((id) => id !== 1303);
        s.tracks = { ...s.tracks };
        s.offsets = { ...s.offsets };
        delete s.tracks["1303"];
        delete s.offsets["1303"];
        if (s.title === "Fit controller") {
          s.instructions = before.steps[s.index].instructions;
          delete s.prepareInstruction;
        }
      }
    }
    assert.deepEqual(mechanical, before.steps);
    const used = new Set();
    for (const [i, c] of m.cables.entries()) {
      for (const end of [c.from, c.to]) {
        assert(!used.has(end.partId), `occupied socket ${end.partId}`);
        used.add(end.partId);
        assert(m.parts.some((p) => p.id === end.partId));
      }
      const s = m.steps[c.stepIndex];
      assert.equal(s.wiringCable, c.partId);
      assert.deepEqual(
        s.visible.filter((id) => m.cables.some((c) => c.partId === id)),
        m.cables.slice(0, i + 1).map((x) => x.partId),
      );
      assert.equal(c.provisional, false);
      assert(c.path.flat().every(Number.isFinite));
    }
    const bin = readFileSync(
      new URL(`../public/models/${kind}.glb`, import.meta.url),
    );
    const g = JSON.parse(bin.toString("utf8", 20, 20 + bin.readUInt32LE(12)));
    const start = 20 + bin.readUInt32LE(12) + 8;
    for (const c of m.cables) {
      const node = g.nodes.find(
        (n) => n.name === `part_${String(c.partId).padStart(4, "0")}`,
      );
      const mesh = g.meshes[node.mesh];
      assert.equal(mesh.primitives.length, 3);
      for (const p of mesh.primitives) {
        assert.equal(p.targets.length, 2);
        for (const t of p.targets) {
          const a = g.accessors[t.POSITION],
            v = g.bufferViews[a.bufferView];
          assert.equal(a.count, g.accessors[p.attributes.POSITION].count);
          for (let i = 0; i < a.count * 3; i++)
            assert(
              Number.isFinite(
                bin.readFloatLE(
                  start + (v.byteOffset || 0) + (a.byteOffset || 0) + 4 * i,
                ),
              ),
            );
        }
      }
    }
  });
test("Follower OpenRB branches and converter nearest-actuator mapping", () => {
  const c = load("follower").cables;
  assert.deepEqual(
    c.slice(0, 2).map((x) => [x.from.label, x.to.label]),
    [
      ["OpenRB", "ID 11"],
      ["OpenRB", "ID 12"],
    ],
  );
  assert.deepEqual(
    c.slice(3, 5).map((x) => [x.from.partId, x.to.partId]),
    [
      [203, 392],
      [393, 239],
    ],
  );
  assert(
    c
      .slice(3, 5)
      .every((x) =>
        x.connectionEvidence.includes(
          "Nearest-side DYNAMIXEL connection confirmed",
        ),
      ),
  );
});
test("Frame routing crosses entry, middle web and exit in order for all three long links", () => {
  const routes = [
    ["leader", 2, 181],
    ["leader", 3, 214],
    ["follower", 2, 193],
  ];
  for (const [kind, index, frame] of routes) {
    const m = load(kind),
      c = m.cables[index],
      s = m.steps[c.stepIndex];
    assert.equal(s.routing.frameId, frame);
    assert(s.prepareInstruction.includes("middle web"));
    assert.equal(s.routing.openings.length, 3);
    let previous = -1;
    for (const { point } of s.routing.openings) {
      const distances = c.path.map((p) =>
          Math.hypot(...p.map((v, i) => v - point[i])),
        ),
        distance = Math.min(...distances),
        at = distances.indexOf(distance);
      assert(distance < 0.0006, `Path misses ${kind} ${frame} aperture`);
      assert(at > previous);
      previous = at;
    }
    assert(s.visible.includes(frame));
    assert(c.from.routingDepth);
  }
});
