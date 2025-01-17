import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as tc from "@actions/tool-cache";
import * as semver from "@std/semver";
import { Octokit } from "octokit";
import type { Buffer } from "node:buffer";

async function resolveVersion(gh: Octokit, version: string): Promise<string> {
  if (version === "*") {
    const resp = await gh.rest.repos.getLatestRelease({
      owner: "google",
      repo: "flatbuffers",
    });
    version = resp.data.tag_name;
    if (version.startsWith("v")) {
      version = version.slice(1);
    }
  }

  if (semver.canParse(version)) {
    return version;
  }

  const range = semver.tryParseRange(version);
  if (range) {
    const resp = await gh.rest.repos.listReleases({
      owner: "google",
      repo: "flatbuffers",
      page: 1,
      per_page: 100,
    });
    for (const release of resp.data) {
      version = release.tag_name;
      if (version.startsWith("v")) {
        version = version.slice(1);
      }
      const ver = semver.parse(version);
      if (semver.satisfies(ver, range)) {
        return version;
      }
    }
    throw new Error("No matching version found for range");
  }

  throw new Error(`Invalid version: ${version}`);
}

async function downloadFlatc(gh: Octokit, version: string): Promise<string> {
  // https://github.com/actions/toolkit/tree/main/packages/core#platform-helper
  const platformDetails = await core.platform.getDetails();
  core.info(JSON.stringify(platformDetails));

  const platformMap: Record<string, RegExp | undefined> = {
    "linux-x64": /Linux\.flatc\.binary\.g\+\+-\d+\.zip/,
    "darwin-arm64": /Mac\.flatc\.binary\.zip/,
    "darwin-x64": /MacIntel\.flatc\.binary\.zip/,
    "win32-x64": /Windows\.flatc\.binary\.zip/,
  };

  const key = `${platformDetails.platform}-${platformDetails.arch}`;
  const fileRegex = platformMap[key];

  const resp = await gh.rest.repos.getReleaseByTag({
    owner: "google",
    repo: "flatbuffers",
    tag: `v${version}`,
  });

  if (fileRegex) {
    let url: string | null = null;
    for (const asset of resp.data.assets) {
      if (fileRegex.test(asset.name)) {
        url = asset.browser_download_url;
      }
    }
    if (!url) {
      throw new Error("No matching asset found for platform");
    }

    core.info(`Downloading URL: ${url}`);
    const downloadPath = await tc.downloadTool(url);
    core.info(`Downloaded to: ${downloadPath}`);

    const extractPath = await tc.extractZip(downloadPath);
    core.info(`Extracted to: ${extractPath}`);

    return await tc.cacheDir(extractPath, "flatc", version);
  } else {
    const url = resp.data.tarball_url;
    if (!url) {
      throw new Error("No tarball found for platform");
    }

    core.info(`Downloading URL: ${url}`);
    const downloadPath = await tc.downloadTool(url);
    core.info(`Downloaded to: ${downloadPath}`);

    const extractPath = await tc.extractTar(downloadPath);
    core.info(`Extracted to: ${extractPath}`);

    const sourcePath = extractPath + "/" + (await ls(extractPath)).trim();

    core.info("Building flatc from source");
    await exec.exec("cmake", ["-G", "Unix Makefiles"], { cwd: sourcePath });
    await exec.exec("make", ["-j"], { cwd: sourcePath });
    core.info("Built flatc from source");

    return await tc.cacheDir(extractPath, "flatc", version);
  }
}

async function ls(path: string): Promise<string> {
  let stdout = "";
  const options = {
    listeners: {
      stdout: (data: Buffer) => {
        stdout += data.toString();
      },
    },
  };
  await exec.exec("ls", [path], options);
  return stdout;
}

async function main() {
  const githubToken = core.getInput("github-token") ?? undefined;
  const gh = new Octokit({ auth: githubToken });

  const inputVersion = core.getInput("version") ?? "*";
  core.info(`Input version: ${inputVersion}`);

  const version = await resolveVersion(gh, inputVersion);
  core.info(`Resolved version: ${version}`);

  let cachedPath = tc.find("flatc", version);
  if (!cachedPath) {
    cachedPath = await downloadFlatc(gh, version);
  }
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
