# Pixedi — AI Agent Instructions

## Project Overview

Pixedi is a lightweight, embeddable React image editor component. It ships as:

1. **React component library** — published to npm as `pixedi`.
2. **Standalone UMD widget** — embeddable via CDN for non-React environments.

The core component lives in `src/shared/components/Pixedi`.

> **Local dev SPA** — `src/app/`, `src/features/`, and related shared components exist for local development only. They are **not** published and **not** built by `pnpm build`. They are intentionally kept in this repo for convenience when working on the component.

## Tech Stack

- **Framework**: React 19 + TypeScript 6
- **Bundler**: Vite 8
- **Package Manager**: pnpm 11.17.0 (`packageManager` field is authoritative)
- **Router**: `react-router` v8 (devDependency — used by the local dev SPA only)
- **Testing**: Vitest + jsdom + Testing Library
- **Linting**: ESLint + `typescript-eslint`
- **Formatting**: Prettier (config in `.prettierr`)

## Build Targets

`pnpm build` produces **two** artifacts:

| Target      | Config                  | Output         | Purpose                                  |
| ----------- | ----------------------- | -------------- | ---------------------------------------- |
| NPM library | `vite.lib.config.ts`    | `dist/lib/`    | ESM + UMD bundle of `Pixedi`             |
| UMD widget  | `vite.widget.config.ts` | `dist/widget/` | Standalone `pixedi-widget.js` CDN bundle |

Run the full build with:

```bash
pnpm build
```

Widget CDN URLs (available after `pnpm publish`):

- `https://unpkg.com/pixedi/dist/widget/pixedi-widget.js`
- `https://cdn.jsdelivr.net/npm/pixedi/dist/widget/pixedi-widget.js`

## Source Organization

```
src/
  app/          # Local dev SPA — routing, providers, global styles (not published)
  features/     # Local dev pages (not published)
  shared/       # Reusable code
    components/ # Pixedi (published), plus demo-only components (Header, ImageCard, Modal)
    config/     # Dev SPA config/constants (not published)
  main.tsx      # Dev SPA entry point (not published)
  widget.tsx    # UMD widget entry point (mounts Pixedi into shadow DOM)
  test/setup.ts # Vitest setup (mocks canvas/ImageBitmap APIs)
```

Import alias `@/` maps to `src/`.

## Common Commands

```bash
pnpm dev              # Start dev SPA on port 3000 (local development only)
pnpm build            # Build widget + npm library (two targets)
pnpm build:widget     # Build UMD widget only
pnpm build:lib        # Build NPM library + declaration files
pnpm test             # Run Vitest once
pnpm test:watch       # Run Vitest in watch mode
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript check (lib source only)
pnpm storybook        # Run Storybook dev server on port 6006
```

## Important Conventions

- **Always use `pnpm`**, not `npm` or `yarn`. A `pnpm-lock.yaml` is present.
- **Use TypeScript `type` aliases only; do not declare `interface`s.**
- **Do not use `forwardRef`.** React 19 passes `ref` as a plain prop — add `ref?: Ref<Handle>` directly to the component's `type` and call `useImperativeHandle` as normal.
- **React and `react-dom` are `peerDependencies`** in the library build. Do not bundle them into `dist/lib`.
- **Widget CSS is injected by JS** using `vite-plugin-css-injected-by-js` so the UMD bundle is self-contained.
- **The widget mounts into a Shadow DOM** and exposes `window.PixediWidget`.
- **Type declarations** for the library are emitted to `dist/lib/index.d.ts` from `tsconfig.lib.json`.
- **Test environment mocks canvas APIs** because jsdom does not support `HTMLCanvasElement` rendering.

## CI / CD

`.github/workflows/deploy.yml` runs on every push to `main` and on version tags:

1. Install dependencies (`pnpm install --frozen-lockfile`)
2. Lint, type-check, test
3. Build widget + library and upload `dist/` as artifact
4. **On version tag only:** publish to npm (`README.npm.md` is used as the package README)

**No web-app deployment happens from this repo.** The demo web application lives in a separate private repository with its own CI/CD pipeline.

## Things to Avoid

- Do not add React or ReactDOM as hard (non-peer) dependencies in the published library.
- Do not add `react-router` or any other dev-SPA dependency to `dependencies` — it must stay in `devDependencies`.
- Do not change the `outDir` of individual builds without updating `package.json#files`.
- Do not import from `src/app/`, `src/features/`, or `src/main.tsx` inside `src/shared/components/Pixedi` — it is the reusable core.
- Do not add a Cloudflare Pages / `wrangler` deploy step to the CI pipeline. Web-app deployment is the responsibility of the separate web-app repo.
