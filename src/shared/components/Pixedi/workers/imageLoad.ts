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

    const originalMime = blob.type || fallbackMime || "image/unknown";

    const bitmap = await createImageBitmap(blob);
    const originalWidth = bitmap.width;
    const originalHeight = bitmap.height;

    const previewBlob = await createPreviewBlob(bitmap);

    const isAlpha = hasAlphaChannel(bitmap);
    bitmap.close();

    self.postMessage({
      success: true,
      originalMime,
      originalWidth,
      originalHeight,
      originalBlob: blob,
      previewBlob,
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

const PREVIEW_MAX_DIMENSION = 1920;
const PREVIEW_QUALITY = 0.85;

const createPreviewBlob = async (bitmap: ImageBitmap): Promise<Blob> => {
  const { width, height } = bitmap;
  const scale = Math.min(1, PREVIEW_MAX_DIMENSION / Math.max(width, height));
  const previewWidth = Math.round(width * scale);
  const previewHeight = Math.round(height * scale);

  const canvas = new OffscreenCanvas(previewWidth, previewHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2D context for preview canvas");
  ctx.drawImage(bitmap, 0, 0, previewWidth, previewHeight);

  return canvas.convertToBlob({
    type: "image/webp",
    quality: PREVIEW_QUALITY,
  });
};

function hasAlphaChannel(bitmap: ImageBitmap): boolean {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to create 2D context for canvas.");
  }
  ctx.drawImage(bitmap, 0, 0);

  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        return true;
      }
    }
    return false;
  } catch (error) {
    throw new Error(`Error reading pixels: ${error}`, { cause: error });
  }
}
