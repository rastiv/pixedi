import type {
  ProcessedImage,
  Settings,
} from "@/shared/components/Pixedi/types";
import { createPreviewBlob, hasAlphaChannel } from "./crop";

export async function imageProcessor(blob: Blob) {
  const bitmap = await createImageBitmap(blob);
  const inputMimeType = blob.type || "image/png";
  // Canvas cannot encode GIF, so fall back to PNG for the output format.
  const mimeType = inputMimeType === "image/gif" ? "image/png" : inputMimeType;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: true });

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
    tempCanvas.getContext("2d", { alpha: true })?.drawImage(canvas, 0, 0);
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

  const get = async (settings: Settings): Promise<ProcessedImage> => {
    const { quality = 0.85, saveAsWEBP = false } = settings;
    const outputMimeType = saveAsWEBP ? "image/webp" : mimeType;

    const newBlob = await new Promise<Blob>((resolve, reject) => {
      if (
        mimeType === "image/jpeg" ||
        mimeType === "image/webp" ||
        saveAsWEBP
      ) {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else
              reject(new Error(`Failed to encode image as ${outputMimeType}`));
          },
          outputMimeType,
          quality,
        );
      } else {
        // PNG format does not support quality parameter
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to encode image as image/png"));
        }, "image/png");
      }
    });

    const newBitmap = await createImageBitmap(newBlob);
    const previewBlob = await createPreviewBlob(newBitmap);
    const { width, height } = newBitmap;
    const isAlpha = hasAlphaChannel(newBitmap);
    newBitmap.close();

    return {
      newBlob,
      previewBlob,
      mimeType: outputMimeType,
      width,
      height,
      isAlpha,
    };
  };

  return {
    crop,
    flip,
    rotate,
    resize,
    get,
  };
}
