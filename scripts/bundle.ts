import * as dnt from "@deno/dnt";
import * as esbuild from "esbuild";

await dnt.emptyDir("./npm");
await dnt.emptyDir("./dist");

await dnt.build({
  entryPoints: ["./src/main.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
    timers: true,
  },
  package: {
    name: "setup-flatc",
    version: "0.0.0",
  },
  typeCheck: "both",
  importMap: "deno.json",
});

await esbuild.build({
  entryPoints: ["./npm/script/main.js"],
  bundle: true,
  platform: "node",
  target: "node20",
  outdir: "./dist",
});
