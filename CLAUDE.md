# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

Pixedi is a lightweight, embeddable React image editor. One component, `src/shared/components/Pixedi`, ships two ways:

1. **npm library** `pixedi` — ESM + UMD, React/ReactDOM as peer dependencies.
2. **UMD widget** `pixedi-widget.js` — self-contained CDN bundle for non-React pages; mounts into a Shadow DOM and exposes `window.PixediWidget.init({ containerId, image, onSave, onBack, theme, settings, translations })`.

`src/app/`, `src/features/`, `src/shared/config/`, `src/shared/components/{Header,Modal}` and `src/main.tsx` are a **local dev SPA only** — not built by `pnpm build`, not published. The public demo web app lives in a separate private repo.

## Commands

Always use **pnpm** (version pinned in `package.json#packageManager`).

```bash
pnpm dev              # dev SPA on http://localhost:3000
pnpm build            # build:widget + build:lib
pnpm build:widget     # vite.widget.config.ts -> dist/widget/pixedi-widget.js
pnpm build:lib        # vite.lib.config.ts -> dist/lib/ + tsc declarations (tsconfig.lib.json)
pnpm test             # vitest run (jsdom)
pnpm test:watch
pnpm vitest run src/shared/components/Pixedi/utils/preview.test.ts   # single file
pnpm vitest run -t "crop continuity"                                 # by test name
pnpm lint             # eslint .
pnpm type-check       # tsc -p tsconfig.lib.json --noEmit (library source only)
pnpm storybook        # Storybook on :6006 (stories live next to ui/ components)
```

Before finishing a change run `pnpm lint`, `pnpm type-check`, `pnpm test` and `pnpm build`.

Note: `pnpm type-check` covers only `src/shared/components/Pixedi` (tests and stories excluded); the dev SPA and test files are not type-checked by it.

## Stack

React 19, TypeScript 6, Vite 8 (rolldown), Vitest 4 + jsdom + Testing Library, ESLint 10 + typescript-eslint, Storybook 8, CSS Modules.

## Architecture of the component

```
Pixedi.tsx              props: image, onSave, onBack, theme, settings, translations
  useImageLoader        loads image (worker in workers/imageLoad.ts), detects mime/alpha
  PixediProvider        single useState store + EventTarget eventBus, exposed via StoreContext
    Header / Sidebar / Frame / Infobar     (single-tool mode: Frame only)
      <tool>/           crop, resize, flip, rotate, filters, preset, shapes
        <Tool>Tools.tsx + use<Tool>.tsx    markup + logic hook
      preview/          renders the current geometry with CSS layers
      ui/               design-system primitives (Button, Slider, Select, OrbitalSelector, SurfaceTool, Tooltip ...)
  utils/                preview.ts (geometry), imageProcessor.ts (canvas), crop.ts, shape.ts
```

- **State**: `provider/PixediProvider.tsx` holds history (`items` + `pointer`, undo/redo), `currentAction`, sidebar, settings, translations. Read it through `usePixediContext()`.
- **Event bus**: high-frequency interaction updates (crop rect, resize, filters, shape mask, compare slider) go through `eventBus.ts` `CustomEvent`s on the provider's `EventTarget`, not through React state. Add a typed `emitXxxUpdate` helper there for new events.
- **Committing a tool**: use `useToolCommit` (`hooks/useToolCommit.tsx`). It adds the item to history, or — in single-tool mode (`settings.tools` has exactly one entry) — saves directly via `useImageSaving`. The header Save runs `useImageSaving` over the whole history.
- **Translations**: English defaults in `constants/translations.ts`; consumer overrides are shallow-merged in `Pixedi.tsx`. Every new UI string needs a key there.
- **Tool IDs**: `ActionName` in `types.ts`; `Tools` is every action except `initial`.

### Geometry model

All edits are history items; pixels only change on Save. `utils/preview.ts` folds a history segment (split at committed shapes, which bake their mask) into one geometry:

