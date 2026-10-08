import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stepPosition, completedStepIndices } from "../src/timeline.mjs";
const m = JSON.parse(
  readFileSync(new URL("../public/models/follower.json", import.meta.url)),
);
const ps = new Map(m.parts.map((p) => [p.id, p]));
const [prep, fit, secure, join, last] = m.steps.slice(60);
const ids = [398, 399, 400, 401, 402, 403];
const close = (a, b) =>
  a.forEach((v, k) => assert(Math.abs(v - b[k]) < 2e-8, `${a} != ${b}`));
const sub = (a, b) => a.map((v, k) => v - b[k]);
test("Camera is fastened to a free bracket before the complete module is installed", () => {
  assert.equal(prep.label, "camera-prep-v013");
  assert.equal(prep.sourceFrames, null);
  assert.deepEqual(fit.active, [399]);
  assert.deepEqual(secure.active, [400, 401, 402, 403]);
  assert.deepEqual(join.active, ids);
  assert.deepEqual(last.active, [404, 405, 406]);
  assert(join.isJoin);
  assert(!prep.visible.includes(399));
  assert(!fit.visible.includes(400));
  assert(!secure.visible.includes(404));
  assert(
    Math.hypot(
      ...sub(stepPosition(ps.get(398), prep, 1), ps.get(398).finalPosition),
    ) > 0.05,
  );
  for (const id of [398])
    close(stepPosition(ps.get(id), prep, 1), stepPosition(ps.get(id), fit, 0));
  for (const id of [398, 399])
    close(
      stepPosition(ps.get(id), fit, 1),
      stepPosition(ps.get(id), secure, 0),
    );
  for (const id of ids) {
    close(
      stepPosition(ps.get(id), secure, 1),
      stepPosition(ps.get(id), join, 0),
    );
    close(stepPosition(ps.get(id), join, 1), ps.get(id).finalPosition);
    close(stepPosition(ps.get(id), join, 1), stepPosition(ps.get(id), last, 0));
  }
});
test("Mounting motion preserves rigid module spacing and approaches along the locating peg axis", () => {
  const n = [0, 0.13917310096009525, -0.9902680687415661];
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    const d = sub(
      stepPosition(ps.get(398), join, t),
      ps.get(398).finalPosition,
    );
    for (const id of ids)
      close(
        sub(stepPosition(ps.get(id), join, t), ps.get(id).finalPosition),
        d,
      );
    if (t >= 0.6) {
      const axial = d.reduce((v, x, k) => v + x * n[k], 0);
      assert(axial >= -1e-9);
      close(
        d,
        n.map((v) => v * axial),
      );
    }
  }
  const d = sub(
    stepPosition(ps.get(398), join, 0.6),
    ps.get(398).finalPosition,
  );
  assert(
    d[2] < -0.039 && d[1] > 0.005,
    "Insertion is normal to the tilted mounting face, not vertical",
  );
});
test("Old completion markers follow installation/fastening; new staging step starts unchecked", () => {
  assert.deepEqual(
    completedStepIndices({ completedLabels: ["59", "60", "61", "62"] }, m),
    [63, 61, 62, 64],
  );
  assert.deepEqual(
    completedStepIndices({ completed: [60, 61, 62, 63] }, m),
    [63, 61, 62, 64],
  );
  assert.equal(
    completedStepIndices({ completed: [60, 61, 62, 63] }, m).includes(60),
    false,
  );
});
