import * as dnt from "@deno/dnt";
import * as esbuild from "esbuild";

// Preserve the committed package-lock.json so that dnt's `npm install` resolves
// the same (transitive) dependency versions on every build.
const lockPath = "./npm/package-lock.json";
let lockContent: string | undefined;
try {
  lockContent = await Deno.readTextFile(lockPath);
} catch {
  // no lock file yet (first build)
}

await dnt.emptyDir("./npm");
await dnt.emptyDir("./dist");

if (lockContent != null) {
  await Deno.writeTextFile(lockPath, lockContent);
}

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
