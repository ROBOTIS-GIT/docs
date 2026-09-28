import { defineConfig } from "vite";

export default defineConfig({
  // Relative URLs also work beneath a docs deployment's base URL.
  base: "./",
  build: { outDir: "../generated/interactive/omx", emptyOutDir: true },
});
