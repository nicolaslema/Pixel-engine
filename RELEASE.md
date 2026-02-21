# Release Workflow

This document defines the publish order and release checks for the Pixel Engine monorepo.

## 0. Prerequisites

- Confirm repository metadata is correct:
- root `package.json`
- `packages/core/package.json`
- `packages/effects/package.json`
- `packages/react/package.json`
- Be authenticated in npm:
  - `npm whoami`
- Ensure clean git state on your release branch.

## 1. Validate before publish

Run from repo root:

```bash
npm run release:check
```

This executes:
- tests
- full builds (root + workspace packages)
- typecheck
- release docs version check (`CHANGELOG.md`, `MIGRATION.md`)
- dry-run pack for:
  - `pixel-engine`
  - `@pixel-engine/core`
  - `@pixel-engine/effects`
  - `@pixel-engine/react`
- generated tarball verification (`npm pack` artifacts exist and are non-empty)
- consumer smoke test from local tarballs (real install + import check)

## 1.1 Optional docs scaffold automation

Before finalizing release notes, you can scaffold docs entries automatically:

```bash
npm run release:docs:prepare
```

Or for a specific target version:

```bash
npm run release:docs:prepare -- 1.0.13
```

This inserts templates (only if missing) in:
- `CHANGELOG.md`
- `MIGRATION.md`

## 2. Publish order

Publish strictly in this order:

1. `@pixel-engine/core`
2. `@pixel-engine/effects`
3. `@pixel-engine/react`
4. `pixel-engine` (aggregate compatibility package)

Reason:
- `effects` depends on `core`.
- `react` depends on `core` and `effects`.
- aggregate package should be published last to avoid broken install windows.

## 3. Versioning strategy

- Stable releases -> `latest` tag.
- Pre-releases -> `next` tag.
- Use semver:
  - `patch`: fixes, no API breaks
  - `minor`: additive features
  - `major`: breaking API changes

## 4. Publish commands (example)

```bash
npm publish -w @pixel-engine/core --access public
npm publish -w @pixel-engine/effects --access public
npm publish -w @pixel-engine/react --access public
npm publish --access public
```

For pre-release channel:

```bash
npm publish -w @pixel-engine/core --tag next --access public
npm publish -w @pixel-engine/effects --tag next --access public
npm publish -w @pixel-engine/react --tag next --access public
npm publish --tag next --access public
```

## 5. Post-release checklist

- Verify package pages in npm.
- Smoke test installation in a clean React project.
- Update `CHANGELOG.md`.
- Update `MIGRATION.md` if API changed.

For an actionable runbook, use: `RELEASE_CHECKLIST.md`.
