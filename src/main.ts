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
  core.info(`Specified version: ${version}`);

  const url = getDownloadUrl(version);
  if (!url) {
    core.setFailed(`Unsupported platform: ${core.platform.platform}`);
    return;
  }

  let cachedPath = tc.find("flatc", version);
  if (!cachedPath) {
    core.info(`Downloading URL: ${url}`);
    const downloadPath = await tc.downloadTool(url);
    core.info(`Downloaded to: ${downloadPath}`);

    const extractPath = await tc.extractZip(downloadPath);
    core.info(`Extracted to: ${extractPath}`);

    cachedPath = await tc.cacheDir(extractPath, "flatc", version);
  }
  core.info(`Cached at: ${cachedPath}`);

  core.addPath(cachedPath);
  core.info("Added cached path to environment variables");
}

if (import.meta.main) {
  main();
}
