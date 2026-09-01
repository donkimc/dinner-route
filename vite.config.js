import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: resolve(dir, "src"),
  publicDir: resolve(dir, "public"),
  base: process.env.GITHUB_ACTIONS ? "/dinner-route/" : "/",
  build: {
    outDir: resolve(dir, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "assets/app.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
