import { execFileSync } from "node:child_process";

const status = execFileSync("git", ["status", "--porcelain"], {
  encoding: "utf8",
});
if (status.trim() !== "") {
  console.error(status);
  process.exit(1);
}
