import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "esnext",
  bundle: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
});
