/** Resolve runtime assets alongside index.html, never at the domain root. */
export function assetUrl(path) {
  return new URL(path, new URL(".", window.location.href)).href;
}
