# pixedi

A lightweight, embeddable React image editor component.

`pixedi` provides a ready-to-use image editing UI with cropping, resizing, filters, horizontal/vertical flip, undo/redo, and social-media presets. It is built for React applications.

## Features

- Crop with free or fixed-ratio selection
- Resize by exact pixel dimensions
- Horizontal and vertical flip
- Image filters (brightness, contrast, saturation, etc.)
- Undo/redo history
- Social-media size presets (Facebook, Instagram, LinkedIn)
- React component
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
| `image`    | `string`                                           | URL or base64 data URI of the image to edit.                                                  |
| `onSave`   | `(image: Blob \| string) => void \| Promise<void>` | Called when the user clicks Save. Receives the edited image as a `Blob` or a base64 data URI. |
| `onBack`   | `() => void`                                       | Called when the user clicks Back/Cancel.                                                      |
| `settings` | `Settings`                                         | Optional editor settings (see below).                                                         |

### Settings

| Setting      | Type                 | Default  | Description                                                                                     |
| ------------ | -------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `quality`    | `number`             | `0.85`   | Output compression quality (`0`–`1`) for JPEG/WebP.                                             |
| `saveAsWEBP` | `boolean`            | `false`  | Encode the final image as WebP.                                                                 |
| `exportAs`   | `"blob" \| "base64"` | `"blob"` | Pass the result to `onSave` as a `Blob` or as a base64 data URI (`data:<mimeType>;base64,...`). |

## Widget CDN

For non-React environments, use the standalone UMD widget from a CDN. See [`README.widget.md`](https://github.com/rastiv/pixedi/blob/main/README.widget.md) for full usage instructions, API reference, and examples.

Pin to a specific version in production:

```html
<script src="https://cdn.jsdelivr.net/npm/pixedi@1.0.6/dist/widget/pixedi-widget.js"></script>
```

For the latest version (use only for testing):

```html
<script src="https://cdn.jsdelivr.net/npm/pixedi/dist/widget/pixedi-widget.js"></script>
```

## TypeScript

TypeScript declarations are included under `dist/lib/index.d.ts`. No additional `@types` package is required.

## License

MIT
