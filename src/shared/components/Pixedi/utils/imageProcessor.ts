import type {
  ActionFilter,
  ProcessedImage,
  Settings,
  ShapeMask,
  Sizes,
} from "../types";
import { shapes } from "../constants/shapes";
import { createPreviewBlob, hasAlphaChannel } from "./crop";
import { SHAPE_MITER_LIMIT } from "./shape";
import { isSwapped, type TransformStep } from "./preview";

export const fitToMaxSize = (
  width: number,
  height: number,
  maxSize?: number,
): Sizes => {
  const longest = Math.max(width, height);
  if (
    !maxSize ||
    !Number.isFinite(maxSize) ||
    maxSize <= 0 ||
    longest <= maxSize
  )
    return { width, height };

  const scale = maxSize / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

export const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Failed to read blob as base64"));
      }
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("FileReader error"));
    reader.readAsDataURL(blob);
  });

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

  // crop, flips and rotation in a single draw: the region is moved to the
  // output center, tilted, zoomed to cover the frame, rotated and flipped
  const transform = ({
    region,
    beta,
    scale,
    flipX,
    flipY,
    width,
    height,
  }: TransformStep) => {
    if (!ctx) return;

    const tempCanvas = snapshot();
    const frameWidth = isSwapped(beta) ? region.h : region.w;
    const frameHeight = isSwapped(beta) ? region.w : region.h;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.translate(width / 2, height / 2);
    // absorbs the rounding of the output size
    ctx.scale(width / frameWidth, height / frameHeight);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.rotate((beta * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.rotate((-region.angle * Math.PI) / 180);
    ctx.translate(-region.cx, -region.cy);
    ctx.drawImage(tempCanvas, 0, 0);
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

  const filters = (args: ActionFilter) => {
    if (!ctx) return;

    const tempCanvas = snapshot();

    const filterStr =
      "url" in args
        ? `url(#${args.url})`
        : Object.entries(args)
            .map(([key, value]) =>
              key === "hueRotate"
                ? `hue-rotate(${value}deg)`
                : `${key}(${value}%)`,
            )
            .join(" ");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = filterStr;
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.filter = "none";
  };

  // keeps only the pixels covered by the unit-square shape path
  const shape = ({ shape, outlined, border }: ShapeMask) => {
    if (!ctx) return;

    const path = new Path2D(shapes[shape]);

    if (outlined) {
      // a clip would also confine the destination-in composite, leaving the
      // pixels outside the shape untouched, so the mask is drawn separately
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const maskCtx = maskCanvas.getContext("2d", { alpha: true });
      if (!maskCtx) return;

      // matches the preview mask: an inside-only stroke keeps sharp corners
      maskCtx.scale(canvas.width, canvas.height);
      maskCtx.clip(path);
      maskCtx.lineWidth = border * 2;
      maskCtx.lineJoin = "miter";
      maskCtx.miterLimit = SHAPE_MITER_LIMIT;
      maskCtx.strokeStyle = "#fff";
      maskCtx.stroke(path);

      ctx.save();
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(maskCanvas, 0, 0);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.globalCompositeOperation = "destination-in";
    ctx.scale(canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.fill(path);
    ctx.restore();
  };

  const get = async (settings: Settings): Promise<ProcessedImage> => {
    const { quality = 0.85, saveAsWEBP = false, maxImageSize } = settings;
    const outputMimeType = saveAsWEBP ? "image/webp" : mimeType;

    const target = fitToMaxSize(canvas.width, canvas.height, maxImageSize);
    if (target.width !== canvas.width || target.height !== canvas.height)
      resize(target.width, target.height);

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
    transform,
    resize,
    filters,
    shape,
    get,
  };
}
