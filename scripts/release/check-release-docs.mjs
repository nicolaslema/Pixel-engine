import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function fail(message) {
  console.error(`release-docs-check: ${message}`);
  process.exit(1);
}

function parseVersion(value) {
  const match = value.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function compareSemver(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return 0;
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

const root = process.cwd();
const packageJsonPath = resolve(root, "package.json");
const changelogPath = resolve(root, "CHANGELOG.md");
const migrationPath = resolve(root, "MIGRATION.md");

const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const version = String(pkg.version || "").trim();
if (!version) fail("package.json version is missing.");

const changelog = readFileSync(changelogPath, "utf8");
const migration = readFileSync(migrationPath, "utf8");

const versionMatches = [...changelog.matchAll(/^## \[(\d+\.\d+\.\d+)\]/gm)].map((m) => m[1]);
if (versionMatches.length === 0) {
  fail("CHANGELOG.md does not contain any semantic version headings.");
}
const latestChangelogVersion = versionMatches[0];
const changelogHasPackageVersion = versionMatches.includes(version);
const changelogAheadOfPackage = compareSemver(latestChangelogVersion, version) >= 0;

if (!changelogHasPackageVersion && !changelogAheadOfPackage) {
  fail(`CHANGELOG.md latest version (${latestChangelogVersion}) is older than package.json version (${version}).`);
}

if (!changelogHasPackageVersion) {
  console.warn(
    `release-docs-check: package.json version (${version}) not found in CHANGELOG.md; latest detected is ${latestChangelogVersion}.`
  );
}

const migrationMarkers = [`v${version}`, `[${version}]`, ` ${version}`, `v${latestChangelogVersion}`, `[${latestChangelogVersion}]`];
if (!migrationMarkers.some((marker) => migration.includes(marker))) {
  fail(
    `Missing migration reference for package version (${version}) or latest changelog version (${latestChangelogVersion}) in MIGRATION.md.`
  );
}

console.log(`release-docs-check: OK (package=${version}, changelog-latest=${latestChangelogVersion})`);
