import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function formatDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

const root = process.cwd();
const packageJsonPath = resolve(root, "package.json");
const changelogPath = resolve(root, "CHANGELOG.md");
const migrationPath = resolve(root, "MIGRATION.md");

const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const version = String(process.argv[2] || pkg.version || "").trim();
if (!version) {
  console.error("release-docs-prepare: missing version argument and package.json version.");
  process.exit(1);
}

const today = formatDate();

let changelog = readFileSync(changelogPath, "utf8");
const changelogHeading = `## [${version}]`;
if (!changelog.includes(changelogHeading)) {
  const marker = "All notable changes to this project are documented in this file.\n\n";
  const index = changelog.indexOf(marker);
  const entry = [
    `${changelogHeading} - ${today}`,
    "",
    "### Added",
    "- TBD",
    "",
    "### Changed",
    "- TBD",
    "",
    "### Fixed",
    "- TBD",
    "",
    ""
  ].join("\n");

  if (index >= 0) {
    changelog = `${changelog.slice(0, index + marker.length)}${entry}${changelog.slice(index + marker.length)}`;
  } else {
    changelog = `${entry}${changelog}`;
  }
  writeFileSync(changelogPath, changelog, "utf8");
  console.log(`release-docs-prepare: added CHANGELOG template for ${version}`);
} else {
  console.log(`release-docs-prepare: CHANGELOG entry already exists for ${version}`);
}

let migration = readFileSync(migrationPath, "utf8");
const migrationVersionMarker = `v${version}`;
if (!migration.includes(migrationVersionMarker) && !migration.includes(`[${version}]`)) {
  const headerMarker = "This guide covers migration to the formal v1 stable baseline and the new package split.\n\n";
  const updateBlock = [
    `## Update: Release ${migrationVersionMarker} (${today})`,
    "",
    "- Document migration-relevant changes here.",
    "",
    "Maintainer note:",
    "- Add upgrade steps for any API/config behavior changes.",
    "",
    ""
  ].join("\n");

  const headerIndex = migration.indexOf(headerMarker);
  if (headerIndex >= 0) {
    migration = `${migration.slice(0, headerIndex + headerMarker.length)}${updateBlock}${migration.slice(headerIndex + headerMarker.length)}`;
  } else {
    migration = `${updateBlock}${migration}`;
  }

  writeFileSync(migrationPath, migration, "utf8");
  console.log(`release-docs-prepare: added MIGRATION template for ${version}`);
} else {
  console.log(`release-docs-prepare: MIGRATION entry already exists for ${version}`);
}
