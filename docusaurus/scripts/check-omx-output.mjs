import { access, readdir, rm, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../build/", import.meta.url);
// OMX is English-only. The existing Korean unsupported-doc notice links to it.
// Docusaurus copies static directories per locale, so remove that redundant copy.
await rm(new URL("ko/interactive/omx/", root), {
  recursive: true,
  force: true,
});
const app = new URL("interactive/omx/", root);
try {
  await access(new URL("index.html", app));
} catch {
  // A standalone Korean build does not create an English application.
  if (!(await stat(new URL("index.html", root)).catch(() => null)))
    process.exit(0);
  throw new Error(
    "Missing interactive assembly build. Build the English site first.",
  );
}
async function bytes(dir) {
  let total = 0;
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = new URL(item.name + (item.isDirectory() ? "/" : ""), dir);
    total += item.isDirectory() ? await bytes(path) : (await stat(path)).size;
  }
  return total;
}
const size = await bytes(app);
if (size > 125 * 1024 * 1024)
  throw new Error(
    `OMX application exceeds its 125 MiB size budget: ${size} bytes`,
  );
for (const model of ["leader", "follower", "follower-xl4015"]) {
  await access(new URL(`models/${model}.glb`, app));
  await access(new URL(`models/${model}.json`, app));
}
console.log(
  `OMX: ${(size / 1024 / 1024).toFixed(1)} MiB, one shared asset copy in ${fileURLToPath(app)}`,
);
