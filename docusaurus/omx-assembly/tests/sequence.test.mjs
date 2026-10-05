import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { completedStepIndices } from "../src/timeline.mjs";
const data = (kind) =>
  JSON.parse(
    readFileSync(new URL(`../public/models/${kind}.json`, import.meta.url)),
  );
const m = data("follower");
test("Each jaw idler cap is immediately retained on its matching axis before further assembly", () => {
  for (const [capId, screwId] of [
    [298, 309],
    [299, 308],
  ]) {
    const i = m.steps.findIndex((s) => s.active.includes(capId));
    assert.deepEqual(m.steps[i].active, [capId]);
    assert.deepEqual(m.steps[i + 1].active, [screwId]);
    const cap = m.parts.find((p) => p.id === capId),
      screw = m.parts.find((p) => p.id === screwId);
    assert.match(screw.sourceName, /M2_6X6/);
    for (const k of [0, 2])
      assert(Math.abs(cap.finalPosition[k] - screw.finalPosition[k]) < 1e-6);
    assert(
      !m.steps[i].visible.includes(screwId),
      "screw must not appear before its own step",
    );
    assert(m.steps[i + 1].visible.includes(capId));
  }
  let visible = new Set(m.steps[49].visible);
  for (const s of m.steps.slice(50, 58)) {
    s.active.forEach((id) => visible.add(id));
    assert.deepEqual(
      s.visible,
      [...visible].sort((a, b) => a - b),
    );
  }
  for (const id of visible) assert(m.steps[58].visible.includes(id));
});
test("Existing follower completion indices migrate to the same physical operations", () => {
  assert.deepEqual(
    completedStepIndices({ completed: [52, 53, 54, 55, 56, 57, 58] }, m),
    [54, 56, 51, 52, 57, 55, 58],
  );
  const indices = completedStepIndices({ completed: [53, 57] }, m);
  const saved = {
    completed: indices,
    completedLabels: indices.map((i) => m.steps[i].label),
  };
  assert.deepEqual(completedStepIndices(saved, m), indices);
  assert.deepEqual(completedStepIndices({ completed: [0, 63] }, m), [0, 64]);
});
test("Stable completion labels, empty and invalid records are handled without phantom completion", () => {
  assert.deepEqual(
    completedStepIndices({ completedLabels: [], completed: [53] }, m),
    [],
  );
  assert.deepEqual(
    completedStepIndices(
      { completedLabels: ["52b", "52b", "bad", null, 53] },
      m,
    ),
    [56],
  );
  assert.deepEqual(
    completedStepIndices({ completed: [-1, 0.5, 64, "53", null, 53, 53] }, m),
    [56],
  );
  assert.deepEqual(completedStepIndices(null, m), []);
  assert.deepEqual(completedStepIndices({ completed: "bad" }, m), []);
  const leader = data("leader");
  assert.deepEqual(
    completedStepIndices({ completed: [0, 20, 51] }, leader),
    [0, 20, 51],
  );
});

test("Drive jaw is fixed on both faces before the opposing jaw or its caps appear", () => {
  const drive = m.steps.findIndex((s) => s.active.includes(296));
  assert.deepEqual(m.steps[drive + 1].active, [300, 301, 302, 303]);
  assert.deepEqual(m.steps[drive + 2].active, [304, 305, 306, 307]);
  assert.deepEqual(m.steps[drive + 3].active, [297]);
  for (const s of m.steps.slice(drive, drive + 3)) {
    for (const id of [297, 298, 299, 308, 309]) assert(!s.visible.includes(id));
  }
  for (const id of [296, 300, 301, 302, 303, 304, 305, 306, 307])
    assert(m.steps[drive + 3].visible.includes(id));
  for (const s of m.steps.slice(drive + 1, drive + 3)) {
    const ps = s.active.map((id) => m.parts.find((p) => p.id === id));
    const center = m.parts.find((p) => p.id === 296).finalPosition;
    for (const k of [0, 2])
      assert(
        Math.abs(
          ps.reduce((v, p) => v + p.finalPosition[k], 0) / 4 - center[k],
        ) < 1e-6,
      );
  }
});
test("v010 completed labels still identify the same operations after drive-jaw reorder", () => {
  assert.deepEqual(
    completedStepIndices(
      { completed: [51, 53, 56], completedLabels: ["51b", "56", "53"] },
      m,
    ),
    [53, 55, 51],
  );
});

test("Both follower variants finish all six base screws before OpenRB installation", () => {
  for (const kind of ["follower", "follower-xl4015"]) {
    const manual = data(kind);
    const board = manual.steps.findIndex((s) => s.title === "Fit controller");
    const boardIds = manual.steps[board].active;
    const screws = [155, 156, 157, 158, 159, 160];
    assert.equal(board, 5);
    for (const id of screws) {
      const fastening = manual.steps.findIndex((s) => s.active.includes(id));
      assert(fastening < board, `screw ${id} must precede the controller`);
      assert(manual.steps[board].visible.includes(id));
    }
    for (const s of manual.steps.slice(0, board))
      for (const id of boardIds) assert(!s.visible.includes(id));
    for (const s of manual.steps.slice(board, 8))
      for (const id of screws) assert(s.visible.includes(id));
    assert.deepEqual(manual.steps[6].active, [137, 138, 139, 140]);
    assert.deepEqual(
      completedStepIndices({ completed: [4, 5, 6] }, manual),
      [5, 6, 4],
    );
    assert.deepEqual(
      completedStepIndices({ completedLabels: ["07"] }, manual),
      [4],
    );
  }
});
