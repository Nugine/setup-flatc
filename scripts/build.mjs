import { rolldown } from "rolldown";

const bundle = await rolldown({
  input: "src/main.ts",
  platform: "node",
});

await bundle.write({
  file: "dist/main.js",
  format: "cjs",
});

await bundle.close();
