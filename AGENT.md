# Pixedi — AI Agent Instructions

## Project Overview

Pixedi is a lightweight, embeddable React image editor component. It ships as:

1. **React component library** — published to npm as `pixedi`.
2. **Standalone UMD widget** — embeddable via CDN for non-React environments.
3. **Demo SPA** — deployed to Cloudflare Pages and used for development.

The core component lives in `src/shared/components/ImageEditor`.

## Tech Stack

- **Framework**: React 19 + TypeScript 6
- **Bundler**: Vite 8
- **Package Manager**: pnpm 11.17.0 (`packageManager` field is authoritative)
- **Router**: `react-router` v8
- **Testing**: Vitest + jsdom + Testing Library
- **Linting**: ESLint + `typescript-eslint`
- **Formatting**: Prettier (config in `.prettierr`)
- **Deploy**: Cloudflare Pages (`wrangler.json`)

## Build Targets

The repo produces three separate artifacts. Use the correct config for each:

| Target | Config | Output | Purpose |
|--------|--------|--------|---------|
| Demo SPA | `vite.config.ts` | `dist/` | Local dev (`pnpm dev`) and Cloudflare Pages deploy |
| NPM library | `vite.lib.config.ts` | `dist/lib/` | ESM + UMD bundle of `ImageEditor` |
| UMD widget | `vite.widget.config.ts` | `dist/widget/` | Standalone `pixedi-widget.js` CDN bundle |

Run the full unified build with:

```bash
pnpm build
```

## Source Organization

```
src/
  app/          # Demo SPA entry, routing, providers, global styles
  features/     # Page-level/demo features (e.g. gallery)
  shared/       # Reusable code
    components/ # ImageEditor, ImageCard, ui primitives
    config/     # Shared config/constants
    features/   # Cross-cutting feature slices
    hooks/      # Reusable hooks
    types/      # Shared TypeScript types
  main.tsx      # SPA entry point
  widget.tsx    # UMD widget entry point (mounts ImageEditor into shadow DOM)
  test/setup.ts # Vitest setup (mocks canvas/ImageBitmap APIs)
```

Import alias `@/` maps to `src/`.

## Common Commands

```bash
pnpm dev              # Start demo SPA dev server on port 3000
pnpm build            # Build all three targets (app + widget + lib)
pnpm build:app        # Build demo SPA only
pnpm build:widget     # Build UMD widget only
pnpm build:lib        # Build NPM library + declaration files
pnpm test             # Run Vitest once
pnpm test:watch       # Run Vitest in watch mode
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript project check
pnpm storybook        # Run Storybook dev server on port 6006
```

## Important Conventions

- **Always use `pnpm`**, not `npm` or `yarn`. A `pnpm-lock.yaml` is present.
- **React and `react-dom` are `peerDependencies`** in the library build. Do not bundle them into `dist/lib`.
- **Widget CSS is injected by JS** using `vite-plugin-css-injected-by-js` so the UMD bundle is self-contained.
- **The widget mounts into a Shadow DOM** and exposes `window.ImageEditorWidget`.
- **Type declarations** for the library are emitted to `dist/lib/index.d.ts` from `tsconfig.lib.json`.
- **Test environment mocks canvas APIs** because jsdom does not support `HTMLCanvasElement` rendering.

## CI / CD

`.github/workflows/deploy.yml` runs on every push to `main`:

1. Install dependencies (`pnpm install --frozen-lockfile`)
2. Lint, type-check, test
3. Build all targets and upload `dist/` as artifact
4. Deploy `dist/` to Cloudflare Pages
5. Publish `README.npm.md` as the package README to npm if the version is new

## Things to Avoid

- Do not add React or ReactDOM as hard dependencies in the published library.
- Do not change the `outDir` of individual builds without updating `package.json#files` and `wrangler.json`.
- Do not import from `src/app/` or `src/widget.tsx` inside `src/shared/components/ImageEditor` — it is the reusable core.
