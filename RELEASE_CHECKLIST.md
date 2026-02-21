# Release Checklist

Use this checklist for every public release.

## 1. Preflight

- [ ] `npm whoami` returns the expected npm account.
- [ ] Branch is up to date and clean (`git status` with no pending changes).
- [ ] Version is set correctly in:
  - [ ] root `package.json`
  - [ ] `packages/core/package.json`
  - [ ] `packages/effects/package.json`
  - [ ] `packages/react/package.json`

## 2. Release Docs

- [ ] Run `npm run release:docs:prepare` (or `npm run release:docs:prepare -- <version>`).
- [ ] Update generated placeholders in:
  - [ ] `CHANGELOG.md`
  - [ ] `MIGRATION.md`
- [ ] Validate docs include release version: `npm run release:docs:check`.

## 3. Quality + Artifacts

- [ ] Run `npm run release:check`.
- [ ] Confirm all validations pass:
  - [ ] tests (`test` / `test:ci` / `test:visual`)
  - [ ] aggregate + package builds
  - [ ] typecheck
  - [ ] pack dry-run
  - [ ] generated tarballs verification (`release:pack:verify`)
  - [ ] consumer smoke install/import (`smoke:consumer`)

## 4. Publish Order

- [ ] `npm publish -w @pixel-engine/core --access public`
- [ ] `npm publish -w @pixel-engine/effects --access public`
- [ ] `npm publish -w @pixel-engine/react --access public`
- [ ] `npm publish --access public`

Pre-release channel (`next`):

- [ ] `npm publish -w @pixel-engine/core --tag next --access public`
- [ ] `npm publish -w @pixel-engine/effects --tag next --access public`
- [ ] `npm publish -w @pixel-engine/react --tag next --access public`
- [ ] `npm publish --tag next --access public`

## 5. Post-release

- [ ] Validate package pages and versions on npm.
- [ ] Run one external React smoke install test.
- [ ] Create release notes tag in GitHub.
