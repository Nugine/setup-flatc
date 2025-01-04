import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as semver from "@std/semver";
import { Octokit } from "octokit";

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

async function getDownloadUrl(gh: Octokit, version: string): Promise<string> {
  const platformMap: Record<string, RegExp | undefined> = {
    linux: /Linux\.flatc\.binary\.g\+\+-\d+\.zip/,
    darwin: /Mac\.flatc\.binary\.zip/,
    win32: /Windows\.flatc\.binary\.zip/,
  };

  const fileRegex = platformMap[core.platform.platform];
  if (!fileRegex) {
    throw new Error(`Unsupported platform: ${core.platform.platform}`);
  }

  const resp = await gh.rest.repos.getReleaseByTag({
    owner: "google",
    repo: "flatbuffers",
    tag: `v${version}`,
  });

  for (const asset of resp.data.assets) {
    if (fileRegex.test(asset.name)) {
      return asset.browser_download_url;
    }
  }
  throw new Error("No matching asset found for platform");
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
  const githubToken = core.getInput("github-token") ?? undefined;
  const gh = new Octokit({ auth: githubToken });

  const inputVersion = core.getInput("version") ?? "*";
  core.info(`Input version: ${inputVersion}`);

  const version = await resolveVersion(gh, inputVersion);
  core.info(`Resolved version: ${version}`);

  const url = await getDownloadUrl(gh, version);
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
