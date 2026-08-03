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

    const originalBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Original FileReader failed"));
      reader.readAsDataURL(blob);
    });

    const bitmap = await createImageBitmap(blob);
    const originalWidth = bitmap.width;
    const originalHeight = bitmap.height;

    const canvas = new OffscreenCanvas(originalWidth, originalHeight);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    ctx.drawImage(bitmap, 0, 0);
    const q = getQuality(originalSize);
    console.log("quality", q);
    const webpBlob = await canvas.convertToBlob({
      type: "image/webp",
      quality: q,
    });

    const reducedBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Reduced FileReader failed"));
      reader.readAsDataURL(webpBlob);
    });

    const reducedSize = reducedBase64.length;
    console.log("reducedSize", reducedSize);
    console.log("originalSize", originalSize);

    self.postMessage({
      success: true,
      originalMime,
      originalWidth,
      originalHeight,
      originalBase64,
      originalSize,
      reducedBase64,
      reducedSize,
    });
  } catch (error) {
    self.postMessage({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An error occurred during worker execution.",
    });
  }
};

const getQuality = (size: number) => {
  const MB = 1024 * 1024;
  if (size < 0.5 * MB) return 0.9; // < 0.5MB
  if (size < 1 * MB) return 0.8; // < 1MB
  if (size < 2 * MB) return 0.7; // < 2MB
  if (size < 3 * MB) return 0.6; // < 3MB
  if (size < 4 * MB) return 0.5; // < 4MB
  if (size < 5 * MB) return 0.4; // < 5MB
  if (size < 6 * MB) return 0.3; // < 6MB
  if (size < 7 * MB) return 0.2; // < 7MB
  if (size < 8 * MB) return 0.1; // < 8MB
  if (size < 9 * MB) return 0.075; // < 9MB
  return 0.05; // >= 9MB
};
