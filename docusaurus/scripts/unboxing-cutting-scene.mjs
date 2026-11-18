// Procedural illustration, not a reconstruction of the robot's internal packing.
// One source second is shown in half a second. The delivered clip is 8.875 s.
import * as THREE from 'three';

const width = 1120, height = 704;
const renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
renderer.setSize(width, height);
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#ecf1f5');
const camera = new THREE.OrthographicCamera(-1.94, 1.94, 1.22, -1.22, .1, 30);
camera.position.set(3, 2.35, 5);
camera.lookAt(0, .86, 0);
scene.add(new THREE.HemisphereLight(0xffffff, 0x7d879a, 2.2));
const key = new THREE.DirectionalLight(0xfff5e7, 3.3);
key.position.set(-2, 7, 3);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, {left: -3, right: 3, top: 3, bottom: -3, near: .1, far: 15});
key.shadow.bias = -.0003;
key.shadow.normalBias = .015;
scene.add(key);
const fill = new THREE.DirectionalLight(0xc8dfff, 1.3);
fill.position.set(4, 3, -2);
scene.add(fill);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({opacity: .09}));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

function texture(kind) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const c = canvas.getContext('2d');
  c.fillStyle = kind === 'cardboard' ? '#b7915c' : '#334777';
  c.fillRect(0, 0, 512, 512);
  // Deterministic fibers / stretch-wrap ridges keep every rerender identical.
  for (let i = 0; i < 9000; i++) {
    const x = (i * 127.37) % 512, y = (i * 73.19) % 512;
    c.fillStyle = i % 2 ? 'rgba(255,255,255,.07)' : 'rgba(30,15,0,.06)';
    c.fillRect(x, y, kind === 'cardboard' ? 3 : 6, 1);
  }
  if (kind === 'film') {
    for (let y = 0; y < 512; y += 13) {
      c.fillStyle = 'rgba(125,174,249,.12)'; c.fillRect(0, y, 512, 1);
      c.fillStyle = 'rgba(2,12,40,.08)'; c.fillRect(0, y + 2, 512, 2);
    }
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return map;
}
const cardboard = new THREE.MeshStandardMaterial({map: texture('cardboard'), roughness: .95});
const box = new THREE.Mesh(new THREE.BoxGeometry(.815, 1.7, .815), cardboard);
box.position.y = .86;
box.castShadow = box.receiveShadow = true;
scene.add(box);
// Front seam and top flap seam, visible after the tape has been taken away.
const seamMaterial = new THREE.MeshStandardMaterial({color: 0x715235, roughness: 1});
const frontSeam = new THREE.Mesh(new THREE.BoxGeometry(.003, 1.7, .001), seamMaterial);
frontSeam.position.set(0, .86, .4082); scene.add(frontSeam);
const topSeam = new THREE.Mesh(new THREE.BoxGeometry(.003, .001, .815), seamMaterial);
topSeam.position.set(0, 1.7106, 0); scene.add(topSeam);

const filmMaterial = new THREE.MeshPhysicalMaterial({
  map: texture('film'), color: 0xa8b4d1, roughness: .37, metalness: .02,
  clearcoat: .35, clearcoatRoughness: .22, side: THREE.DoubleSide,
  transparent: true, opacity: .96, depthWrite: true,
});
const film = new THREE.Group(); scene.add(film);
const frontSheets = [];
const filmCaps = [];
for (const sign of [-1, 1]) {
  const geometry = new THREE.PlaneGeometry(1.7, 1.72, 60, 54);
  const mesh = new THREE.Mesh(geometry, filmMaterial);
  mesh.userData.original = Float32Array.from(geometry.attributes.position.array);
  mesh.userData.sign = sign;
  film.add(mesh); frontSheets.push(mesh);
  const cap = new THREE.Mesh(new THREE.PlaneGeometry(.425, .85, 10, 10), filmMaterial);
  cap.rotation.x = -Math.PI / 2;
  film.add(cap); filmCaps.push(cap);
}

