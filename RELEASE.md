# Release Workflow

This document defines the publish order and release checks for the Pixel Engine monorepo.

## 0. Prerequisites

- Update placeholder repository metadata if needed:
- root `package.json`
- `packages/core/package.json`
- `packages/effects/package.json`
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
- dry-run pack for:
  - `pixel-engine`
  - `@pixel-engine/core`
  - `@pixel-engine/effects`

## 2. Publish order

Publish strictly in this order:

1. `@pixel-engine/core`
2. `@pixel-engine/effects`
3. `pixel-engine` (aggregate compatibility package)

Reason:
- `effects` depends on `core`.
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
npm publish --access public
```

For pre-release channel:

```bash
npm publish -w @pixel-engine/core --tag next --access public
npm publish -w @pixel-engine/effects --tag next --access public
npm publish --tag next --access public
```

## 5. Post-release checklist

- Verify package pages in npm.
- Smoke test installation in a clean React project.
- Update `CHANGELOG.md`.
- Update `MIGRATION.md` if API changed.
