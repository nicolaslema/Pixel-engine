import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "PixelEngine",
      fileName: "pixel-engine"
    },
    rollupOptions: {
      external: []
    }
  },
  test: {
    environment: "jsdom",
    globals: true
  }
});