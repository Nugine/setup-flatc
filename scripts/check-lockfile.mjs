import { readFileSync } from "node:fs";

const lock = readFileSync("package-lock.json", "utf8");
const bad = lock
  .split("\n")
  .filter(
    (line) =>
      line.includes("resolved") &&
      line.includes("http") &&
      !line.includes("registry.npmjs.org"),
  );
if (bad.length > 0) {
  console.error("package-lock.json contains non-npmjs resolved URLs:");
  console.error(bad.join("\n"));
  process.exit(1);
}
