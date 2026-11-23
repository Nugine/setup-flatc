import { expect, test } from "vitest";
import type { Octokit } from "octokit";
import { resolveVersion } from "../src/lib";

const emptyGh = {} as unknown as Octokit;

test("normalizes exact version", async () => {
  expect(await resolveVersion(emptyGh, "v24.12.23")).toBe("24.12.23");
});

test("rejects invalid version", async () => {
  await expect(resolveVersion(emptyGh, "not-a-version")).rejects.toThrow("Invalid version");
});

test("resolves range against releases", async () => {
  const gh = { rest: { repos: { listReleases: async () => ({ data: [{ tag_name: "v24.13.0" }, { tag_name: "v24.12.23" }, { tag_name: "v23.5.26" }] }) } } } as unknown as Octokit;
  expect(await resolveVersion(gh, "24.12.*")).toBe("24.12.23");
});

test("resolves latest release", async () => {
  const gh = { rest: { repos: { getLatestRelease: async () => ({ data: { tag_name: "v24.12.23" } }) } } } as unknown as Octokit;
  expect(await resolveVersion(gh, "*")).toBe("24.12.23");
});