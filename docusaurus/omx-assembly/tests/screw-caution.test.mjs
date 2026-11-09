import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { screwCaution } from "../src/screw-caution.mjs";
const stepsWith = (kind, caution) =>
  JSON.parse(
    readFileSync(new URL(`../public/models/${kind}.json`, import.meta.url)),
  )
    .steps.filter((s) => screwCaution(s) === caution)
    .map((s) => s.index + 1);
test("The motor screw warning marks every idler retaining screw step", () => {
  assert.deepEqual(stepsWith("leader", "motor"), [13, 24, 35, 46]);
  for (const kind of ["follower", "follower-xl4015"])
    assert.deepEqual(stepsWith(kind, "motor"), [19, 27, 36, 50]);
});
test("The frame screw warning marks every other screw step", () => {
  assert.deepEqual(
    stepsWith("leader", "frame"),
    [
      3, 5, 7, 9, 10, 15, 16, 18, 20, 21, 26, 27, 29, 31, 32, 38, 40, 42, 43,
      48, 49, 51, 52,
    ],
  );
  for (const kind of ["follower", "follower-xl4015"])
    assert.deepEqual(
      stepsWith(kind, "frame"),
      [
        3, 4, 5, 7, 10, 11, 13, 15, 16, 21, 22, 24, 29, 30, 32, 33, 39, 41, 42,
        44, 46, 47, 52, 53, 56, 58, 60, 63, 65,
      ],
    );
});
