import { createPreviewBlob, hasAlphaChannel } from "../utils/crop";

self.onmessage = async (e: MessageEvent<string | Blob>) => {
  let fallbackMime = "";

  try {
    let blob: Blob;

    if (e.data instanceof Blob) {
      blob = e.data;
    } else {
      let src = e.data.trim();

      if (
        !src.startsWith("http://") &&
        !src.startsWith("https://") &&
        !src.startsWith("blob:") &&
        !src.startsWith("data:")
      ) {
        fallbackMime = "image/png";
        src = `data:${fallbackMime};base64,${src}`;
      }

      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      blob = await response.blob();
    }

    const mimeType = blob.type || fallbackMime || "image/unknown";

    const bitmap = await createImageBitmap(blob);
    const { width, height } = bitmap;

    const previewBlob = await createPreviewBlob(bitmap);

    const isAlpha = hasAlphaChannel(bitmap);
    bitmap.close();

    self.postMessage({
      success: true,
      originalBlob: blob,
      previewBlob,
      mimeType,
      width,
      height,
      isAlpha,
    });
  } catch (error) {
    self.postMessage({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An error occurred during image loader worker execution.",
    });
  }
};
