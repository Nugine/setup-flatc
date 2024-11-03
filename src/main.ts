import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";

function getDownloadUrl(version: string): string | null {
  const baseUrl = "https://github.com/google/flatbuffers/releases/download";

  let filename: string | null = null;

  if (core.platform.platform === "linux") {
    filename = "Linux.flatc.binary.g++-13.zip";
  } else if (core.platform.platform === "darwin") {
    filename = "Mac.flatc.binary.zip";
  } else if (core.platform.platform === "win32") {
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
    core.setFailed(`Unsupported platform: ${core.platform.platform}`);
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
