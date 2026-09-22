# pixedi widget

A standalone UMD build of the Pixedi image editor for non-React environments. It mounts into a Shadow DOM, so its styles are fully isolated from the host page.

## Installation

Pin to a specific version in production:

```html
<script src="https://cdn.jsdelivr.net/npm/pixedi@1.3.0/dist/widget/pixedi-widget.js"></script>
```

For the latest version (use only for testing):

```html
<script src="https://cdn.jsdelivr.net/npm/pixedi/dist/widget/pixedi-widget.js"></script>
```

The script exposes `window.PixediWidget`.

## Usage

```html
<div id="editor" style="width: 100%; height: 600px"></div>

<script>
  const widget = PixediWidget.init({
    containerId: "editor",
    image: "https://example.com/photo.jpg",
    theme: "light",
    onSave: async (image) => {
      // image is a Blob by default, or a base64 data URI when
      // settings.exportAs is "base64"
      console.log(image);
    },
    onBack: () => {
      console.log("User cancelled editing");
    },
  });
</script>
```

## `PixediWidget.init(options)`

Creates the editor inside the element with the given `containerId`. Only one widget can be active at a time — calling `init` again destroys the previous instance. Returns a widget instance, or `undefined` if the container is not found or a shadow root cannot be attached.

### Options

| Option        | Type                                               | Description                                                                                   |
| ------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `containerId` | `string`                                           | ID of the element to mount the editor into. Required.                                         |
| `image`       | `string \| Blob`                                   | URL, base64 data URI, or `Blob` of the image to edit. Required.                               |
| `onSave`      | `(image: Blob \| string) => void \| Promise<void>` | Called when the user clicks Save. Receives the edited image as a `Blob` or a base64 data URI. |
| `onBack`      | `() => void`                                       | Called when the user clicks Back/Cancel.                                                      |
| `theme`       | `"light" \| "dark"`                                | UI color theme. Defaults to `"light"`.                                                        |
| `settings`    | `Settings`                                         | Optional editor settings — same shape as the React component's `settings` prop.               |

### `Settings`

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

```js
PixediWidget.init({
  containerId: "editor",
  image: "https://example.com/photo.jpg",
  onSave: async (image) => console.log(image),
  onBack: () => console.log("User cancelled editing"),
  settings: { tools: ["crop"] },
});
```

In this mode the tool's own buttons drive the flow:

- **Close** (red ✕) calls `onBack` immediately.
- **Save** (green ✓) applies the change, encodes the image and calls `onSave` with the result. While saving, the check icon is replaced by a spinner and both buttons are disabled.

After a successful save the editor stays mounted and reopens the tool on the newly produced image.

## Widget instance

`init` returns an object with two methods:

| Method            | Description                                                         |
| ----------------- | ------------------------------------------------------------------- |
| `setTheme(theme)` | Switches the UI theme (`"light"` or `"dark"`) without losing edits. |
| `destroy()`       | Unmounts the editor and removes its styles.                         |

### `setTheme(theme)`

Re-renders the editor with a new theme. Because the widget lives in a Shadow DOM, it does not inherit `data-theme` or classes from the host page — call `setTheme` to keep it in sync with your app's theme.

Example — follow a `data-theme` attribute on `<html>`:

```js
const widget = PixediWidget.init({
  containerId: "editor",
  image: photo,
  onSave,
  onBack,
});

new MutationObserver(() => {
  widget.setTheme(
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );
}).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme"],
});
```

`setTheme` preserves the current editing state (crop, filters, undo history). Calling it after `destroy()` or after a newer `init()` is a safe no-op.

## License

MIT
