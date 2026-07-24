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
import { ImageEditor } from "pixedi";
```

### Usage

```tsx
import { ImageEditor } from "pixedi";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ImageEditor
        image="https://example.com/photo.jpg"
        onSave={async (base64) => {
          // Upload or persist the edited image
          console.log(base64);
        }}
        onBack={() => {
          // Handle back/cancel action
          console.log("User cancelled editing");
        }}
      />
    </div>
  );
}
```

### Props

| Prop     | Type                          | Description                                                            |
| -------- | ----------------------------- | ---------------------------------------------------------------------- |
| `image`  | `string`                      | URL or base64 data URI of the image to edit.                             |
| `onSave` | `(base64: string) => void \| Promise<void>` | Called when the user clicks Save. Receives the edited image as base64.   |
| `onBack` | `() => void`                  | Called when the user clicks Back/Cancel.                                 |

## TypeScript

TypeScript declarations are included under `dist/lib/index.d.ts`. No additional `@types` package is required.

## License

MIT
