import { readFile, writeFile, mkdir } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";

const source = new URL("../models/", import.meta.url);
const destination = new URL("../public/models/", import.meta.url);
const manifest = JSON.parse(
  await readFile(new URL("manifest.json", source), "utf8"),
);
await mkdir(destination, { recursive: true });
for (const [name, expected] of Object.entries(manifest)) {
  const data = gunzipSync(await readFile(new URL(`${name}.glb.gz`, source)));
  const digest = createHash("sha256").update(data).digest("hex");
  if (data.length !== expected.bytes || digest !== expected.sha256) {
    throw new Error(`Model integrity check failed: ${name}`);
  }
  await writeFile(new URL(`${name}.glb`, destination), data);
}
