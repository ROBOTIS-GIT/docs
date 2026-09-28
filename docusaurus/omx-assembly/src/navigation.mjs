/** Only assembly state crosses the iframe boundary. Never accept a destination URL. */
export function assemblySearch(value) {
  const input = new URLSearchParams(value);
  const result = new URLSearchParams();
  const model = input.get("model") === "follower" ? "follower" : "leader";
  result.set("model", model);
  if (model === "follower" && input.get("converter") === "xl4015") {
    result.set("converter", "xl4015");
  }
  const step = Number(input.get("step"));
  if (Number.isInteger(step) && step > 0 && step <= 1000)
    result.set("step", String(step));
  return result.toString();
}

export function publishState() {
  if (window.parent !== window) {
    window.parent.postMessage(
      { type: "omx:state", search: assemblySearch(location.search) },
      location.origin,
    );
  }
}

export function shareUrl() {
  try {
    if (
      window.parent !== window &&
      window.parent.location.origin === location.origin
    ) {
      return window.parent.location.href;
    }
  } catch {
    /* Standalone use does not require access to an embedding page. */
  }
  return location.href;
}
