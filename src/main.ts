import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as semver from "@std/semver";

const REPO = "google/flatbuffers";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch JSON from ${url} ${response.statusText}`);
  }
  // deno-lint-ignore no-explicit-any
  const value: any = await response.json();
  return value;
}

export async function resolveVersion(version: string): Promise<string> {
  if (version === "latest") {
    const apiUrl = `https://api.github.com/repos/${REPO}/releases/latest`;
    const resp = await fetchJson<{ tag_name: string }>(apiUrl);
    version = resp.tag_name;
  }

  if (version.startsWith("v")) {
    version = version.slice(1);
  }

  if (!semver.canParse(version)) {
    throw new Error(`Invalid version: ${version}`);
  }

  return version;
}

function getDownloadUrl(version: string): string {
  const baseUrl = `https://github.com/${REPO}/releases/download`;

  const platformMap: Record<string, string | undefined> = {
    linux: "Linux.flatc.binary.g++-13.zip",
    darwin: "Mac.flatc.binary.zip",
    win32: "Windows.flatc.binary.zip",
  };

  const filename = platformMap[core.platform.platform];
  if (!filename) {
    throw new Error(`Unsupported platform: ${core.platform.platform}`);
  }

  return `${baseUrl}/v${version}/${filename}`;
}

async function downloadFlatc(version: string, url: string): Promise<string> {
  let cachedPath = tc.find("flatc", version);
  if (cachedPath) {
    return cachedPath;
  }

  core.info(`Downloading URL: ${url}`);
  const downloadPath = await tc.downloadTool(url);
  core.info(`Downloaded to: ${downloadPath}`);

  const extractPath = await tc.extractZip(downloadPath);
  core.info(`Extracted to: ${extractPath}`);

  cachedPath = await tc.cacheDir(extractPath, "flatc", version);
  return cachedPath;
}

async function main() {
  const inputVersion = core.getInput("version") ?? "latest";
  core.info(`Input version: ${inputVersion}`);

  const version = await resolveVersion(inputVersion);
  core.info(`Resolved version: ${version}`);

  const url = getDownloadUrl(version);

  const cachedPath = await downloadFlatc(version, url);
  core.info(`Cached at: ${cachedPath}`);

  core.addPath(cachedPath);
  core.info("Added cached path to environment variables");
}

if (import.meta.main) {
  try {
    main();
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.setFailed(error);
    } else {
      core.setFailed(`An unknown error occurred: ${error}`);
    }
  }
}
