# Pixedi Widget

A standalone, embeddable image editor widget for non-React environments.

The widget is distributed as a UMD bundle and can be loaded directly from a CDN in any HTML page.

## CDN

Pin to a specific version in production:

```html
<script src="https://cdn.jsdelivr.net/npm/pixedi@1.0.6/dist/widget/pixedi-widget.js"></script>
```

For testing only, use the latest version:

```html
<script src="https://cdn.jsdelivr.net/npm/pixedi/dist/widget/pixedi-widget.js"></script>
```

## Usage

Add a container element with an `id`, then initialize the widget after the script loads:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Pixedi Widget Example</title>
  </head>
  <body>
    <div id="editor"></div>

    <script src="https://cdn.jsdelivr.net/npm/pixedi@1.0.6/dist/widget/pixedi-widget.js"></script>
    <script>
      const widget = window.ImageEditorWidget.init({
        containerId: "editor",
        image: "https://example.com/photo.jpg",
        onSave: (base64) => {
          console.log("Saved image:", base64);
        },
        onBack: () => {
          console.log("User cancelled");
        },
        theme: "light", // "light" or "dark"
      });
    </script>
  </body>
</html>
```

## API

### `window.ImageEditorWidget.init(options)`

Mounts the image editor into the container.

| Option        | Type                       | Required | Description                                  |
| ------------- | -------------------------- | -------- | -------------------------------------------- |
| `containerId` | `string`                   | Yes      | The `id` of the DOM element to mount into.   |
| `image`       | `string`                   | Yes      | URL or base64 data URI of the image to edit. |
| `onSave`      | `(base64: string) => void` | Yes      | Called when the user clicks Save.            |
| `onBack`      | `() => void`               | Yes      | Called when the user clicks Back/Cancel.     |
| `theme`       | `"light" \| "dark"`        | No       | Widget theme. Defaults to `"light"`.         |

Returns an instance with a `destroy` method, or `undefined` if the container is not found.

### `instance.destroy()`

Unmounts the widget and cleans up the DOM:

```javascript
const widget = window.ImageEditorWidget.init({/* ... */});

// Later, when you want to remove the editor
widget?.destroy();
```

## Theming

Set the `theme` option to `"light"` or `"dark"`. The widget uses the container's `data-theme` attribute, so you can also style the surrounding page accordingly.

## Versioning

Widget versions match the `pixedi` npm package versions. To use a specific version, pin the URL:

```text
https://cdn.jsdelivr.net/npm/pixedi@<version>/dist/widget/pixedi-widget.js
```

Replace `<version>` with the exact version you want, for example `1.0.6`.

## License

MIT
