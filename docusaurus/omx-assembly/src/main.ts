import "./style.css";
import { assetUrl } from "./assets.mjs";
import { assemblySearch, publishState, shareUrl } from "./navigation.mjs";
import { Viewer } from "./viewer";
import type { Manual, Part } from "./types";
import { progressKey, completedStepIndices } from "./timeline.mjs";
import { advancePlayback } from "./playback.mjs";
const icons = {
  play: '<path d="m8 5 11 7-11 7z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  prev: '<path d="m15 5-7 7 7 7"/>',
  next: '<path d="m9 5 7 7-7 7"/>',
  home: '<path d="m3 11 9-8 9 8M6 9v11h12V9M10 20v-7h4v7"/>',
  focus: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M8 12h8m-4-4v8"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3v.1"/>',
  link: '<path d="m9 15 6-6M8 13l-2 2a3 3 0 0 0 4 4l3-3M11 8l3-3a3 3 0 0 1 4 4l-2 2"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  reset: '<path d="M4 11a8 8 0 1 1 2 7M4 4v7h7"/>',
};
const icon = (name: keyof typeof icons) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
const root = document.querySelector<HTMLDivElement>("#app")!;
root.innerHTML = /* HTML */ ` <header class="app-header">
    <button
      class="icon-button mobile-menu"
      id="menu"
      aria-label="Show assembly steps"
      aria-expanded="false"
      aria-controls="sidebar"
    >
      ${icon("menu")}</button
    ><a class="brand" href="./index.html" aria-label="OMX Assembly Guide home"
      ><img
        class="brand-logo"
        src="${assetUrl("brand/robotis.png")}"
        alt="ROBOTIS"
      /><span class="brand-divider"></span
      ><span>OMX <b>Assembly Guide</b></span></a
    >
    <div class="model-switch" role="group" aria-label="Choose robot model">
      <button data-model="leader" aria-pressed="true">Leader</button
      ><button data-model="follower" aria-pressed="false">Follower</button>
    </div>
    <button
      class="icon-button"
      id="help"
      aria-label="Controls and guide information"
    >
      ${icon("help")}
    </button>
  </header>
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-top">
      <div class="eyebrow">YOUR BUILD, STEP BY STEP</div>
      <div class="sidebar-title">
        <h1>Assembly</h1>
        <span id="step-count"></span>
      </div>
      <label class="hardware-picker" id="hardware-picker" hidden
        ><span>DC converter</span
        ><select id="hardware" aria-label="Follower DC converter version">
          <option value="bic30">BIC30 · TTL sockets</option>
          <option value="xl4015">XL4015 · screw terminals</option></select
        ><small>Upper link and converter only</small></label
      ><label class="search"
        >${icon("search")}<input
          id="search"
          type="search"
          placeholder="Find a step or part"
          aria-label="Search assembly steps"
      /></label>
      <div class="build-progress">
        <span id="completion-count">0 completed</span
        ><button id="clear-progress">Reset progress</button>
        <div class="progress-track"><i id="completion-bar"></i></div>
      </div>
    </div>
    <nav id="steps" aria-label="Assembly steps"></nav>
    <footer class="sidebar-footer">
      <span class="status-dot"></span>Assembly & cabling
    </footer>
  </aside>
  <main class="workspace">
    <div id="viewport"></div>
    <div class="view-heading">
      <span class="eyebrow" id="view-chapter">EXPLORE OMX</span>
      <h2 id="view-title">A closer look.</h2>
      <p id="view-subtitle">Every part. Every connection.</p>
    </div>
    <div class="view-tools">
      <button class="tool" id="overview" title="Show assembled model">
        ${icon("home")}<span>Overview</span></button
      ><button class="tool" id="fit" title="Restore the guide camera">
        ${icon("focus")}<span>Fit view</span></button
      ><button class="tool" id="share" title="Copy link to this step">
        ${icon("link")}<span>Step link</span>
      </button>
    </div>
    <div
      class="camera-presets"
      id="camera-presets"
      hidden
      role="group"
      aria-label="Assembly camera"
    >
      <button id="work-view">Work area</button
      ><button id="reverse-view">Reverse side</button
      ><button id="assembly-view">Assembly</button
      ><button id="cable-from" hidden></button
      ><button id="cable-to" hidden></button
      ><button id="locations" aria-pressed="true">Locations</button>
    </div>
    <div class="context-control" id="context-control" hidden>
      <span>Surrounding parts</span>
      <div role="group" aria-label="Surrounding part visibility">
        <button data-context="solid" aria-pressed="true">Solid</button
        ><button data-context="ghost" aria-pressed="false">Ghost</button
        ><button data-context="hide" aria-pressed="false">Hide</button>
      </div>
    </div>
    <div class="gesture-hint" id="gesture-hint">
      <span>Drag to rotate</span><i>·</i><span>Scroll to zoom</span><i>·</i
      ><span>Click a part to inspect</span>
    </div>
    <section class="part-inspector" id="part-inspector" hidden>
      <button
        class="icon-button inspector-close"
        id="close-part"
        aria-label="Close part details"
      >
        ${icon("close")}</button
      ><span class="eyebrow">SELECTED PART</span>
      <h3 id="part-title"></h3>
      <p id="part-description"></p>
      <div class="inspector-actions">
        <button id="focus-part">Focus part</button
        ><button id="find-part">Assembly step ${icon("next")}</button>
      </div>
    </section>
    <section class="step-card" id="step-card">
      <div class="card-intro" id="overview-card">
        <div>
          <span class="eyebrow">INTERACTIVE ASSEMBLY</span>
          <h3 id="overview-title">Build your OMX Leader.</h3>
          <p>
            Rotate freely, inspect the connections, and assemble at your own
            pace.
          </p>
        </div>
        <button class="primary" id="start">
          Start assembly ${icon("next")}
        </button>
      </div>
      <div id="active-card" hidden>
        <div class="step-summary">
          <div>
            <span class="eyebrow" id="current-counter"></span>
            <h3 id="current-title"></h3>
            <p class="part-spec" id="current-part"></p>
            <p class="official-part-label" id="official-part-label" hidden></p>
          </div>
          <button
            class="complete-button"
            id="mark-complete"
            aria-label="Mark step complete"
            aria-pressed="false"
          >
            ${icon("check")}<span>Mark complete</span>
          </button>
        </div>
        <div
          class="stage-strip"
          role="group"
          aria-label="Review assembly phases"
        >
          <button data-phase="0" aria-pressed="true">
            1 <span>Prepare</span></button
          ><button data-phase="0.5" aria-pressed="false">
            2 <span>Assemble</span></button
          ><button data-phase="1" aria-pressed="false">
            3 <span>Check</span>
          </button>
        </div>
        <div class="instruction" id="instruction">
          <p data-instruction="Prepare"></p>
          <p data-instruction="Assemble" aria-hidden="true"></p>
          <p data-instruction="Check" aria-hidden="true"></p>
        </div>
        <div class="transport">
          <button
            class="icon-button"
            id="previous"
            aria-label="Previous assembly step"
          >
            ${icon("prev")}</button
          ><button
            class="play-button"
            id="play"
            aria-label="Play assembly motion"
          >
            ${icon("play")}</button
          ><button
            class="icon-button"
            id="replay"
            aria-label="Replay this step"
          >
            ${icon("reset")}</button
          ><input
            id="scrub"
            type="range"
            min="0"
            max="1000"
            value="0"
            aria-label="Assembly motion progress"
          /><span id="phase">Ready</span
          ><label class="speed-label"
            ><span class="sr-only">Playback speed</span
            ><select id="speed" aria-label="Playback speed">
              <option value="0.5">0.5×</option>
              <option value="1" selected>1×</option>
              <option value="1.5">1.5×</option>
            </select></label
          ><button
            class="browse-next"
            id="browse-next"
            title="Preview the next step without marking this one complete"
          >
            Preview next</button
          ><button class="next-button" id="next">
            Complete & next ${icon("next")}
          </button>
        </div>
      </div>
    </section>
    <div class="loading" id="loading" role="status" aria-live="polite">
      <div class="loading-inner">
        <div class="loading-mark">OMX</div>
        <h2>Preparing your workspace</h2>
        <p id="loading-label">Loading the assembly guide…</p>
        <div class="loading-track"><i id="loading-bar"></i></div>
      </div>
    </div>
    <div class="error-panel" id="error" hidden role="alert">
      <h2>We couldn’t load the model.</h2>
      <p id="error-text"></p>
      <button class="primary" id="retry">Try again</button>
    </div>
  </main>
  <dialog id="help-dialog">
    <button
      class="icon-button dialog-close"
      id="close-help"
      aria-label="Close help"
    >
      ${icon("close")}</button
    ><span class="eyebrow">EXPLORE WITH CONFIDENCE</span>
    <h2>A guide you can move.</h2>
    <div class="help-grid">
      <div>
        <b>Rotate</b><span>Drag with one finger or the left mouse button.</span>
      </div>
      <div>
        <b>Zoom</b><span>Pinch or scroll. Shift-drag / right-drag to pan.</span>
      </div>
      <div>
        <b>Inspect</b
        ><span>Click a part, then focus it or jump to its assembly step.</span>
      </div>
      <div>
        <b>See inside</b
        ><span
          >Use Ghost to reveal hidden connections. Dashed location markers sit
          behind geometry; switch to Reverse side to inspect them.</span
        >
      </div>
      <div>
        <b>Take control</b
        ><span
          >Each step plays automatically and repeats after a short pause. Pause,
          scrub, choose a phase or rotate to inspect. Space plays or pauses;
          arrow keys change steps.</span
        >
      </div>
      <div>
        <b>Keep your place</b
        ><span
          >Complete & next records your confirmation. Preview next and arrow
          keys browse without completing. Progress stays in this browser.</span
        >
      </div>
    </div>
    <p class="scope-note">
      Mechanical assembly and TTL cable connections. Actuator IDs are preset
      before shipping. Match the actuator ID to its joint and check horn
      reference marks before assembly. Disconnect power while plugging cables.
      Follower external power is included. USB camera and software setup are
      separate.
    </p>
    <p class="license-note">
      Three.js · MIT License. Inter · SIL Open Font License.
      <a
        href="${assetUrl("THIRD_PARTY_NOTICES.txt")}"
        target="_blank"
        rel="noopener"
        >Third-party notices</a
      >
    </p>
  </dialog>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
function createViewer() {
  try {
    return new Viewer($("viewport"));
  } catch (error) {
    $("loading").hidden = true;
    $("error").hidden = false;
    $("error-text").textContent =
      "3D graphics are unavailable. Try a browser with WebGL 2 enabled, or use the Videos tab in the assembly guide.";
    $("retry").onclick = () => location.reload();
    throw error;
  }
}
const viewer = createViewer();
function layoutViewport() {
  const workspace = $("viewport").parentElement!.getBoundingClientRect(),
    card = $("step-card").getBoundingClientRect();
  const blockers = [
    "view-title",
    "view-subtitle",
    "camera-presets",
    "context-control",
  ]
    .map((id) => $(id))
    .filter((e) => !e.hidden);
  const top = Math.max(
    80,
    ...blockers.map(
      (e) => e.getBoundingClientRect().bottom - workspace.top + 16,
    ),
  );
  const side = workspace.width <= 520 ? 48 : 64;
  viewer.setSafeArea({
    left: side,
    top,
    width: Math.max(1, workspace.width - side * 2),
    height: Math.max(48, card.top - workspace.top - top - 16),
  });
}
const layoutObserver = new ResizeObserver(layoutViewport);
layoutObserver.observe($("step-card"));
layoutObserver.observe($("viewport").parentElement!);

let hardware: "bic30" | "xl4015" = "bic30";
const storageKey = () =>
  progressKey(model) +
  (model === "follower" && hardware === "xl4015" ? "-xl4015" : "");
let manual: Manual | null = null;
let model: "leader" | "follower" = "leader";
let current = -1;
let progress = 0;
let playing = false;
let playbackDelay = 0;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let speed = 1;
let completed = new Set<number>();
let selected: Part | null = null;
let loadToken = 0;
let toastTimer = 0;
let ready = false;
function toast(message: string) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(
    () => $("toast").classList.remove("show"),
    2600,
  );
}
function store() {
  try {
    localStorage.setItem(
      storageKey(),
      JSON.stringify({
        completed: [...completed],
        completedLabels: [...completed].map((i) => manual!.steps[i].label),
        step: current,
      }),
    );
  } catch {}
}
function restore() {
  try {
    const p = JSON.parse(localStorage.getItem(storageKey()) ?? "{}");
    completed = new Set<number>(completedStepIndices(p, manual!));
  } catch {
    completed = new Set();
  }
}
function updateCompletion() {
  if (!manual) return;
  $("completion-count").textContent =
    `${completed.size} of ${manual.steps.length} completed`;
  $("completion-bar").style.width =
    `${(completed.size / manual.steps.length) * 100}%`;
  const done = completed.has(current);
  $("mark-complete").setAttribute("aria-pressed", String(done));
  $("mark-complete").querySelector("span")!.textContent = done
    ? "Completed"
    : "Mark complete";
}
function renderSteps() {
  if (!manual) return;
  const query = $<HTMLInputElement>("search").value.trim().toLowerCase();
  const nav = $("steps");
  nav.replaceChildren();
  const chapters = [...new Set(manual.steps.map((s) => s.chapter))];
  let hits = 0;
  for (const [ci, ch] of chapters.entries()) {
    const steps = manual.steps.filter(
      (s) =>
        s.chapter === ch &&
        `${s.title} ${s.part} ${s.officialLabel ?? ""} ${s.chapter} ${s.label}`
          .toLowerCase()
          .includes(query),
    );
    if (!steps.length) continue;
    hits += steps.length;
    const section = document.createElement("details");
    section.className = "chapter";
    section.open =
      !!query ||
      (current < 0 && ci === 0) ||
      steps.some((s) => s.index === current);
    const summary = document.createElement("summary");
    summary.innerHTML = `<span class="chapter-number">${String(ci + 1).padStart(2, "0")}</span><span></span><small>${steps.length}</small>`;
    summary.querySelectorAll("span")[1].textContent = ch;
    section.append(summary);
    for (const step of steps) {
      const b = document.createElement("button");
      b.className = `step-link${step.index === current ? " selected" : ""}${completed.has(step.index) ? " completed" : ""}`;
      b.setAttribute("aria-current", step.index === current ? "step" : "false");
      b.innerHTML = `<span class="step-dot">${completed.has(step.index) ? icon("check") : String(step.index + 1).padStart(2, "0")}</span><span class="step-link-label"></span><span class="step-arrow">›</span>`;
      b.querySelector(".step-link-label")!.textContent = step.title;
      b.addEventListener("click", () => go(step.index));
      section.append(b);
    }
    nav.append(section);
  }
  if (!hits) {
    const empty = document.createElement("p");
    empty.className = "empty-search";
    empty.textContent =
      "No matching steps. Try a part name such as “controller” or “M2”.";
    nav.append(empty);
  }
  updateCompletion();
  requestAnimationFrame(() =>
    nav.querySelector(".selected")?.scrollIntoView({ block: "nearest" }),
  );
}
function setPlaying(v: boolean) {
  playbackDelay = 0;
  playing = v && current >= 0 && ready && !manual?.steps[current]?.staticReview;
  $("play").innerHTML = icon(playing ? "pause" : "play");
  $("play").setAttribute(
    "aria-label",
    playing ? "Pause assembly motion" : "Play assembly motion",
  );
}
function phase() {
  if (!manual || current < 0) return;
  const step = manual.steps[current];
  const threshold =
    step.motionTiming?.prepareEnd ??
    (step.sourceFrames
      ? (step.sourceFrames.insert - step.sourceFrames.appear) /
        (step.sourceFrames.seated - step.sourceFrames.appear)
      : 0.18);
  const state = step.staticReview
    ? "Prepare"
    : progress >= 0.999
      ? "Check"
      : progress < threshold
        ? "Prepare"
        : "Assemble";
  $("phase").textContent = step.staticReview ? "Reference" : state;
  document
    .querySelectorAll<HTMLButtonElement>("[data-phase]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.textContent?.includes(state))),
    );
  const ins = step.instructions.filter(
    (s) =>
      !s.startsWith("Locate the next") && !s.startsWith("Move to the next"),
  );
  const fasteners = !step.wiringCable && viewer.hasLocations();
  const textByPhase: Record<string, string> = {
    Prepare:
      step.prepareInstruction ??
      `Have ${step.quantity ? step.quantity + " × " : ""}${step.part} ready${fasteners ? ". Numbered locations identify the seated positions; they are not a tightening order." : ". " + (ins[0] ?? "Review the mating features before assembly.")}`,
    Assemble: ins[0] ?? "Align the mating features, then seat the part.",
    Check: fasteners
      ? `Check all ${step.quantity} numbered fasteners against the seated view before marking this step complete.`
      : (ins.at(-1) ?? "Compare your assembly with the seated view."),
  };
  document.querySelectorAll<HTMLElement>("[data-instruction]").forEach((p) => {
    const key = p.dataset.instruction!;
    if (p.textContent !== textByPhase[key]) p.textContent = textByPhase[key];
    p.setAttribute("aria-hidden", String(key !== state));
  });
}
function go(index: number, changeURL = true) {
  if (!manual || !ready) return;
  current = Math.max(-1, Math.min(manual.steps.length - 1, index));
  progress = 0;
  setPlaying(false);
  selected = null;
  $("part-inspector").hidden = true;
  viewer.setStep(current >= 0 ? manual.steps[current] : null, 0, false);
  $("overview-card").hidden = current >= 0;
  $("active-card").hidden = current < 0;
  $("context-control").hidden = current < 0;
  $("gesture-hint").hidden = current >= 0;
  $("camera-presets").hidden = current < 0;
  $("locations").hidden = !viewer.hasLocations();
  const cable = manual.cables?.find(
    (c) => c.partId === manual!.steps[current]?.wiringCable,
  );
  for (const end of ["from", "to"] as const) {
    const button = $("cable-" + end);
    button.hidden = !cable;
    button.textContent = cable
      ? cable[end].label.replace("Converter · ", "")
      : "";
    button.title = cable ? "Inspect connector · " + cable[end].label : "";
  }
  $("viewport").parentElement!.classList.toggle("in-step", current >= 0);
  $("sidebar").classList.remove("mobile-open");
  $("menu").setAttribute("aria-expanded", "false");
  const step = manual.steps[current];
  $("step-card").classList.toggle("reference-step", !!step?.staticReview);
  for (const id of ["play", "replay", "scrub", "speed"])
    $<HTMLButtonElement>(id).disabled = !!step?.staticReview;
  document.querySelector<HTMLElement>(".stage-strip")!.hidden =
    !!step?.staticReview;
  if (current < 0) {
    $("view-chapter").textContent = "EXPLORE OMX";
    $("view-title").textContent =
      model === "leader"
        ? "Leader. In your hands."
        : "Follower. Ready to build.";
    $("view-subtitle").textContent =
      "Inspect the complete model, then follow each connection.";
  } else {
    const s = manual.steps[current];
    $("view-chapter").textContent = `${model.toUpperCase()} / ASSEMBLY`;
    $("view-title").textContent = s.chapter;
    $("view-subtitle").textContent =
      `Step ${current + 1} of ${manual.steps.length}`;
    $("current-counter").textContent =
      `STEP ${current + 1} OF ${manual.steps.length}`;
    $("current-title").textContent = s.title;
    $("current-part").textContent =
      s.part +
      (s.quantity
        ? `  ·  ${s.quantity} ${s.quantity === "1" ? "pc" : "pcs"}`
        : "");
    const bag = $("official-part-label");
    bag.hidden = !s.officialLabel || s.officialLabel === s.part;
    bag.textContent = s.officialLabel ? `Label: ${s.officialLabel}` : "";
    bag.title =
      s.officialLabelNote ??
      "Name shown in the official assembly video, to help match the part packaging.";
    $<HTMLButtonElement>("previous").disabled = current === 0;
    $("next").innerHTML =
      current === manual.steps.length - 1
        ? `Complete & review ${icon("check")}`
        : `Complete & next ${icon("next")}`;
    $<HTMLButtonElement>("browse-next").disabled =
      current === manual.steps.length - 1;
    phase();
  }
  // Measure the final task-card layout before choosing the next camera endpoint.
  layoutViewport();
  viewer.resize(false);
  if (current >= 0) viewer.fitStep();
  else viewer.overview();
  setPlaying(current >= 0 && !reducedMotion.matches && !document.hidden);
  if (playing) playbackDelay = 0.75;
  $<HTMLInputElement>("scrub").value = "0";
  renderSteps();
  store();
  if (changeURL) {
    const url = new URL(location.href);
    url.searchParams.set("model", model);
    if (model === "follower" && hardware === "xl4015")
      url.searchParams.set("converter", "xl4015");
    else url.searchParams.delete("converter");
    if (current >= 0) url.searchParams.set("step", String(current + 1));
    else url.searchParams.delete("step");
    history.replaceState(null, "", url);
    publishState();
  }
}
async function load(kind: "leader" | "follower", initialStep = -1) {
  const token = ++loadToken;
  model = kind;
  ready = false;
  setPlaying(false);
  $<HTMLSelectElement>("hardware").disabled = true;
  $("loading").hidden = false;
  $("error").hidden = true;
  $("loading-bar").style.width = "5%";
  $("loading-label").textContent =
    `Loading OMX ${kind === "leader" ? "Leader" : "Follower"}…`;
  document.querySelectorAll<HTMLButtonElement>("[data-model]").forEach((b) => {
    b.disabled = true;
    b.setAttribute("aria-pressed", String(b.dataset.model === kind));
  });
  try {
    const res = await fetch(
      assetUrl(
        `models/${kind === "follower" && hardware === "xl4015" ? "follower-xl4015" : kind}.json`,
      ),
      { cache: "no-cache" },
    );
    if (!res.ok) throw new Error(`Guide data returned ${res.status}`);
    const data = (await res.json()) as Manual;
    if (data.schemaVersion !== 1 || !data.parts.length || !data.steps.length)
      throw new Error("The guide data is incomplete.");
    if (token !== loadToken) return;
    await viewer.load(
      data,
      (n) => {
        $("loading-bar").style.width = `${10 + n * 85}%`;
        $("loading-label").textContent =
          `Preparing ${data.parts.length} CAD parts · ${Math.round(n * 100)}%`;
      },
      () => token === loadToken,
    );
    if (token !== loadToken) return;
    manual = data;
    model = kind;
    $("hardware-picker").hidden = kind !== "follower";
    $<HTMLSelectElement>("hardware").value = hardware;
    restore();
    ready = true;
    $("step-count").textContent = `${data.steps.length} steps`;
    $("overview-title").textContent =
      `Build your OMX ${kind === "leader" ? "Leader" : "Follower"}.`;
    $<HTMLInputElement>("search").value = "";
    $("loading").hidden = true;
    go(initialStep, true);
  } catch (e) {
    if (token !== loadToken) return;
    $("loading").hidden = true;
    $("error").hidden = false;
    $("error-text").textContent =
      e instanceof Error ? e.message : "Unexpected model loading error.";
  } finally {
    if (token !== loadToken) return;
    $<HTMLSelectElement>("hardware").disabled = false;
    document
      .querySelectorAll<HTMLButtonElement>("[data-model]")
      .forEach((b) => (b.disabled = false));
  }
}
viewer.onSelect = (p) => {
  selected = p;
  $("part-inspector").hidden = !p;
  if (!p) return;
  $("part-title").textContent = p.group === 2 ? "OpenRB-150" : p.label;
  $("part-description").textContent =
    p.group === 2 ? "Controller · factory-assembled board" : p.sourceName;
  const idx = manual?.steps.findIndex((s) => s.active.includes(p.id)) ?? -1;
  const matched = idx >= 0 ? manual?.steps[idx] : undefined;
  if (matched?.officialLabel) {
    $("part-description").textContent =
      `${matched.part} · Label: ${matched.officialLabel}`;
  }
  $<HTMLButtonElement>("find-part").disabled = idx < 0;
};
viewer.onCameraChange = () => {
  if (playing) setPlaying(false);
};
$("close-part").onclick = () => viewer.clearSelection();
$("focus-part").onclick = () => viewer.focusSelected();
$("find-part").onclick = () => {
  if (!selected || !manual) return;
  const n = manual.steps.findIndex((s) => s.active.includes(selected!.id));
  if (n >= 0) go(n);
};
$("overview").onclick = () => go(-1);
$("fit").onclick = () => (current < 0 ? viewer.overview() : viewer.fitStep());
$("start").onclick = () => go(0);
$("previous").onclick = () => go(current - 1);
$("browse-next").onclick = () => go(current + 1);
$("next").onclick = () => {
  if (!manual || current < 0) return;
  completed.add(current);
  store();
  if (current === manual.steps.length - 1) {
    go(-1);
    toast(
      completed.size === manual.steps.length
        ? "All steps marked complete. Review your wiring before powering on and continuing to software setup."
        : `${completed.size} of ${manual.steps.length} steps complete. Review unchecked steps in the list.`,
    );
  } else go(current + 1);
};
$("play").onclick = () => {
  if (playing) {
    setPlaying(false);
    return;
  }
  if (progress >= 1) {
    progress = 0;
    viewer.setProgress(0);
    $<HTMLInputElement>("scrub").value = "0";
    phase();
  }
  setPlaying(true);
};
$("replay").onclick = () => {
  progress = 0;
  viewer.setProgress(0);
  setPlaying(true);
};
$("scrub").onpointerdown = () => setPlaying(false);
$<HTMLInputElement>("scrub").oninput = (e) => {
  setPlaying(false);
  progress = Number((e.target as HTMLInputElement).value) / 1000;
  viewer.setProgress(progress);
  phase();
};
$<HTMLSelectElement>("speed").onchange = (e) =>
  (speed = Number((e.target as HTMLSelectElement).value));
$("mark-complete").onclick = () => {
  if (current < 0) return;
  if (completed.has(current)) completed.delete(current);
  else completed.add(current);
  store();
  renderSteps();
};
$("clear-progress").onclick = () => {
  completed.clear();
  store();
  renderSteps();
  toast("Build progress reset.");
};
$<HTMLInputElement>("search").oninput = renderSteps;
document.querySelectorAll<HTMLButtonElement>("[data-context]").forEach(
  (b) =>
    (b.onclick = () => {
      const mode = b.dataset.context as "solid" | "ghost" | "hide";
      viewer.setContext(mode);
      document
        .querySelectorAll("[data-context]")
        .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    }),
);
document.querySelectorAll<HTMLButtonElement>("[data-model]").forEach(
  (b) =>
    (b.onclick = () => {
      if (b.dataset.model !== model)
        load(b.dataset.model as "leader" | "follower");
    }),
);
$("cable-from").onclick = () => viewer.focusCableEnd("from");
$("cable-to").onclick = () => viewer.focusCableEnd("to");
$("work-view").onclick = () => viewer.fitStep();
$("reverse-view").onclick = () => viewer.fitStep(true, true);
$("assembly-view").onclick = () => viewer.overview();
$("locations").onclick = () => {
  const show = $("locations").getAttribute("aria-pressed") !== "true";
  $("locations").setAttribute("aria-pressed", String(show));
  viewer.showLocations(show);
};
document.querySelectorAll<HTMLButtonElement>("[data-phase]").forEach(
  (b) =>
    (b.onclick = () => {
      setPlaying(false);
      progress = Number(b.dataset.phase);
      viewer.setProgress(progress);
      $<HTMLInputElement>("scrub").value = String(progress * 1000);
      phase();
    }),
);
$("share").onclick = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl());
    toast("Step link copied.");
  } catch {
    toast("Copy this page’s address to save the current step.");
  }
};
const dialog = $<HTMLDialogElement>("help-dialog");
$("help").onclick = () => dialog.showModal();
$("close-help").onclick = () => dialog.close();
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      (e as MouseEvent).clientX < r.left ||
      (e as MouseEvent).clientX > r.right ||
      (e as MouseEvent).clientY < r.top ||
      (e as MouseEvent).clientY > r.bottom
    )
      dialog.close();
  }
});
$("menu").onclick = () => {
  const open = $("sidebar").classList.toggle("mobile-open");
  $("menu").setAttribute("aria-expanded", String(open));
  if (open)
    requestAnimationFrame(() =>
      $("steps")
        .querySelector(".selected")
        ?.scrollIntoView({ block: "nearest" }),
    );
};
$("retry").onclick = () => load(model, current);
$<HTMLSelectElement>("hardware").onchange = () => {
  hardware =
    $<HTMLSelectElement>("hardware").value === "xl4015" ? "xl4015" : "bic30";
  load("follower", current);
};
window.addEventListener("keydown", (e) => {
  if (
    (e.target as HTMLElement).matches(
      "input,select,textarea,button,a,summary",
    ) ||
    dialog.open
  )
    return;
  if (e.code === "Space" && current >= 0) {
    e.preventDefault();
    $("play").click();
  }
  if (e.code === "ArrowRight" && current >= 0) {
    e.preventDefault();
    $("browse-next").click();
  }
  if (e.code === "ArrowLeft" && current > 0) {
    e.preventDefault();
    go(current - 1);
  }
  if (e.code === "Escape") viewer.clearSelection();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) setPlaying(false);
});
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) setPlaying(false);
});
let last = performance.now();
let stopped = false;
function tick(now: number) {
  if (stopped) return;
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  if (playing && manual && current >= 0) {
    const next = advancePlayback(
      progress,
      playbackDelay,
      dt,
      manual.steps[current].duration,
      speed,
    );
    playbackDelay = next.delay;
    if (next.progress !== progress) {
      progress = next.progress;
      viewer.setProgress(progress);
      $<HTMLInputElement>("scrub").value = String(Math.round(progress * 1000));
      phase();
    }
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

const url = new URL(location.href);
model = url.searchParams.get("model") === "follower" ? "follower" : "leader";
hardware = url.searchParams.get("converter") === "xl4015" ? "xl4015" : "bic30";
const initial = Number(url.searchParams.get("step"));
load(model, Number.isInteger(initial) && initial > 0 ? initial - 1 : -1);

window.addEventListener("message", (event) => {
  if (
    event.source !== window.parent ||
    event.origin !== location.origin ||
    event.data?.type !== "omx:navigate" ||
    typeof event.data.search !== "string"
  )
    return;
  const params = new URLSearchParams(assemblySearch(event.data.search));
  const nextModel = params.get("model") as "leader" | "follower";
  const nextHardware =
    params.get("converter") === "xl4015" ? "xl4015" : "bic30";
  const nextStep = Number(params.get("step")) - 1;
  if (nextModel !== model || nextHardware !== hardware) {
    hardware = nextHardware;
    load(nextModel, nextStep);
  } else if (nextStep !== current) go(nextStep);
});
window.addEventListener("pagehide", () => {
  stopped = true;
  ++loadToken;
  setPlaying(false);
  layoutObserver.disconnect();
  viewer.dispose();
});

window.addEventListener("pageshow", (event) => {
  if (event.persisted) location.reload();
});
