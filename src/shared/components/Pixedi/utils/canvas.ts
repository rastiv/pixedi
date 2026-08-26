type CanvasContext =
  CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export function Canvas(
  base64Str: string,
  alpha: boolean = true,
  mimeType: string = "image/webp",
) {
  let bitmap: ImageBitmap | null = null;
  let canvas: OffscreenCanvas | HTMLCanvasElement | null = null;
  let ctx: CanvasContext | null = null;

  // Async loading and initial drawing
  const initPromise = (async () => {
    const res = await fetch(base64Str);
    const blob = await res.blob();
    bitmap = await createImageBitmap(blob);

    if (typeof OffscreenCanvas !== "undefined") {
      canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    } else {
      canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
    }

    ctx = canvas.getContext("2d", { alpha }) as CanvasContext | null;
    if (ctx && bitmap) {
      ctx.drawImage(bitmap, 0, 0);
    }
  })();

  const createTempCanvas = (width: number, height: number) => {
    return typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(width, height)
      : document.createElement("canvas");
  };

  const instance = {
    resize(width: number, height: number) {
      initPromise.then(() => {
        if (!canvas) return;
        const tempCanvas = createTempCanvas(width, height);
        tempCanvas.width = width;
        tempCanvas.height = height;

        const tempCtx = tempCanvas.getContext("2d") as CanvasContext | null;
        if (tempCtx) {
          tempCtx.drawImage(
            canvas,
            0,
            0,
            canvas.width,
            canvas.height,
            0,
            0,
            width,
            height,
          );
          canvas = tempCanvas;
          ctx = tempCtx;
        }
      });
      return instance;
    },

    crop(x: number, y: number, width: number, height: number) {
      initPromise.then(() => {
        if (!canvas) return;
        const tempCanvas = createTempCanvas(width, height);
        tempCanvas.width = width;
        tempCanvas.height = height;

        const tempCtx = tempCanvas.getContext("2d") as CanvasContext | null;
        if (tempCtx) {
          tempCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
          canvas = tempCanvas;
          ctx = tempCtx;
        }
      });
      return instance;
    },

    flip(horizontal: boolean, vertical: boolean) {
      initPromise.then(() => {
        if (!canvas) return;
        const tempCanvas = createTempCanvas(canvas.width, canvas.height);
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        const tempCtx = tempCanvas.getContext("2d") as CanvasContext | null;
        if (tempCtx) {
          tempCtx.translate(
            horizontal ? canvas.width : 0,
            vertical ? canvas.height : 0,
          );
          tempCtx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
          tempCtx.drawImage(canvas, 0, 0);
          canvas = tempCanvas;
          ctx = tempCtx;
        }
      });
      return instance;
    },

    rotate(angle: number) {
      initPromise.then(() => {
        if (!canvas) return;

        const normalizedAngle = ((angle % 360) + 360) % 360;
        const isNewRatio = normalizedAngle === 90 || normalizedAngle === 270;

        const newWidth = isNewRatio ? canvas.height : canvas.width;
        const newHeight = isNewRatio ? canvas.width : canvas.height;

        const tempCanvas = createTempCanvas(newWidth, newHeight);
        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;

        const tempCtx = tempCanvas.getContext("2d") as CanvasContext | null;
        if (tempCtx) {
          tempCtx.translate(newWidth / 2, newHeight / 2);
          tempCtx.rotate((normalizedAngle * Math.PI) / 180);
          tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
          canvas = tempCanvas;
          ctx = tempCtx;
        }
      });
      return instance;
    },

    async getBase64(): Promise<string> {
      await initPromise;
      if (!canvas) throw new Error("Canvas not initialized");

      try {
        if (canvas instanceof OffscreenCanvas) {
          const blob = await canvas.convertToBlob({ type: mimeType });
          return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () =>
              reject(new Error("Failed to read blob as Base64"));
            reader.readAsDataURL(blob);
          });
        } else {
          return canvas.toDataURL(mimeType);
        }
      } finally {
        if (bitmap) {
          bitmap.close();
          bitmap = null;
        }
      }
    },
  };

  return instance;
}
