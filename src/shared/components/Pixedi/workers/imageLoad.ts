self.onmessage = async (e: MessageEvent<string>) => {
  let src = e.data.trim();
  let fallbackMime = "";

  try {
    if (
      !src.startsWith("http://") &&
      !src.startsWith("https://") &&
      !src.startsWith("data:")
    ) {
      fallbackMime = "image/png";
      src = `data:${fallbackMime};base64,${src}`;
    }

    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const blob = await response.blob();

    const originalSize = blob.size;
    const originalMime = blob.type || fallbackMime || "image/unknown";

    const bitmap = await createImageBitmap(blob);
    const originalWidth = bitmap.width;
    const originalHeight = bitmap.height;

    const canvas = new OffscreenCanvas(originalWidth, originalHeight);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.drawImage(bitmap, 0, 0);

    const webpBlob = await canvas.convertToBlob({
      type: "image/webp",
      quality: getQuality(originalSize),
    });

    const reducedBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Reduced FileReader failed"));
      reader.readAsDataURL(webpBlob);
    });

    const reducedSize = reducedBase64.length;

    const isAlpha = hasAlphaChannel(bitmap);

    self.postMessage({
      success: true,
      originalMime,
      originalWidth,
      originalHeight,
      originalBlob: blob,
      originalSize,
      reducedBase64,
      reducedSize,
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

const getQuality = (size: number) => {
  const MB = 1024 * 1024;
  if (size < 1 * MB) return 0.85; // < 1MB
  if (size < 2 * MB) return 0.75; // < 2MB
  if (size < 3 * MB) return 0.65; // < 3MB
  if (size < 4 * MB) return 0.55; // < 4MB
  if (size < 5 * MB) return 0.45; // < 5MB
  if (size < 6 * MB) return 0.35; // < 6MB
  return 0.25; // >= 5MB
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