const tapeMaterial = new THREE.MeshStandardMaterial({
  color: 0xf1ead4, roughness: .48, side: THREE.DoubleSide, transparent: true,
});
const tape = new THREE.Group(); scene.add(tape);
const tapeRibbons = [];
// Tape follows the original video's one vertical and three horizontal bands.
for (const y of [.1, .65, 1.12]) {
  for (const sign of [-1, 1]) {
    const geometry = new THREE.PlaneGeometry(.408, .03, 24, 1);
    const ribbon = new THREE.Mesh(geometry, tapeMaterial);
    ribbon.position.set(sign * .204, y, .414);
    ribbon.userData = {original: Float32Array.from(geometry.attributes.position.array), sign, y};
    tape.add(ribbon); tapeRibbons.push(ribbon);
  }
  for (const sign of [-1, 1]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(.002, .03, .815), tapeMaterial);
    strip.position.set(sign * .409, y, 0); tape.add(strip);
  }
}
const verticalTape = [];
for (const sign of [-1, 1]) {
  const geometry = new THREE.PlaneGeometry(.02, 1.7, 1, 60);
  const strip = new THREE.Mesh(geometry, tapeMaterial);
  strip.userData = {original: Float32Array.from(geometry.attributes.position.array), sign};
  tape.add(strip); verticalTape.push(strip);
}
const topTape = new THREE.Mesh(new THREE.BoxGeometry(.04, .002, .815), tapeMaterial);
topTape.position.set(0, 1.712, 0); tape.add(topTape);

// Two independent extruded steel blades, molded loops and a shared pivot.
const scissors = new THREE.Group();
scissors.scale.setScalar(.7);
scene.add(scissors);
const steel = new THREE.MeshStandardMaterial({color: 0xcad3da, metalness: .65, roughness: .24});
const edge = new THREE.MeshStandardMaterial({color: 0xf3f7fa, metalness: .5, roughness: .18});
const red = new THREE.MeshStandardMaterial({color: 0xc83035, roughness: .38});
const dark = new THREE.MeshStandardMaterial({color: 0x343b44, roughness: .6});
const jaws = [];
for (const sign of [-1, 1]) {
  const jaw = new THREE.Group();
  jaw.position.z = sign * .007;
  const shape = new THREE.Shape();
  shape.moveTo(-.014 * sign, -.035);
  shape.lineTo(.035 * sign, .005);
  shape.lineTo(.023 * sign, .26);
  shape.quadraticCurveTo(.014 * sign, .36, 0, .43);
  shape.lineTo(-.009 * sign, .09);
  shape.closePath();
  const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {depth: .009, bevelEnabled: true, bevelSize: .003, bevelThickness: .002, bevelSegments: 2, steps: 1}), steel);
  blade.castShadow = true; jaw.add(blade);
  const bevel = new THREE.Mesh(new THREE.BoxGeometry(.004, .28, .003), edge);
  bevel.position.set(-.006 * sign, .16, .012); jaw.add(bevel);
  const stem = new THREE.Mesh(new THREE.BoxGeometry(.026, .12, .018), steel);
  stem.position.set(sign * .022, -.067, 0); stem.rotation.z = sign * .28; jaw.add(stem);
  const grip = new THREE.Mesh(new THREE.TorusGeometry(.063, .016, 12, 40), red);
  grip.scale.set(.78, 1.3, 1); grip.position.set(sign * .053, -.18, 0);
  grip.castShadow = true; jaw.add(grip);
  const innerGrip = new THREE.Mesh(new THREE.TorusGeometry(.046, .004, 8, 40), dark);
  innerGrip.scale.set(.78, 1.3, 1); innerGrip.position.copy(grip.position); jaw.add(innerGrip);
  scissors.add(jaw); jaws.push(jaw);
}
const screw = new THREE.Mesh(new THREE.CylinderGeometry(.023, .023, .035, 24), steel);
screw.rotation.x = Math.PI / 2; screw.position.z = .012; scissors.add(screw);
const screwSlot = new THREE.Mesh(new THREE.BoxGeometry(.026, .004, .003), dark);
screwSlot.position.z = .031; screwSlot.rotation.z = -.35; scissors.add(screwSlot);

const clamp = x => Math.max(0, Math.min(1, x));
const phase = (t, start, end) => clamp((t - start) / (end - start));
const smooth = x => x * x * (3 - 2 * x);

