export async function imageProcessor(base64: string) {
  const parseBase64 = (base64Str: string) => {
    const match = base64Str.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
    if (!match) {
      throw new Error("Invalid Base64 image format");
    }
    let mimeType = match[1];
    const rawData = match[2];
    if (mimeType === "image/gif") {
      mimeType = "image/png";
    }
    return { mimeType, rawData };
  };

  const getBitmap = async (base64Str: string) => {
    const { mimeType, rawData } = parseBase64(base64Str);
    const binaryStr = atob(rawData);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    const bitmap = await createImageBitmap(blob);
    return { bitmap, mimeType };
  };

  const { bitmap, mimeType } = await getBitmap(base64);
  const canvas = document.createElement("canvas");
  const requiresAlpha = mimeType === "image/png" || mimeType === "image/webp";
  const ctx = canvas.getContext("2d", { alpha: requiresAlpha });

  // Start from the full image so every operation is optional and composable
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  ctx?.drawImage(bitmap, 0, 0);
  // the canvas is the only source from here on, so the bitmap can be released
  bitmap.close();

  // Copy of the current canvas, so it can be redrawn transformed into itself
  const snapshot = () => {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext("2d")?.drawImage(canvas, 0, 0);
    return tempCanvas;
  };

  const crop = (x: number, y: number, w: number, h: number) => {
    if (!ctx) return;

    const tempCanvas = snapshot();

    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(tempCanvas, x, y, w, h, 0, 0, w, h);
  };

  const flip = (horizontal: boolean, vertical: boolean) => {
    if (!ctx) return;

    const tempCanvas = snapshot();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    ctx.translate(horizontal ? canvas.width : 0, vertical ? canvas.height : 0);

    ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);

    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();
  };

  const rotate = (angle: number) => {
    if (!ctx) return;

    const tempCanvas = snapshot();

    const rad = (angle * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));

    // Bounding box of the rotated source
    canvas.width = Math.round(tempCanvas.width * cos + tempCanvas.height * sin);
    canvas.height = Math.round(
      tempCanvas.width * sin + tempCanvas.height * cos,
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2);
    ctx.restore();
  };

  const resize = (width: number, height: number) => {
    if (!ctx) return;

    const tempCanvas = snapshot();

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(tempCanvas, 0, 0, width, height);
  };

  const get = (quality: number = 0.85): string => {
    if (mimeType === "image/jpeg" || mimeType === "image/webp") {
      return canvas.toDataURL(mimeType, quality);
    }
    // PNG format does not support quality parameter
    return canvas.toDataURL("image/png");
  };

  return {
    crop,
    flip,
    rotate,
    resize,
    get,
  };
}
