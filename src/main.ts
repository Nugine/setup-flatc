import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import { Octokit } from "octokit";
import { downloadFlatc, resolveVersion } from "./lib.ts";

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

main().catch((error: unknown) => {
  if (error instanceof Error) core.setFailed(error);
  else core.setFailed(`An unknown error occurred: ${String(error)}`);
});
