# pixedi

A lightweight, embeddable React image editor component.

Pixedi provides a ready-to-use image editing UI with cropping, resizing, filters, horizontal/vertical flip, undo/redo, and social-media presets. It is built with React and TypeScript and ships in three forms:

1. **React component** — install from npm.
2. **Standalone UMD widget** — embed via CDN in any HTML page.
3. **Demo SPA** — try it locally or view the deployed version.

## Quick Start

This project uses [pnpm](https://pnpm.io/). Node 22 is recommended.

```bash
pnpm install
pnpm dev
```

The demo SPA starts at `http://localhost:3000`.

## Available Scripts

```bash
pnpm dev              # Start the demo SPA dev server
pnpm build            # Build all targets (app, widget, library)
pnpm build:app        # Build the demo SPA
pnpm build:widget     # Build the standalone UMD widget
pnpm build:lib        # Build the npm React component
pnpm test             # Run the test suite
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript checks
pnpm storybook        # Run Storybook locally
```

## Project Structure

```
src/
  app/          # Demo SPA: entry, routing, providers, styles
  features/     # Demo/page-level features
  shared/       # Reusable components, hooks, types, config
  main.tsx      # SPA entry point
  widget.tsx    # UMD widget entry point
```

The reusable editor component lives in `src/shared/components/ImageEditor`.

## Consumer Documentation

- **[Consumer usage](./README.npm.md)** — React component, widget CDN, API reference.

## Deployment

Pushing to `main` triggers the CI/CD pipeline in `.github/workflows/deploy.yml`:

1. Lint, type-check, and test.
2. Build all three targets.
3. Deploy the `dist/` folder to Cloudflare Pages.
4. Publish the React component to npm (if the version is new).

## Tech Stack

- React 19 + TypeScript 6
- Vite 8
- Vitest + jsdom
- ESLint + Prettier
- Cloudflare Pages

## License

MIT
