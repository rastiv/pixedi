# Changelog

All notable changes to this project will be documented in this file.

## 1.0.6

- Created a dedicated `README.widget.md` with full widget API documentation and examples.
- Included `README.widget.md` in the npm package.
- Updated npm README to link to the widget documentation.

## 1.0.5

- Professionalized CI/CD pipeline: split build, deploy, and publish into separate jobs.
- Pinned Node.js 22 and pnpm 11.17.0 in GitHub Actions for reproducible builds.
- Added pnpm caching and artifact upload/download to the workflow.
- Made npm publish conditional: skipped if the version already exists on the registry.
- Included `dist/widget` in the npm package for CDN usage.
- Added `CHANGELOG.md` to the npm package.
- Documented widget CDN usage in README.

## 1.0.4

- Fixed Cloudflare Pages deployment by changing the app build output directory from `dist/app` to `dist`.
- Upgraded CI/CD pipeline to pnpm v11 for consistency with local development.
- Added `dist/widget` to the npm package so `pixedi-widget.js` can be consumed via CDN.

## 1.0.3

- Allowed esbuild postinstall scripts for pnpm v11 via `allowBuilds` in `pnpm-workspace.yaml`.

## 1.0.2

- Published package with updated pnpm configuration to resolve ignored esbuild build scripts.

## 1.0.1

- Initial public release of the pixedi React image editor component.