- `region` — source area in play (`cx`, `cy`, `w`, `h`, `angle`, source pixels); tilted only after a crop on a rotated view.
- `beta` + `scale` — layer rotation and the cover zoom that keeps the rotated region filling the frame. The frame follows the nearest quarter turn (`isSwapped`), so it swaps axes past 45°.
- `flipX` / `flipY` — flips in **view** space, applied outside the rotation.
- `degrees` — absolute angle the user sees; ROTATE items store absolute degrees and stay editable.

`preview/Preview.tsx` (flip layer → rotate/zoom layer → image) and the canvas (`imageProcessor.transform`, one `drawImage`) both render from this geometry. `getActions` emits `transform` + `resize` + `shape` steps; filters are applied once, globally. Use `getRotatedSizes` for stored rotation sizes. The preview shows each angle at the equivalent closest to the current one (`closestTurn`) so CSS never spins through full turns.

When touching this code keep the "crop continuity" / canvas-matrix tests in `utils/preview.test.ts` and `utils/imageProcessor.test.ts` passing. Do **not** reintroduce separate crop/flip/rotate processor steps or quarter-turn-only math.

### Pointer interactions

- Drags use **Pointer Events + `setPointerCapture`** on the pressed element (crop box, surface tool, filter compare, orbital dial), not `document`/`window` mouse/touch listeners. Track the active `pointerId`, ignore other pointers, start only on `e.button === 0`.
- **Never `preventDefault()` on `pointerdown`** — it suppresses the compat `mousedown` that click-outside logic in `useSelect` / `useSelectIcon` depends on. Use `touch-action: none` + `user-select: none` on the handle instead.
- `window` listeners are still right for gestures not starting on an element (wheel / pinch zoom in `useResize`).

## Code conventions

- **`type` aliases only — no `interface`.**
- **No `forwardRef`** — React 19 passes `ref` as a prop: add `ref?: Ref<Handle>` to the props type and use `useImperativeHandle`.
- **Component + sibling hook**: components stay mostly markup, logic lives in `useXxx.tsx` next to it (`OrbitalSelector` + `useOrbitalSelector`, `CropBox` + `useCropInteraction`).
- **Relative imports inside `src/shared/components/Pixedi`**; the `@/` alias (→ `src/`) is used by the dev SPA and `src/widget.tsx`. Never import dev-SPA code (`src/app`, `src/features`, `src/main.tsx`, `src/shared/config`) into Pixedi.
- Styles are CSS Modules (`*.module.css`) next to the component; theming via `data-theme` on the root.
- Comments are sparse, lowercase, and explain _why_.
- Formatting: Prettier config is `.prettierrc` (single quotes, semicolons, trailing commas, `printWidth: 100`). The whole codebase is formatted with it; `pnpm-lock.yaml` is in `.prettierignore`. On Windows check with `pnpm exec prettier --check . --end-of-line auto` — without the flag every file is flagged because of CRLF checkouts.

## Testing

- Tests sit next to source as `*.test.ts(x)`; setup in `src/test/setup.ts` mocks canvas, `createImageBitmap`, `Path2D`, `ImageBitmap` (jsdom has no canvas rendering).
- jsdom has no pointer capture — stub `Element.prototype.setPointerCapture` / `hasPointerCapture` / `releasePointerCapture` as in `ui/surface-tool/SurfaceTool.test.tsx`.
- Geometry/canvas math belongs in pure `utils/*.test.ts` tests.

## Build & release rules

- React/ReactDOM stay **peerDependencies** and external in `vite.lib.config.ts`; never bundle them into `dist/lib`.
- `react-router` and anything else the dev SPA needs stays in **devDependencies**.
- Widget CSS is injected by JS (`vite-plugin-css-injected-by-js`, injected into the shadow root) so the UMD file is self-contained.
- Changing a build `outDir` requires updating `package.json#files`.
- CI (`.github/workflows/deploy.yml`) runs **only on `v*.*.*` tags**: install (`--frozen-lockfile`) → lint, type-check, test → build → npm publish (skipped if the version exists; `README.npm.md` replaces `README.md` in the package).
- On release: bump `package.json#version`, add a `# x.y.z` entry at the top of `CHANGELOG.md`, and sync the pinned CDN version in `README.npm.md` and `README.widget.md`.
- No web-app deployment from this repo — don't add Cloudflare Pages / `wrangler` steps.
