export function clamp(v, a = 0, b = 1) {
  return Math.min(b, Math.max(a, v));
}
export function sampleTrack(keys, t) {
  if (!keys?.length) return null;
  if (t <= keys[0][0]) return keys[0].slice(1);
  if (t >= keys.at(-1)[0]) return keys.at(-1).slice(1);
  let lo = 0,
    hi = keys.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (keys[mid][0] <= t) lo = mid;
    else hi = mid;
  }
  const a = keys[lo],
    b = keys[hi],
    u = (t - a[0]) / (b[0] - a[0]);
  return a.slice(1).map((v, i) => v + (b[i + 1] - v) * u);
}
export function stepPosition(part, step, t) {
  return (
    sampleTrack(step?.tracks[String(part.id)], clamp(t)) ??
    step?.offsets[String(part.id)] ??
    part.finalPosition
  );
}
export function activeParts(step) {
  return step.active.length
    ? step.active
    : Object.keys(step.tracks).map(Number);
}
export function progressKey(model) {
  return `omx-manual-v019-${model}`;
}

// Stable operation labels preserve checked work when the presentation order changes.
export function completedStepIndices(saved, manual) {
  const current = new Map(manual.steps.map((s, i) => [s.label, i]));
  const legacy = manual.legacyStepLabels ?? manual.steps.map((s) => s.label);
  const labels = Array.isArray(saved?.completedLabels)
    ? saved.completedLabels
    : (Array.isArray(saved?.completed) ? saved.completed : [])
        .filter((i) => Number.isInteger(i) && i >= 0 && i < legacy.length)
        .map((i) => legacy[i]);
  return [
    ...new Set(
      labels
        .filter((label) => typeof label === "string" && current.has(label))
        .map((label) => current.get(label)),
    ),
  ];
}

// Each cable is one mesh with two endpoint displacement targets.
// Seat A before B; the neighbouring wire bends with its plug.
export function cableInsertion(t) {
  const ease = (x) => {
    x = clamp(x);
    return x * x * x * (x * (x * 6 - 15) + 10);
  };
  return [1 - ease((t - 0.18) / 0.27), 1 - ease((t - 0.58) / 0.27)];
}
