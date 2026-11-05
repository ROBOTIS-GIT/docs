import { assetUrl } from "./assets.mjs";
import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { Manual, Part, Step, Vec3 } from "./types";
import {
  stepPosition,
  activeParts,
  cableInsertion,
  sampleTrack,
} from "./timeline.mjs";
interface FrameArea {
  left: number;
  top: number;
  width: number;
  height: number;
}
interface Original {
  color: T.Color;
  emissive: T.Color;
  opacity: number;
  transparent: boolean;
  depthWrite: boolean;
}
export class Viewer {
  readonly renderer: T.WebGLRenderer;
  readonly scene = new T.Scene();
  readonly camera = new T.PerspectiveCamera(36, 1, 0.001, 20);
  readonly controls: OrbitControls;
  private root: T.Group | null = null;
  private map = new Map<number, T.Object3D>();
  private meshes: T.Mesh[] = [];
  private originals = new Map<T.Material, Original>();
  private parts = new Map<number, Part>();
  private manual: Manual | null = null;
  private step: Step | null = null;
  private progress = 0;
  private selected: number[] = [];
  private context: "solid" | "ghost" | "hide" = "solid";
  private tween: {
    from: T.Vector3;
    to: T.Vector3;
    fromTarget: T.Vector3;
    toTarget: T.Vector3;
    start: number;
  } | null = null;
  private markers: {
    id: number;
    button: HTMLButtonElement;
    point: T.Vector3;
    line: SVGPolylineElement;
    ring: SVGCircleElement;
  }[] = [];
  private markerLayer = document.createElement("div");
  private locationSvg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );
  private locationsVisible = true;
  private userCamera = false;
  private safeArea: FrameArea | null = null;
  private displayArea: FrameArea | null = null;
  private projectionTween: {
    from: FrameArea;
    to: FrameArea;
    start: number;
  } | null = null;
  private projectionPending = false;
  private framing: {
    bounds: T.Box3;
    direction: T.Vector3;
    padding: number;
  } | null = null;
  private resizePending = false;
  private viewportWidth = 0;
  private viewportHeight = 0;
  private ray = new T.Raycaster();
  private down = [0, 0];
  private observer: ResizeObserver;
  private raf = 0;
  private destroyed = false;
  private dirty = true;
  onSelect: (part: Part | null) => void = () => {};
  onCameraChange: () => void = () => {};
  constructor(private host: HTMLElement) {
    this.renderer = new T.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = T.PCFShadowMap;
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    this.renderer.toneMapping = T.AgXToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.setClearColor("#f5f5f7");
    this.host.append(this.renderer.domElement);
    this.markerLayer.className = "location-layer";
    this.host.append(this.markerLayer);
    this.locationSvg.classList.add("location-lines");
    this.locationSvg.setAttribute("aria-hidden", "true");
    this.markerLayer.append(this.locationSvg);
    this.renderer.domElement.setAttribute(
      "aria-label",
      "Interactive 3D assembly. Drag to orbit, scroll to zoom, shift-drag to pan.",
    );
    this.renderer.domElement.tabIndex = 0;
    this.camera.position.set(0.7, 0.45, 0.7);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.09;
    this.controls.minDistance = 0.02;
    this.controls.maxDistance = 2;
    this.controls.screenSpacePanning = true;
    this.controls.addEventListener("change", () => {
      this.dirty = true;
    });
    this.controls.addEventListener("start", () => {
      this.tween = null;
      this.userCamera = true;
      this.onCameraChange();
    });
    const pmrem = new T.PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    this.scene.environment = pmrem.fromScene(room, 0.04).texture;
    this.scene.environmentIntensity = 0.3;
    room.dispose();
    pmrem.dispose();
    const key = new T.DirectionalLight(0xffffff, 2.0);
    key.position.set(0.4, 1, 0.7);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, {
      left: -0.55,
      right: 0.55,
      top: 0.55,
      bottom: -0.55,
      near: 0.01,
      far: 3,
    });
    key.shadow.bias = -0.00015;
    key.shadow.normalBias = 0.0003;
    this.scene.add(key);
    const fill = new T.DirectionalLight(0xffffff, 0.45);
    fill.position.set(-0.5, 0.5, -0.4);
    this.scene.add(fill);
    this.scene.add(new T.HemisphereLight(0xffffff, 0xcbd0d8, 0.25));
    this.observer = new ResizeObserver(() => {
      this.resizePending = true;
    });
    this.observer.observe(host);
    this.resize();
    this.renderer.domElement.addEventListener("pointerdown", (e) => {
      this.down = [e.clientX, e.clientY];
    });
    this.renderer.domElement.addEventListener("pointerup", (e) => {
      if (Math.hypot(e.clientX - this.down[0], e.clientY - this.down[1]) < 5)
        this.pick(e);
    });
    const loop = () => {
      if (this.destroyed) return;
      this.raf = requestAnimationFrame(loop);
      if (this.resizePending) this.resize();
      this.updateProjection(performance.now());
      if (this.tween) {
        this.dirty = true;
        let u = Math.min(1, (performance.now() - this.tween.start) / 650);
        u = u * u * (3 - 2 * u);
        this.camera.position.lerpVectors(this.tween.from, this.tween.to, u);
        this.controls.target.lerpVectors(
          this.tween.fromTarget,
          this.tween.toTarget,
          u,
        );
        if (u >= 1) this.tween = null;
      }
      this.controls.update();
      if (this.dirty && !document.hidden) {
        this.renderer.render(this.scene, this.camera);
        this.updateLocations();
        this.dirty = false;
      }
    };
    loop();
  }
  // Resize the drawing buffer before rendering, never in a post-render observer callback.
  // A layout change may retarget a guided move, but must never snap or change its preset.
  setSafeArea(area: FrameArea) {
    if (
      this.safeArea &&
      Object.keys(area).every(
        (k) =>
          area[k as keyof typeof area] ===
          this.safeArea![k as keyof typeof area],
      )
    )
      return;
    this.safeArea = area;
    this.projectionPending = true;
    this.resizePending = true;
  }
  resize(refit = true) {
    this.resizePending = false;
    const w = Math.max(1, this.host.clientWidth),
      h = this.host.clientHeight;
    const sizeChanged = w !== this.viewportWidth || h !== this.viewportHeight;
    if (h <= 0 || (!sizeChanged && !this.projectionPending)) return;
    this.viewportWidth = w;
    this.viewportHeight = h;
    this.dirty = true;
    this.projectionPending = false;
    const area = this.safeArea ?? { left: 0, top: 0, width: w, height: h };
    // Extend the safe framing window to the whole workspace. Negative offsets reveal
    // surrounding geometry rather than cutting the canvas at the instruction card.
    if (
      !sizeChanged &&
      this.displayArea &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      this.projectionTween = {
        from: { ...this.displayArea },
        to: { ...area },
        start: performance.now(),
      };
    } else {
      this.projectionTween = null;
      this.applyProjection(area);
    }
    if (sizeChanged) this.renderer.setSize(w, h);
    if (refit && this.framing && !this.userCamera) {
      const { bounds, direction, padding } = this.framing;
      this.frameBounds(bounds, direction, true, padding);
    }
  }

  private applyProjection(area: FrameArea) {
    this.displayArea = { ...area };
    this.dirty = true;
    this.camera.setViewOffset(
      area.width,
      area.height,
      -area.left,
      -area.top,
      this.viewportWidth,
      this.viewportHeight,
    );
  }
  private updateProjection(now: number) {
    const t = this.projectionTween;
    if (!t) return;
    let u = Math.min(1, Math.max(0, (now - t.start) / 650));
    u = u * u * (3 - 2 * u);
    const area = {} as FrameArea;
    for (const key of ["left", "top", "width", "height"] as const)
      area[key] = T.MathUtils.lerp(t.from[key], t.to[key], u);
    this.applyProjection(area);
    if (u >= 1) this.projectionTween = null;
  }

  async load(
    manual: Manual,
    onProgress: (n: number) => void,
    isCurrent = () => true,
  ) {
    const gltf = await new GLTFLoader().loadAsync(
      assetUrl(
        `models/${manual.asset ?? manual.model}.glb?v=${encodeURIComponent(manual.revision)}`,
      ),
      (e) => {
        if (e.total) onProgress(e.loaded / e.total);
      },
    );
    if (this.destroyed || !isCurrent()) {
      gltf.scene.traverse((o) => {
        if (!(o instanceof T.Mesh)) return;
        o.geometry.dispose();
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
          for (const value of Object.values(m))
            if (value instanceof T.Texture) value.dispose();
          m.dispose();
        }
      });
      return;
    }
    this.tween = null;
    this.framing = null;
    this.userCamera = false;
    this.disposeModel();
    this.manual = manual;
    this.root = gltf.scene;
    this.scene.add(gltf.scene);
    this.parts = new Map(manual.parts.map((p) => [p.id, p]));
    this.map.clear();
    for (const p of manual.parts) {
      const o = gltf.scene.getObjectByName(p.node);
      if (!o) throw new Error(`Missing CAD part ${p.node}`);
      this.map.set(p.id, o);
      o.userData.partId = p.id;
    }
    gltf.scene.traverse((o) => {
      if (!(o instanceof T.Mesh)) return;
      o.castShadow = true;
      o.receiveShadow = true;
      const arr = Array.isArray(o.material) ? o.material : [o.material];
      const copies = arr.map((m) => {
        const c = m.clone() as T.MeshStandardMaterial;
        if (c.map) {
          // Preserve silkscreen detail when viewing boards at an oblique angle.
          c.map.anisotropy = Math.min(
            8,
            this.renderer.capabilities.getMaxAnisotropy(),
          );
          c.map.needsUpdate = true;
        }
        this.originals.set(c, {
          color: c.color?.clone() ?? new T.Color("white"),
          emissive: c.emissive?.clone() ?? new T.Color("black"),
          opacity: c.opacity,
          transparent: c.transparent,
          depthWrite: c.depthWrite,
        });
        return c;
      });
      o.material = Array.isArray(o.material) ? copies : copies[0];
      this.meshes.push(o);
    });
    this.step = null;
    this.selected = [];
    this.createLocations();
    this.apply();
    this.overview(false);
    onProgress(1);
  }
  setStep(step: Step | null, progress: number, refocus = true) {
    this.userCamera = false;
    this.step = step;
    this.progress = progress;
    this.selected = [];
    this.onSelect(null);
    this.apply();
    this.createLocations();
    if (refocus) {
      if (step) this.fitStep();
      else this.overview();
    }
  }
  setProgress(progress: number) {
    this.progress = progress;
    this.applyPositions();
  }
  setContext(mode: "solid" | "ghost" | "hide") {
    this.context = mode;
    this.apply();
  }
  getContext() {
    return this.context;
  }
  clearSelection() {
    this.selected = [];
    this.onSelect(null);
    this.apply();
  }
  private applyPositions() {
    this.dirty = true;
    if (!this.manual) return;
    for (const p of this.manual.parts) {
      const o = this.map.get(p.id);
      if (!o) continue;
      o.position.fromArray(stepPosition(p, this.step, this.progress) as Vec3);
      const turn = this.step?.rotationTracks?.[String(p.id)];
      if (turn) {
        o.quaternion.setFromAxisAngle(
          new T.Vector3().fromArray(turn.axis),
          sampleTrack(turn.keys, this.progress)[0],
        );
        o.userData.animatedScrew = true;
      } else if (o.userData.animatedScrew) o.quaternion.identity();
      if (p.cable) {
        const track = this.step?.morphTracks?.[String(p.id)];
        const weights = track
          ? sampleTrack(track, this.progress)
          : this.step?.wiringCable === p.id
            ? cableInsertion(this.progress)
            : [];
        o.traverse((child) => {
          if (child instanceof T.Mesh && child.morphTargetInfluences) {
            for (let i = 0; i < child.morphTargetInfluences.length; i++)
              child.morphTargetInfluences[i] = weights[i] ?? 0;
          }
        });
      }
    }
  }

  private apply() {
    if (!this.manual) return;
    const visible = this.step
      ? new Set([...this.step.visible, ...(this.step.ghostParts ?? [])])
      : new Set(this.parts.keys());
    const active = new Set(this.step ? activeParts(this.step) : []);
    this.applyPositions();
    for (const [id, o] of this.map) {
      const selected = this.selected.includes(id);
      const isActive = active.has(id);
      const cutaway = !!this.step?.ghostParts?.includes(id) && !isActive;
      o.userData.cutaway = cutaway;
      o.visible =
        visible.has(id) &&
        (this.context !== "hide" || !this.step || isActive || selected);
      o.traverse((c) => {
        if (!(c instanceof T.Mesh)) return;
        const ghost =
          cutaway ||
          (!!this.step && this.context === "ghost" && !isActive && !selected);
        c.castShadow = !ghost;
        c.receiveShadow = !ghost;
        const materials = Array.isArray(c.material) ? c.material : [c.material];
        for (const material of materials) {
          const m = material as T.MeshStandardMaterial;
          const orig = this.originals.get(m);
          if (!orig) continue;
          m.color.copy(orig.color);
          m.emissive.copy(orig.emissive);
          m.opacity = orig.opacity;
          m.transparent = orig.transparent;
          m.depthWrite = orig.depthWrite;
          if (ghost) {
            m.opacity = 0.15;
            m.transparent = true;
            m.depthWrite = false;
          }
          m.needsUpdate = true;
          if (selected) {
            m.emissive.set("#087e9e");
            m.emissiveIntensity = 0.1;
          } else if (isActive) {
            m.emissive.set("#007d97");
            m.emissiveIntensity = 0.015;
          } else m.emissiveIntensity = 1;
        }
      });
    }
  }
  private transition(target: T.Vector3, position: T.Vector3, animate = true) {
    this.dirty = true;
    if (!animate || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.tween = null;
      if (this.projectionTween) {
        this.applyProjection(this.projectionTween.to);
        this.projectionTween = null;
      }
      this.dirty = true;
      this.controls.target.copy(target);
      this.camera.position.copy(position);
      this.controls.update();
      return;
    }
    const start = performance.now();
    if (this.projectionTween) this.projectionTween.start = start;
    this.tween = {
      from: this.camera.position.clone(),
      to: position,
      fromTarget: this.controls.target.clone(),
      toTarget: target,
      start,
    };
  }
  private frameBounds(
    bounds: T.Box3,
    direction: T.Vector3,
    animate = true,
    padding = 1.13,
  ) {
    this.framing = {
      bounds: bounds.clone(),
      direction: direction.clone(),
      padding,
    };
    const center = bounds.getCenter(new T.Vector3()),
      dir = direction.clone().normalize(),
      right = new T.Vector3().crossVectors(this.camera.up, dir).normalize(),
      up = new T.Vector3().crossVectors(dir, right).normalize();
    const tan = Math.tan(T.MathUtils.degToRad(this.camera.fov / 2));
    const aspect = this.safeArea
      ? this.safeArea.width / this.safeArea.height
      : this.camera.aspect;
    let distance = 0.04;
    for (const x of [bounds.min.x, bounds.max.x])
      for (const y of [bounds.min.y, bounds.max.y])
        for (const z of [bounds.min.z, bounds.max.z]) {
          const v = new T.Vector3(x, y, z).sub(center),
            depth = v.dot(dir);
          distance = Math.max(
            distance,
            depth + Math.abs(v.dot(right)) / (tan * aspect),
            depth + Math.abs(v.dot(up)) / tan,
          );
        }
    this.transition(
      center,
      center.clone().add(dir.multiplyScalar(distance * padding)),
      animate,
    );
  }
  overview(animate = true) {
    if (!this.root) return;
    const box = new T.Box3();
    for (const [id, o] of this.map) {
      if (!this.step || this.step.visible.includes(id)) {
        box.expandByObject(o);
      }
    }
    if (!box.isEmpty())
      this.frameBounds(box, new T.Vector3(1, 0.65, 1), animate, 1.12);
  }
  fitStep(animate = true, reverse = false) {
    if (!this.step) {
      this.overview(animate);
      return;
    }
    this.userCamera = false;
    if (this.step.focusBounds) {
      const f = this.step.focusBounds,
        dir = new T.Vector3().fromArray(this.step.camera.direction);
      if (reverse) {
        dir.x *= -1;
        dir.z *= -1;
      }
      this.frameBounds(
        new T.Box3().setFromCenterAndSize(
          new T.Vector3().fromArray(f.center),
          new T.Vector3().fromArray(f.size),
        ),
        dir,
        animate,
        1.08,
      );
      return;
    }
    const bounds = new T.Box3();
    for (const id of activeParts(this.step)) {
      const o = this.map.get(id),
        p = this.parts.get(id);
      if (!o || !p) continue;
      const saved = o.position.clone();
      const poses =
        this.progress >= 0.999
          ? [stepPosition(p, this.step, 1) as Vec3]
          : (this.step.tracks[String(id)]?.map((k) => k.slice(1) as Vec3) ?? [
              stepPosition(p, this.step, 1) as Vec3,
            ]);
      for (const pos of poses) {
        o.position.fromArray(pos);
        o.updateWorldMatrix(true, true);
        bounds.expandByObject(o);
      }
      o.position.copy(saved);
      o.updateWorldMatrix(true, true);
    }
    if (bounds.isEmpty()) return;
    bounds.expandByScalar(0.009);
    const dir = new T.Vector3().fromArray(this.step.camera.direction);
    if (reverse) {
      dir.x *= -1;
      dir.z *= -1;
    }
    this.frameBounds(bounds, dir, animate, 1.22);
  }
  focusCableEnd(end: "from" | "to") {
    const cable = this.manual?.cables?.find(
      (c) => c.partId === this.step?.wiringCable,
    );
    if (!cable) return;
    this.onCameraChange();
    this.userCamera = true;
    const e = cable[end],
      point = new T.Vector3()
        .fromArray(e.base)
        .addScaledVector(new T.Vector3().fromArray(e.normal), 0.004);
    // Oblique to the insertion axis: expose both the socket mouth and the plug shoulder.
    const direction = e.inspectionDirection
      ? new T.Vector3().fromArray(e.inspectionDirection)
      : Math.abs(e.normal[0]) > 0.9
        ? new T.Vector3(e.normal[0], 0.25, -0.65)
        : new T.Vector3()
            .fromArray(e.normal)
            .addScaledVector(new T.Vector3().fromArray(e.right), 0.35)
            .addScaledVector(new T.Vector3().fromArray(e.depth), 0.8);
    this.frameBounds(
      new T.Box3().setFromCenterAndSize(point, new T.Vector3(0.03, 0.03, 0.03)),
      direction,
      true,
      1.15,
    );
  }
  hasLocations() {
    return this.markers.length > 0;
  }
  showLocations(show: boolean) {
    this.locationsVisible = show;
    this.dirty = true;
  }
  private createLocations() {
    this.markers = [];
    this.markerLayer.replaceChildren(this.locationSvg);
    this.locationSvg.replaceChildren();
    if (this.step?.routing) {
      for (const opening of this.step.routing.openings) {
        const point = new T.Vector3().fromArray(opening.point),
          button = document.createElement("button");
        button.className = "location-pin";
        button.classList.toggle(
          "terminal-pin",
          /^(IN|OUT)[+−]/.test(opening.label),
        );
        button.textContent = opening.label.split(" · ")[0];
        button.title = opening.label;
        button.setAttribute(
          "aria-label",
          `Inspect cable route ${opening.label}`,
        );
        button.onclick = () => {
          this.onCameraChange();
          this.userCamera = true;
          this.frameBounds(
            new T.Box3().setFromCenterAndSize(
              point,
              new T.Vector3(0.035, 0.035, 0.035),
            ),
            this.camera.position.clone().sub(this.controls.target),
          );
        };
        const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polyline",
          ),
          ring = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle",
          );
        ring.setAttribute("r", "4");
        this.locationSvg.append(line, ring);
        this.markerLayer.append(button);
        this.markers.push({
          id: this.step.wiringCable!,
          button,
          point,
          line,
          ring,
        });
      }
      return;
    }
    if (!this.step || !/^Secure /i.test(this.step.title)) return;
    const ids: number[] = activeParts(this.step);
    if (ids.length > 12 || ids.length !== Number(this.step.quantity)) return;
    ids.forEach((id, i) => {
      const o = this.map.get(id),
        p = this.parts.get(id);
      if (!o || !p) return;
      const saved = o.position.clone();
      o.position.fromArray(stepPosition(p, this.step, 1) as Vec3);
      o.updateWorldMatrix(true, true);
      const point = new T.Box3().setFromObject(o).getCenter(new T.Vector3());
      o.position.copy(saved);
      o.updateWorldMatrix(true, true);
      const button = document.createElement("button");
      button.className = "location-pin";
      button.textContent = String(i + 1);
      button.setAttribute(
        "aria-label",
        `Focus fastener location ${i + 1}: ${this.step!.part}`,
      );
      button.title = `Location ${i + 1} · ${this.step!.part} (not tightening order)`;
      button.onclick = () => {
        this.onCameraChange();
        this.userCamera = true;
        const b = new T.Box3().setFromCenterAndSize(
          point,
          new T.Vector3(0.04, 0.04, 0.04),
        );
        this.frameBounds(
          b,
          this.camera.position.clone().sub(this.controls.target),
        );
      };
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polyline",
      );
      const ring = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      ring.setAttribute("r", "4");
      this.locationSvg.append(line, ring);
      this.markerLayer.append(button);
      this.markers.push({ id, button, point, line, ring });
    });
  }
  private updateLocations() {
    const w = this.host.clientWidth,
      h = this.host.clientHeight,
      inset =
        parseFloat(
          getComputedStyle(this.host).getPropertyValue("--location-inset"),
        ) || 0;
    this.locationSvg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const projected = this.markers.map((m) => {
      const v = m.point.clone().project(this.camera);
      return { m, v, x: ((v.x + 1) * w) / 2, y: ((1 - v.y) * h) / 2 };
    });
    const safe = this.safeArea ?? { left: 0, top: 0, width: w, height: h };
    const top = safe.top + 14,
      bottom = safe.top + safe.height - 14;
    const visible = projected
      .filter(
        ({ v, y }) =>
          y >= safe.top &&
          y <= safe.top + safe.height &&
          this.locationsVisible &&
          v.z >= -1 &&
          v.z <= 1 &&
          Math.abs(v.x) < 0.98 &&
          Math.abs(v.y) < 0.98,
      )
      .sort((a, b) => a.x - b.x);
    for (const item of projected) {
      const show = visible.includes(item);
      item.m.button.hidden = !show;
      item.m.line.style.display = show ? "" : "none";
      item.m.ring.style.display = show ? "" : "none";
    }
    for (const side of [0, 1]) {
      const split = Math.ceil(visible.length / 2);
      const group = (
        side === 0 ? visible.slice(0, split) : visible.slice(split)
      ).sort((a, b) => a.y - b.y);
      const gap = Math.min(34, (bottom - top) / Math.max(1, group.length));
      let lastY = top - gap;
      const ys = group.map(({ y }) => {
        lastY = Math.max(lastY + gap, Math.min(bottom, Math.max(top, y)));
        return lastY;
      });
      const overflow = Math.max(0, (ys.at(-1) ?? 0) - bottom);
      group.forEach(({ m, x, y }, i) => {
        const ly = ys[i] - overflow,
          lx = side === 0 ? inset + 12 : w - inset - 12,
          edge = side === 0 ? inset + 26 : w - inset - 26;
        m.button.style.left = `${lx}px`;
        m.button.style.top = `${ly}px`;
        m.line.setAttribute(
          "points",
          `${edge},${ly} ${side === 0 ? inset + 36 : w - inset - 36},${ly} ${x},${y}`,
        );
        m.ring.setAttribute("cx", String(x));
        m.ring.setAttribute("cy", String(y));
        const delta = m.point.clone().sub(this.camera.position),
          distance = delta.length();
        this.ray.set(this.camera.position, delta.normalize());
        const blocked = this.ray
          .intersectObjects(this.meshes, false)
          .some((hit) => {
            if (hit.distance >= distance - 0.004) return false;
            let o: T.Object3D | null = hit.object;
            while (o) {
              if (
                !o.visible ||
                o.userData.cutaway ||
                o.userData.partId === m.id
              )
                return false;
              o = o.parent;
            }
            return true;
          });
        m.button.classList.toggle("occluded", blocked);
        m.line.classList.toggle("occluded", blocked);
        m.ring.classList.toggle("occluded", blocked);
        m.button.setAttribute(
          "aria-label",
          this.step?.routing
            ? `Inspect cable route ${m.button.title}${blocked ? " (behind geometry)" : ""}`
            : `Focus fastener location ${m.button.textContent}${blocked ? " (behind geometry)" : ""}: ${this.step?.part}`,
        );
      });
    }
  }
  focusSelected() {
    if (!this.selected.length) return;
    const b = new T.Box3();
    for (const id of this.selected) {
      const o = this.map.get(id);
      if (o) b.expandByObject(o);
    }
    if (!b.isEmpty())
      this.frameBounds(
        b,
        this.camera.position.clone().sub(this.controls.target),
      );
  }
  private pick(e: PointerEvent) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.ray.setFromCamera(
      new T.Vector2(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        (-(e.clientY - r.top) / r.height) * 2 + 1,
      ),
      this.camera,
    );
    const hits = this.ray.intersectObjects(this.meshes, false);
    for (const hit of hits) {
      let o: T.Object3D | null = hit.object;
      let id: number | undefined;
      let hidden = false;
      while (o) {
        if (!o.visible || o.userData.cutaway) hidden = true;
        if (o.userData.partId !== undefined) id = o.userData.partId;
        o = o.parent;
      }
      if (hidden || id === undefined) continue;
      const part = this.parts.get(id);
      if (!part) continue;
      this.selected =
        part.group === 2
          ? [...this.parts.values()]
              .filter((p) => p.group === 2)
              .map((p) => p.id)
          : [id];
      this.apply();
      this.onSelect(part);
      return;
    }
    this.clearSelection();
  }
  private disposeModel() {
    if (!this.root) return;
    this.scene.remove(this.root);
    const gs = new Set<T.BufferGeometry>(),
      ms = new Set<T.Material>(),
      ts = new Set<T.Texture>();
    this.root.traverse((o) => {
      if (o instanceof T.Mesh) {
        gs.add(o.geometry);
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
          ms.add(m);
          for (const v of Object.values(m))
            if (v instanceof T.Texture) ts.add(v);
        }
      }
    });
    gs.forEach((g) => g.dispose());
    ms.forEach((m) => m.dispose());
    ts.forEach((t) => t.dispose());
    this.root = null;
    this.meshes = [];
    this.originals.clear();
  }
  dispose() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.observer.disconnect();
    this.controls.dispose();
    this.disposeModel();
    this.scene.environment?.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
