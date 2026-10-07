import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
test("Leader jumper stays on +5V and follows the controller", () => {
  const m = JSON.parse(
    readFileSync(new URL("../public/models/leader.json", import.meta.url)),
  );
  const header = m.parts.find((p) => p.id === 102);
  assert.equal(
    m.parts.find((p) => p.id === 1303).label,
    "2.54 mm jumper · +5V",
  );
  assert.equal(m.steps.length, 58);
  for (const s of m.steps) {
    assert.equal(s.visible.includes(1303), s.visible.includes(102));
    if (s.tracks["102"]) {
      s.tracks["102"].forEach((t, i) => {
        for (let axis = 0; axis < 3; axis++)
          assert(
            Math.abs(
              s.tracks["1303"][i][axis + 1] -
                (t[axis + 1] - header.finalPosition[axis]),
            ) < 1e-9,
          );
      });
    }
  }
  assert(
    m.steps
      .find((s) => s.title === "Fit controller")
      .prepareInstruction.includes("+5V"),
  );
});
for (const kind of ["follower", "follower-xl4015"])
  test(`${kind}: isolated external-power path and ordered connection`, () => {
    const m = JSON.parse(
      readFileSync(new URL(`../public/models/${kind}.json`, import.meta.url)),
    );
    const [jumper, harness, adapter] = m.steps.slice(-3);
    assert.deepEqual(
      [jumper.label, harness.label, adapter.label],
      ["power-jumper-v037", "power-harness-v037", "power-adapter-v037"],
    );
    assert(jumper.instructions.join(" ").includes("VIN(DXL), not +5V"));
    assert.equal(jumper.staticReview, true);
    assert(jumper.visible.includes(1303));
    assert(jumper.active.includes(1303));
    const power = m.cables.find((c) => c.partId === 1301);
    assert.equal(power.from.partId, 1300);
    assert.equal(power.to.partId, 94);
    assert(
      !m.cables
        .slice(0, -1)
        .some((c) => [c.from.partId, c.to.partId].includes(94)),
    );
    assert.equal(power.stepIndex, harness.index);
    assert.equal(harness.wiringCable, 1301);
    assert(
      m.steps
        .slice(0, -3)
        .every(
          (s) => ![1300, 1301, 1302, 1303].some((id) => s.visible.includes(id)),
        ),
    );
    assert(!harness.visible.includes(1302));
    assert(adapter.visible.includes(1302));
    assert(adapter.prepareInstruction.includes("disconnected from mains"));
    assert.deepEqual(adapter.tracks["1302"].at(-1), [1, 0, 0, 0]);
    const raw = readFileSync(
      new URL(`../public/models/${kind}.glb`, import.meta.url),
    );
    const g = JSON.parse(raw.toString("utf8", 20, 20 + raw.readUInt32LE(12)));
    for (const id of [1300, 1301, 1302, 1303])
      assert(g.nodes.some((n) => n.name === `part_${id}`));
    const ivory = g.materials.find(
      (m) => m.name === "SMPS2DYNAMIXEL | warm ivory housings",
    ).pbrMetallicRoughness;
    assert(ivory.baseColorFactor[0] > ivory.baseColorFactor[2]);
    assert.equal(ivory.metallicFactor, 0);
    assert(
      g.materials.some((m) => m.name === "SMPS2DYNAMIXEL | green solder mask"),
    );
  });
