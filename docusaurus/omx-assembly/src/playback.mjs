// Hold the seated pose before restarting a demonstration; never advance the guide.
export function advancePlayback(progress, delay, dt, duration, speed) {
  if (delay > 0) return { progress, delay: Math.max(0, delay - dt) };
  if (progress >= 1) return { progress: 0, delay: 0 };
  const next = Math.min(1, progress + (dt * speed) / Math.max(duration, 1));
  return { progress: next, delay: next >= 1 ? 1.5 : 0 };
}
