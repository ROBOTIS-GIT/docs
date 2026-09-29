import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import ts from "typescript";
import * as T from "three";
// Exercise actual Viewer camera/resize methods without a GPU or synthetic DOM renderer.
const source = readFileSync(
  new URL("../src/viewer.ts", import.meta.url),
  "utf8",
);
const moduleURL = new URL(`.viewer-${process.pid}.mjs`, import.meta.url);
writeFileSync(
  moduleURL,
  ts
    .transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
      },
    })
    .outputText.replace(/([\'"])\.\//g, "$1../src/"),
);
let Viewer;
try {
  ({ Viewer } = await import(moduleURL.href));
} finally {
  unlinkSync(moduleURL);
}
globalThis.matchMedia = () => ({ matches: false });
function fixture() {
  const v = Object.create(Viewer.prototype);
  v.camera = new T.PerspectiveCamera(36, 1, 0.001, 20);
  v.camera.position.set(0.3, 0.2, 0.4);
  v.controls = { target: new T.Vector3(), update() {} };
  v.host = { clientWidth: 1012, clientHeight: 300 };
  v.renderer = {
    calls: 0,
    setSize() {
      this.calls++;
    },
  };
  v.viewportWidth = 1012;
  v.viewportHeight = 300;
  v.framing = null;
  v.tween = null;
  v.userCamera = false;
  v.resizePending = true;
  return v;
}
test("Task-card resize retargets from current pose instead of teleporting to work view", () => {
  const v = fixture();
  v.frameBounds(
    new T.Box3(new T.Vector3(-0.03, 0, -0.02), new T.Vector3(0.03, 0.08, 0.02)),
    new T.Vector3(-1, 0.5, -1),
    true,
    1.22,
  );
  const position = v.camera.position.clone(),
    target = v.controls.target.clone(),
    direction = v.framing.direction.clone();
  v.host.clientHeight = 269;
  v.resize();
  assert(v.camera.position.equals(position));
  assert(v.controls.target.equals(target));
  assert(v.tween.from.equals(position));
  assert(v.tween.fromTarget.equals(target));
  assert(v.framing.direction.equals(direction));
  assert.equal(v.renderer.calls, 1);
  const tween = v.tween;
  v.resize();
  assert.equal(v.tween, tween);
  assert.equal(v.renderer.calls, 1);
});
test("Layout measurement before step framing neither snaps nor starts a competing fit", () => {
  const v = fixture();
  v.frameBounds(
    new T.Box3(new T.Vector3(), new T.Vector3(0.1, 0.1, 0.1)),
    new T.Vector3(1, 1, 1),
  );
  const tween = v.tween,
    position = v.camera.position.clone();
  v.host.clientHeight = 269;
  v.resize(false);
  assert.equal(v.tween, tween);
  assert(v.camera.position.equals(position));
  assert.equal(v.camera.aspect, 1012 / 269);
});
test("Resize respects a manually positioned camera and reverse-side framing", () => {
  const v = fixture();
  v.frameBounds(
    new T.Box3(new T.Vector3(), new T.Vector3(0.1, 0.1, 0.1)),
    new T.Vector3(-1, 0.5, -1),
  );
  v.userCamera = true;
  v.tween = null;
  const position = v.camera.position.clone();
  v.host.clientHeight = 250;
  v.resize();
  assert.equal(v.tween, null);
  assert(v.camera.position.equals(position));
});
test("Rapid retargets start at displayed pose; explicit reduced motion still applies immediately", () => {
  const v = fixture();
  v.transition(new T.Vector3(0.1, 0.1, 0.1), new T.Vector3(0.5, 0.4, 0.5));
  v.camera.position.set(0.35, 0.25, 0.42);
  v.controls.target.set(0.02, 0.02, 0.02);
  const displayed = v.camera.position.clone();
  v.transition(new T.Vector3(0.2, 0, 0.1), new T.Vector3(-0.4, 0.3, 0.3));
  assert(v.tween.from.equals(displayed));
  assert(v.camera.position.equals(displayed));
  globalThis.matchMedia = () => ({ matches: true });
  try {
    const end = new T.Vector3(0.2, 0.3, 0.4);
    v.transition(new T.Vector3(), end);
    assert.equal(v.tween, null);
    assert(v.camera.position.equals(end));
  } finally {
    globalThis.matchMedia = () => ({ matches: false });
  }
});
test("Full canvas reveals geometry outside the safe framing region and keeps picking aligned", () => {
  const v = fixture();
  v.host.clientHeight = 652;
  v.setSafeArea({ left: 64, top: 140, width: 884, height: 269 });
  v.resize(false);
  v.camera.position.set(0, 0, 1);
  v.camera.lookAt(0, 0, 0);
  v.camera.updateMatrixWorld(true);
  const center = new T.Vector3().project(v.camera),
    px = ((center.x + 1) * 1012) / 2,
    py = ((1 - center.y) * 652) / 2;
  assert(Math.abs(px - 506) < 1e-8);
  assert(Math.abs(py - 274.5) < 1e-8);
  const outsideSafe = new T.Vector3(0, -0.4, 0).project(v.camera),
    y = ((1 - outsideSafe.y) * 652) / 2;
  assert(
    y > 409 && y < 652,
    "geometry below former safe-window cutoff stays inside the rendered canvas",
  );
  const ray = new T.Raycaster();
  ray.setFromCamera(new T.Vector2(center.x, center.y), v.camera);
  assert(ray.ray.distanceToPoint(new T.Vector3()) < 1e-8);
  const p = v.camera.position.clone(),
    calls = v.renderer.calls;
  v.setSafeArea({ left: 64, top: 140, width: 884, height: 250 });
  v.resize(false);
  assert(v.camera.position.equals(p));
  assert.equal(
    v.renderer.calls,
    calls,
    "card changes must not clear/resize drawing buffer",
  );
});
test("Changing card height preserves projected pixels on the first frame, then eases to the new framing", () => {
  const v = fixture();
  v.host.clientHeight = 652;
  v.setSafeArea({ left: 64, top: 144, width: 860, height: 261.21875 });
  v.resize(false);
  v.camera.position.set(0.2, 0.2, 0.3);
  v.camera.lookAt(0, 0, 0);
  v.camera.updateMatrixWorld(true);
  const point = new T.Vector3(0.02, 0.03, 0),
    before = point.clone().project(v.camera),
    matrix = v.camera.projectionMatrix.clone(),
    calls = v.renderer.calls;
  v.setSafeArea({ left: 64, top: 144, width: 860, height: 275.609375 });
  v.resize(false);
  assert(
    v.camera.projectionMatrix.equals(matrix),
    "layout updates must not change projection immediately",
  );
  const start = v.projectionTween.start;
  v.updateProjection(start);
  assert(point.clone().project(v.camera).distanceTo(before) < 1e-12);
  let previous = before,
    maxDelta = 0;
  for (let i = 1; i <= 65; i++) {
    v.updateProjection(start + i * 10);
    const projected = point.clone().project(v.camera);
    maxDelta = Math.max(maxDelta, projected.distanceTo(previous));
    previous = projected;
  }
  assert.equal(v.projectionTween, null);
  assert.equal(v.displayArea.height, 275.609375);
  assert(maxDelta < 0.003, "no single-frame projection jump");
  assert.equal(v.renderer.calls, calls);
});
test("Retargeting an unfinished projection starts at its displayed value", () => {
  const v = fixture();
  v.host.clientHeight = 652;
  v.setSafeArea({ left: 64, top: 144, width: 860, height: 260 });
  v.resize(false);
  v.setSafeArea({ left: 64, top: 144, width: 860, height: 280 });
  v.resize(false);
  v.updateProjection(v.projectionTween.start + 300);
  const displayed = { ...v.displayArea },
    matrix = v.camera.projectionMatrix.clone();
  v.setSafeArea({ left: 64, top: 144, width: 860, height: 240 });
  v.resize(false);
  assert.deepEqual(v.projectionTween.from, displayed);
  assert(v.camera.projectionMatrix.equals(matrix));
});
