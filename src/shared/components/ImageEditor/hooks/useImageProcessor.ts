import { useCallback, useRef } from "react";

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
}

export const useImageProcessor = (): ImageProcessor => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const parseBase64 = useCallback((base64Str: string) => {
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
  }, []);

  const getBitmap = useCallback(
    async (
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
    },
    [parseBase64],
  );

  const getContext = useCallback((mimeType: string) => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;

    // Enable alpha channel for formats that support transparency
    const requiresAlpha = mimeType === "image/png" || mimeType === "image/webp";
    const ctx = canvas.getContext("2d", { alpha: requiresAlpha });

    return { canvas, ctx };
  }, []);

  const finalizeCanvas = useCallback(
    (canvas: HTMLCanvasElement, mimeType: string): string => {
      // PNG format does not support quality parameter
      if (mimeType === "image/jpeg" || mimeType === "image/webp") {
        return canvas.toDataURL(mimeType, 0.85);
      }
      return canvas.toDataURL(mimeType); // for PNG
    },
    [],
  );

  // 1. RESIZE
  const resize = useCallback(
    async (
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
      return finalizeCanvas(canvas, mimeType);
    },
    [getBitmap, getContext, finalizeCanvas],
  );

  // 2. CROP
  const crop = useCallback(
    async (
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
      return finalizeCanvas(canvas, mimeType);
    },
    [getBitmap, getContext, finalizeCanvas],
  );

  // 3. FLIP
  const flip = useCallback(
    async (
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
      return finalizeCanvas(canvas, mimeType);
    },
    [getBitmap, getContext, finalizeCanvas],
  );

  // 4. Rotate
  const rotate = useCallback(
    async (base64Str: string, angle: number): Promise<string> => {
      const { bitmap, mimeType } = await getBitmap(base64Str);
      const { canvas, ctx } = getContext(mimeType);

      canvas.width = bitmap.width;
      canvas.height = bitmap.height;

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(bitmap.width / 2, bitmap.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
        ctx.restore();
      }

      bitmap.close();
      return finalizeCanvas(canvas, mimeType);
    },
    [getBitmap, getContext, finalizeCanvas],
  );

  // 5. Filter
  const filter = useCallback(
    async (
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
      return finalizeCanvas(canvas, mimeType);
    },
    [getBitmap, getContext, finalizeCanvas],
  );

  return {
    resize,
    crop,
    flip,
    rotate,
    filter,
  };
};
