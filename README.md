# pixedi

A lightweight, embeddable React image editor component.

Pixedi provides a ready-to-use image editing UI with cropping, resizing, image adjustments, predefined artistic filters, horizontal/vertical flip, free-angle rotation, undo/redo, and social-media size presets. It is built with React and TypeScript and ships in two forms:

1. **Pixedi React component** — install from npm.
2. **Standalone UMD widget** — embed via CDN in any HTML page.

A small demo SPA (`src/app`, `src/features`) is kept in the repo for local development only; it is neither built by `pnpm build` nor published.

## Features

- **Crop** — free-form or fixed-ratio selection
- **Shape crop** — mask the image with one of 20 shapes (star, heart, circle, polygon, …), filled or outlined
- **Resize** — set exact pixel dimensions
- **Flip** — horizontal and vertical
- **Rotate** — any angle via a draggable orbital dial with 45° presets; the image zooms in to avoid empty corners, the frame swaps to portrait/landscape past 45°, and the angle stays editable after committing
- **Filters** — two modes, both preserved in undo/redo history:
  - _CSS adjustments_ — Saturate, Sepia, Invert, Hue-Rotate, Brightness, Contrast
  - _Predefined artistic_ — Vintage, Olive Army, Warm Sunset, Sin City Red, CRT Monitor, Grain/Noise, Cross-Processing, X-Ray, Vignette Shadow
  - _Compare mode_ — toggle before/after preview while adjusting
- **Undo/redo** — full history across all tools
- **Social-media presets** — Facebook, Instagram, LinkedIn crop sizes
- **Single-tool mode** — configure exactly one tool to get a minimal, header-less editor

## Quick Start

This project uses [pnpm](https://pnpm.io/). Node 22 is recommended.

```bash
pnpm install
pnpm dev
```

The demo SPA starts at `http://localhost:3000`.

## Available Scripts

```bash
pnpm dev              # Start the local demo SPA (port 3000)
pnpm build            # Build the widget and the npm library
pnpm build:widget     # Build the standalone UMD widget  -> dist/widget/
pnpm build:lib        # Build the npm React component    -> dist/lib/
pnpm test             # Run the test suite once
pnpm test:watch       # Run the test suite in watch mode
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript checks (library source)
pnpm storybook        # Run Storybook locally (port 6006)
pnpm build-storybook  # Build a static Storybook
```

## Project Structure

```
src/
  app/          # Local demo SPA: entry, routing, providers, styles (not published)
  features/     # Local demo pages (not published)
  shared/       # Reusable components, hooks, types, config
  main.tsx      # Demo SPA entry point (not published)
  widget.tsx    # UMD widget entry point (mounts into Shadow DOM)
```

The reusable editor component lives in `src/shared/components/Pixedi`.

### Geometry and rendering

Every edit is stored as a history item; nothing touches pixels until Save. `utils/preview.ts` folds the history into one geometry per segment (a committed shape bakes its mask and starts a new segment):

- **Region** — the part of the source image in play (`cx`, `cy`, `w`, `h`, `angle` in source pixels). It is axis-aligned unless a crop was made on a tilted view.
- **Rotation** — the layer angle `beta` plus a cover `scale` that zooms the rotated region so it always fills the frame. The frame follows the nearest quarter turn, so it swaps axes past 45°.
- **Flips** — applied in view space, outside the rotation, so they mirror what the user sees.

The same geometry drives both outputs:

- The **preview** (`preview/Preview.tsx`) renders it with nested CSS transforms (flip layer → rotate/zoom layer → image). Angles are shown at the equivalent closest to the current one, so CSS always animates the short way round.
- **Save** (`hooks/useImageSaving.tsx`) turns it into a single `transform` step that `utils/imageProcessor.ts` draws onto a canvas in one `drawImage`, followed by `resize`, `shape` and the global filters.

### Pointer interactions

Draggable controls (crop box and handles, the floating tool surface, the filter compare slider, the orbital dial) use Pointer Events with `setPointerCapture` on the pressed element instead of `document`/`window` listeners. This covers mouse, touch and pen with one code path and ignores secondary pointers. `pointerdown` is intentionally not `preventDefault`-ed so click-outside listeners (e.g. dropdowns) keep working; `touch-action: none` and `user-select: none` prevent scrolling and text selection instead.

### Single-tool mode

When `settings.tools` contains exactly one tool, the editor drops the header, sidebar and infobar and renders only the frame with that tool already open. The tool's own Save/Close buttons take over the header's role: Close calls `onBack`, and Save processes the image and calls `onSave` while showing a spinner in place of the check icon.

Both callbacks travel through `PixediProvider` context, so every tool hook reaches them via the shared `useToolCommit` hook (`hooks/useToolCommit.tsx`), which either commits the change to the history (multi-tool) or hands it straight to `useImageSaving` as a pending history item (single-tool).

### Filter architecture

Live filter preview is driven by an `EventTarget`-based event bus (`eventBus.ts`) shared via context. Filter tool components emit `filter-update` events; the preview image subscribes and applies the CSS `filter` string imperatively — keeping the hot path out of React state and avoiding unnecessary re-renders.

SVG filter definitions (`UrlFilters`) are rendered once in the component tree. The canvas export path (`imageProcessor.ts`) applies the same filter string via `CanvasRenderingContext2D.filter` at save time.

## Consumer Documentation

- **[Consumer usage](./README.npm.md)** — React component props and settings.
- **[Widget usage](./README.widget.md)** — standalone UMD widget: `init`, `setTheme`, `destroy`, API reference.

## Deployment

Pushing a version tag (`v*.*.*`) triggers the CI/CD pipeline in `.github/workflows/deploy.yml`:

1. Install dependencies, lint, type-check, and test.
2. Build the widget and the library, and upload `dist/` as an artifact.
3. Publish the React component to npm (skipped if the version already exists), using `README.npm.md` as the package README.

No web app is deployed from this repository.

## Tech Stack

- React 19 + TypeScript 6
- Vite 8
- Vitest + jsdom + Testing Library
- Storybook
- ESLint + Prettier

## License

MIT