export function renderFrame(t) {
  const filmCut = phase(t, .65, 2.9);
  const filmPeel = smooth(phase(t, 2.95, 4.1));
  const tapeCut = phase(t, 4.55, 6.75);
  const tapePeel = smooth(phase(t, 6.85, 8.15));
  const filmCutY = .02 + filmCut * 1.73;
  const tapeCutY = .02 + tapeCut * 1.73;
  film.visible = t < 4.1;
  filmMaterial.opacity = .96 * (1 - smooth(phase(t, 3.75, 4.1)));
  for (const sheet of frontSheets) {
    const {original, sign} = sheet.userData;
    const points = sheet.geometry.attributes.position;
    for (let i = 0; i < points.count; i++) {
      const u = original[i * 3] / 1.7 + .5;
      const y = original[i * 3 + 1] + .86;
      const released = smooth(clamp((filmCutY - y) / .16));
      const opening = .034 * released * Math.max(0, 1 - u * 4) ** 2;
      let x, z;
      if (u < .25) {x = u * 4 * .425; z = .429;}
      else if (u < .75) {x = .425; z = .429 - (u - .25) * 2 * .858;}
      else {x = (1 - (u - .75) * 4) * .425; z = -.429;}
      const peeledX = .5 + u * .9;
      const peeledZ = .6 + .23 * Math.sin(u * Math.PI * 1.8) + .02 * Math.sin(y * 18 + u * 12);
      points.setXYZ(i,
        sign * (x * (1 - filmPeel) + peeledX * filmPeel + opening),
        y - filmPeel * (.07 + .1 * u),
        z * (1 - filmPeel) + peeledZ * filmPeel + opening * 1.8);

    }
    points.needsUpdate = true; sheet.geometry.computeVertexNormals();
  }
  filmCaps.forEach((cap, i) => {
    const sign = i ? 1 : -1;
    cap.position.set(sign * (.2125 + filmPeel * .8), 1.722 - filmPeel * .15, filmPeel * .2);
    cap.rotation.z = sign * filmPeel * .65;
  });

  tape.visible = t < 8.15;
  tapeMaterial.opacity = 1 - smooth(phase(t, 7.8, 8.15));
  for (const ribbon of tapeRibbons) {
    const {original, sign, y} = ribbon.userData;
    const cut = tapeCutY > y && tapeCut > 0;
    const points = ribbon.geometry.attributes.position;
    for (let i = 0; i < points.count; i++) {
      const x = original[i * 3], u = x * sign / .408 + .5;
      points.setXYZ(i, x + sign * ((cut ? .012 : 0) + tapePeel * .45),
        original[i * 3 + 1] - tapePeel * (.1 + .14 * u),
        tapePeel * (.12 + .2 * Math.sin(u * Math.PI)));
    }
    points.needsUpdate = true; ribbon.geometry.computeVertexNormals();
  }
  for (const strip of verticalTape) {
    const {original, sign} = strip.userData;
    const points = strip.geometry.attributes.position;
    for (let i = 0; i < points.count; i++) {
      const y = original[i * 3 + 1] + .86;
      const released = smooth(clamp((tapeCutY - y) / .12));
      points.setXYZ(i, original[i * 3] + sign * (.01 + .008 * released + tapePeel * .55),
        y - tapePeel * .15, .416 + released * .008 + tapePeel * (.16 + .12 * Math.sin(y * 5)));
    }
    points.needsUpdate = true; strip.geometry.computeVertexNormals();
  }
  topTape.position.y = 1.712 + tapePeel * .22;
  // Side strips peel away with the matching front strips.
  for (const child of tape.children) {
    if (child.geometry?.type === 'BoxGeometry' && child !== topTape) {
      child.position.x = Math.sign(child.position.x) * (.409 + tapePeel * .45);
    }
  }

  const cuttingTape = t >= 4.15;
  const start = cuttingTape ? 4.55 : .65, end = cuttingTape ? 6.75 : 2.9;
  const cut = cuttingTape ? tapeCut : filmCut;
  const enter = smooth(phase(t, start - .42, start));
  const exit = smooth(phase(t, end, end + .38));
  scissors.visible = (t >= .23 && t < 3.28) || (t >= 4.13 && t < 7.13);
  scissors.position.set((1 - enter + exit) * .8, .02 + cut * 1.73 - .28, .472 + (1 - enter + exit) * .22);
  scissors.rotation.set(.025, -.18, -.04 + (1 - enter + exit) * -.4);
  const snip = .025 + .16 * (.5 + .5 * Math.cos((t - start) * Math.PI * 12));
  jaws[0].rotation.z = snip; jaws[1].rotation.z = -snip;
  renderer.render(scene, camera);
}
renderFrame(0);
window.renderUnboxingFrame = renderFrame;
