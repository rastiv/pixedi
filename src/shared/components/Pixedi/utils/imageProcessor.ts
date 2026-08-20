export interface ImageProcessor {
  resize: (base64Str: string, width: number, height: number) => Promise<string>;
  crop: (
    base64Str: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => Promise<string>;
  flip: (
    base64Str: string,
    horizontal: boolean,
    vertical: boolean,
  ) => Promise<string>;
  rotate: (base64Str: string, angle: number) => Promise<string>;
  filter: (
    base64Str: string,
    filters: Record<string, number>,
  ) => Promise<string>;
  save: (base64Str: string, quality?: number) => Promise<string>;
}

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

const getBitmap = async (
  base64Str: string,
): Promise<{ bitmap: ImageBitmap; mimeType: string }> => {
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

const getContext = (mimeType: string) => {
  const canvas = document.createElement("canvas");

  // Enable alpha channel for formats that support transparency
  const requiresAlpha =
    mimeType === "image/png" || mimeType === "image/webp";
  const ctx = canvas.getContext("2d", { alpha: requiresAlpha });

  return { canvas, ctx };
};

const finalizeCanvas = (
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number = 1,
): string => {
  if (mimeType === "image/jpeg" || mimeType === "image/webp") {
    return canvas.toDataURL(mimeType, quality);
  }
  // PNG format does not support quality parameter
  return canvas.toDataURL("image/png");
};

export const imageProcessor: ImageProcessor = {
  // 1. RESIZE
  resize: async (
    base64Str: string,
    width: number,
    height: number,
  ): Promise<string> => {
    const { bitmap, mimeType } = await getBitmap(base64Str);
    const { canvas, ctx } = getContext(mimeType);

    canvas.width = width;
    canvas.height = height;

    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(bitmap, 0, 0, width, height);
    }

    bitmap.close();
    return finalizeCanvas(canvas, mimeType, 0.85);
  },

  // 2. CROP
  crop: async (
    base64Str: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<string> => {
    const { bitmap, mimeType } = await getBitmap(base64Str);
    const { canvas, ctx } = getContext(mimeType);

    canvas.width = width;
    canvas.height = height;

    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(bitmap, x, y, width, height, 0, 0, width, height);
    }

    bitmap.close();
    return finalizeCanvas(canvas, mimeType, 0.85);
  },

  // 3. FLIP
  flip: async (
    base64Str: string,
    horizontal: boolean,
    vertical: boolean,
  ): Promise<string> => {
    const { bitmap, mimeType } = await getBitmap(base64Str);
    const { canvas, ctx } = getContext(mimeType);

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(
        horizontal ? bitmap.width : 0,
        vertical ? bitmap.height : 0,
      );
      ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
      ctx.drawImage(bitmap, 0, 0);
      ctx.restore();
    }

    bitmap.close();
    return finalizeCanvas(canvas, mimeType, 0.85);
  },

  // 4. ROTATE
  rotate: async (base64Str: string, angle: number): Promise<string> => {
    const { bitmap, mimeType } = await getBitmap(base64Str);
    const { canvas, ctx } = getContext(mimeType);

    const isNewRatio =
      (angle >= 90 && angle < 180) || (angle >= 270 && angle < 360);

    canvas.width = isNewRatio ? bitmap.height : bitmap.width;
    canvas.height = isNewRatio ? bitmap.width : bitmap.height;

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
      ctx.restore();
    }

    bitmap.close();
    const introducesTransparency = angle % 90 !== 0;
    return finalizeCanvas(
      canvas,
      introducesTransparency ? "image/webp" : mimeType,
      introducesTransparency ? 0.85 : undefined,
    );
  },

  // 5. FILTER
  filter: async (
    base64Str: string,
    filters: Record<string, number>,
  ): Promise<string> => {
    const { bitmap, mimeType } = await getBitmap(base64Str);
    const { canvas, ctx } = getContext(mimeType);

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    if (ctx) {
      const filterString = Object.entries(filters)
        .map(([name, value]) => `${name}(${value}%)`)
        .join(" ");
      ctx.filter = filterString;
      ctx.drawImage(bitmap, 0, 0);
    }

    bitmap.close();
    return finalizeCanvas(canvas, mimeType, 0.85);
  },

  // SAVE IMAGE
  save: async (base64Str: string, quality: number = 0.85): Promise<string> => {
    const { bitmap, mimeType } = await getBitmap(base64Str);
    const { canvas, ctx } = getContext(mimeType);

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    if (ctx) {
      ctx.drawImage(bitmap, 0, 0);
    }

    bitmap.close();
    return finalizeCanvas(canvas, mimeType, quality);
  },
};
