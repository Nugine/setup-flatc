import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import process from "node:process";

function getDownloadUrl(version: string): string | null {
  const baseUrl = "https://github.com/google/flatbuffers/releases/download";

  let filename: string | null = null;

  if (process.platform === "linux") {
    filename = "Linux.flatc.binary.g++-13.zip";
  } else if (process.platform === "darwin") {
    filename = "Mac.flatc.binary.zip";
  } else if (process.platform === "win32") {
    filename = "Windows.flatc.binary.zip";
  } else {
    return null;
  }

  return `${baseUrl}/v${version}/${filename}`;
}

async function main() {
  const version = core.getInput("version");
  const url = getDownloadUrl(version);
  if (!url) {
    core.setFailed(`Unsupported platform: ${process.platform}`);
    return;
  }
  const downloadPath = await tc.downloadTool(url);
  const extractPath = await tc.extractZip(downloadPath);
  const cachedPath = await tc.cacheDir(extractPath, "flatc", version);
  core.addPath(cachedPath);
}

if (import.meta.main) {
  main();
}
