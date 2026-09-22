# pixedi

A lightweight, embeddable React image editor component.

`pixedi` provides a ready-to-use image editing UI with cropping, resizing, image adjustments, predefined artistic filters, horizontal/vertical flip, rotation, undo/redo, and social-media size presets. It is built for React applications.

## Features

- Crop with free or fixed-ratio selection
- Resize by exact pixel dimensions
- Horizontal and vertical flip
- Rotation
- **Image filters** — two modes (see [Filters](#filters) below)
- Undo/redo history
- Social-media size presets (Facebook, Instagram, LinkedIn)
- Single-tool mode — a minimal editor when only one tool is enabled (see [Single-tool mode](#single-tool-mode))
- React component and standalone UMD widget
- TypeScript declarations included

## Installation

```bash
npm install pixedi
# or
pnpm add pixedi
# or
yarn add pixedi
```

`pixedi` requires the following peer dependencies:

```bash
npm install react react-dom
```

## React Component

### Import

```tsx
import { Pixedi } from "pixedi";
```

### Usage

```tsx
import { Pixedi } from "pixedi";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Pixedi
        image="https://example.com/photo.jpg"
        onSave={async (image) => {
          // image is a Blob by default, or a base64 data URI when
          // settings.exportAs is "base64"
          console.log(image);
        }}
        onBack={() => {
          // Handle back/cancel action
          console.log("User cancelled editing");
        }}
      />
    </div>
  );
}

function AppBase64() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Pixedi
        image="https://example.com/photo.jpg"
        onSave={async (base64) => {
          // Receives a base64 data URI: data:image/webp;base64,...
          console.log(base64);
        }}
        onBack={() => {
          console.log("User cancelled editing");
        }}
        settings={{
          exportAs: "base64",
        }}
      />
    </div>
  );
}
```

### Props

| Prop       | Type                                               | Description                                                                                   |
| ---------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `image`    | `string \| Blob`                                   | URL, base64 data URI, or `Blob` of the image to edit.                                         |
| `onSave`   | `(image: Blob \| string) => void \| Promise<void>` | Called when the user clicks Save. Receives the edited image as a `Blob` or a base64 data URI. |
| `onBack`   | `() => void`                                       | Called when the user clicks Back/Cancel.                                                      |
| `theme`    | `"light" \| "dark"`                                | UI color theme. Defaults to `"light"`.                                                        |
| `settings` | `Settings`                                         | Optional editor settings (see below).                                                         |

### Settings

| Setting      | Type                                                                           | Default                                                    | Description                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `tools`      | `Array<"resize" \| "crop" \| "presetCrop" \| "flip" \| "rotate" \| "filters">` | `["resize","crop","presetCrop","flip","rotate","filters"]` | Tools to show in the sidebar. A single tool switches to [single-tool mode](#single-tool-mode). Use an empty array to disable editing. |
| `infobar`    | `boolean`                                                                      | `true`                                                     | Show the image info panel below the canvas.                                                                                           |
| `quality`    | `number`                                                                       | `0.85`                                                     | Output compression quality (`0`–`1`) for JPEG/WebP.                                                                                   |
| `saveAsWEBP` | `boolean`                                                                      | `false`                                                    | Encode the final image as WebP.                                                                                                       |
| `exportAs`   | `"blob" \| "base64"`                                                           | `"blob"`                                                   | Pass the result to `onSave` as a `Blob` or as a base64 data URI (`data:<mimeType>;base64,...`).                                       |
| `background` | `"circled" \| "diagonals" \| "rhombus"`                                        | —                                                          | Apply a decorative pattern to the editor frame background.                                                                            |

## Single-tool mode

Passing exactly one entry in `settings.tools` renders a minimal editor: no header, sidebar or infobar — just the image with that tool already open.

```tsx
<Pixedi
  image="https://example.com/photo.jpg"
  onSave={async (image) => console.log(image)}
  onBack={() => console.log("User cancelled editing")}
  settings={{ tools: ["crop"] }}
/>
```

In this mode the tool's own buttons drive the flow:

- **Close** (red ✕) calls `onBack` immediately.
- **Save** (green ✓) applies the change, encodes the image and calls `onSave` with the result. While saving, the check icon is replaced by a spinner and both buttons are disabled.

After a successful save the editor stays mounted and reopens the tool on the newly produced image, so the user can keep editing or close.

## Filters

The Filters tool offers two modes, switchable via the toolbar toggle. Filter state is preserved in undo/redo history and baked into the image on save.

### CSS adjustments

Slider-based adjustments applied via CSS `filter`. Each slider affects only that property; the rest stay at their defaults.

| Filter     | Range  | Default |
| ---------- | ------ | ------- |
| Saturate   | 0–200% | 100%    |
| Grayscale  | 0–100% | 0%      |
| Sepia      | 0–100% | 0%      |
| Invert     | 0–100% | 0%      |
| Hue-Rotate | 0–360° | 0°      |
| Brightness | 0–200% | 100%    |
| Contrast   | 0–200% | 100%    |

### Predefined artistic filters

SVG-based filters selected from a dropdown. Each is a non-destructive preset applied as a single named filter.

| Filter           | Description                                     |
| ---------------- | ----------------------------------------------- |
| Vintage          | Warm reddish tint with boosted reds             |
| Olive Army       | Desaturated olive-green tone                    |
| Warm Sunset      | Boosted reds and oranges, reduced blues         |
| Sin City Red     | High-contrast red channel, grey everything else |
| Emboss Effect    | Edge emboss with greyscale conversion           |
| CRT Monitor      | Scanline overlay simulating a CRT screen        |
| Grain / Noise    | Film-grain texture via fractal noise            |
| Cross-Processing | Shifted colour curves for a lo-fi look          |
| X-Ray            | Inverted luminance, blue-green hue              |
| Plastic Wrap     | Specular highlight overlay                      |

### Compare mode

Click the Compare button in the filter toolbar to toggle a side-by-side before/after view. The original image is shown at full opacity while the comparison is active.

## Widget CDN

For non-React environments, use the standalone UMD widget from a CDN. See [`README.widget.md`](https://github.com/rastiv/pixedi/blob/main/README.widget.md) for full usage instructions, API reference, and examples.

Pin to a specific version in production:

```html
<script src="https://cdn.jsdelivr.net/npm/pixedi@1.3.0/dist/widget/pixedi-widget.js"></script>
```

For the latest version (use only for testing):

```html
<script src="https://cdn.jsdelivr.net/npm/pixedi/dist/widget/pixedi-widget.js"></script>
```

## TypeScript

TypeScript declarations are included under `dist/lib/index.d.ts`. No additional `@types` package is required.

## License

MIT
