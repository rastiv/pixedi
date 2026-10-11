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
pnpm build-storybook  # Build a static Storybook
```

Before finishing a change, run `pnpm lint`, `pnpm type-check`, `pnpm test` and `pnpm build`. `prettier --check` reports every file on Windows because of CRLF line endings; that is not a real formatting issue.

## Important Conventions

- **Always use `pnpm`**, not `npm` or `yarn`. A `pnpm-lock.yaml` is present.
- **Use TypeScript `type` aliases only; do not declare `interface`s.**
- **Do not use `forwardRef`.** React 19 passes `ref` as a plain prop — add `ref?: Ref<Handle>` directly to the component's `type` and call `useImperativeHandle` as normal.
- **React and `react-dom` are `peerDependencies`** in the library build. Do not bundle them into `dist/lib`.
- **Widget CSS is injected by JS** using `vite-plugin-css-injected-by-js` so the UMD bundle is self-contained.
- **The widget mounts into a Shadow DOM** and exposes `window.PixediWidget`.
- **Type declarations** for the library are emitted to `dist/lib/index.d.ts` from `tsconfig.lib.json`.
- **Test environment mocks canvas APIs** because jsdom does not support `HTMLCanvasElement` rendering.
- **UI strings are customizable** via the `translations` prop (`Record<string, string>`); English defaults live in `src/shared/components/Pixedi/constants/translations.ts` and consumer overrides are merged shallowly in `Pixedi.tsx`.
- **Tool hooks commit through `useToolCommit`** (`hooks/useToolCommit.tsx`): it adds the item to the history, or saves directly in single-tool mode (`settings.tools` has exactly one entry). The header Save runs `useImageSaving`, which processes the whole history.
- **Keep component logic in a sibling hook** (e.g. `OrbitalSelector.tsx` + `useOrbitalSelector.tsx`, `CropBox` + `useCropInteraction`); components stay mostly markup.

## Geometry Model

All edits are history items; pixels only change on Save. `utils/preview.ts` folds a history segment (split at committed shapes, which bake their mask) into one geometry:

- `region` — the source area in play (`cx`, `cy`, `w`, `h`, `angle`, in source pixels); tilted only after a crop on a rotated view.
- `beta` + `scale` — layer rotation and the cover zoom that keeps the rotated region filling the frame. The frame follows the nearest quarter turn (`isSwapped`), so it swaps axes past 45°.
- `flipX` / `flipY` — flips in **view** space, applied outside the rotation.
- `degrees` — the absolute angle the user sees; ROTATE items store absolute degrees and stay editable.

The preview (`preview/Preview.tsx`: flip layer → rotate/zoom layer → image) and the canvas (`imageProcessor.transform`, one `drawImage`) both render from this geometry. `getActions` emits `transform` + `resize` + `shape` steps (filters are applied once, globally). Use `getRotatedSizes` for the stored sizes of a rotation, and keep the "crop continuity" / canvas-matrix tests in `utils/preview.test.ts` and `utils/imageProcessor.test.ts` passing when touching this code. The preview shows each angle at its equivalent closest to the current one (`closestTurn`), so CSS never spins through full turns.

## Pointer Interactions

- Use **Pointer Events + `setPointerCapture`** on the pressed element for drags (crop box, surface tool, filter compare, orbital dial) — not `document`/`window` mouse/touch listeners. Track the active `pointerId` and ignore other pointers; only start on `e.button === 0`.
- **Do not `preventDefault()` on `pointerdown`** — it suppresses the compatibility `mousedown` that click-outside listeners (`useSelect`, `useSelectIcon`) rely on. Use `touch-action: none` and `user-select: none` on the handle instead.
- `window` listeners remain correct for gestures that don't start on an element (wheel / pinch zoom in `useResize`).
- jsdom has no pointer capture: tests stub `Element.prototype.setPointerCapture` / `hasPointerCapture` / `releasePointerCapture` (see `SurfaceTool.test.tsx`).

## CI / CD

`.github/workflows/deploy.yml` runs **only on version tags** (`v*.*.*`):

1. Install dependencies (`pnpm install --frozen-lockfile`)
2. Lint, type-check, test
3. Build widget + library and upload `dist/` as artifact
4. Publish to npm, skipped if the version already exists (`README.npm.md` is copied over `README.md` as the package README)

Keep the pinned CDN version in `README.npm.md` and `README.widget.md` in sync with `package.json#version` when releasing.

**No web-app deployment happens from this repo.** The demo web application lives in a separate private repository with its own CI/CD pipeline.

## Things to Avoid

- Do not add React or ReactDOM as hard (non-peer) dependencies in the published library.
- Do not add `react-router` or any other dev-SPA dependency to `dependencies` — it must stay in `devDependencies`.
- Do not change the `outDir` of individual builds without updating `package.json#files`.
- Do not import from `src/app/`, `src/features/`, or `src/main.tsx` inside `src/shared/components/Pixedi` — it is the reusable core.
- Do not add a Cloudflare Pages / `wrangler` deploy step to the CI pipeline. Web-app deployment is the responsibility of the separate web-app repo.
- Do not reintroduce separate crop/flip/rotate processor steps or quarter-turn-only math; all geometry goes through the region model and the single `transform` step.
