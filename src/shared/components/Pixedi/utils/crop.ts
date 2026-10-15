import { PREVIEW_MAX_DIMENSION, PREVIEW_QUALITY } from "../constants";
import {
  ActionName,
  type Action,
  type CropRect,
  type CropRectExtended,
  type Direction,
} from "../types";

const minSize = 1;

// tools driven by the crop box; shapes are always cut from a square
export const getCropSettings = (
  action: Action | null,
): { ratio: number; isFree: boolean } | null => {
  if (
    action?.name === ActionName.CROP ||
    action?.name === ActionName.PRESET_CROP
  )
    return { ratio: action.args.ratio, isFree: action.args.isFree };
  if (action?.name === ActionName.SHAPES) return { ratio: 1, isFree: false };
  return null;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

// the corner opposite to the dragged handle stays put; dragging past it flips
// the rect to the other side instead of stopping at a minimum size
const getAnchor = (dir: Direction, crop: CropRect) => {
  const movesLeft = dir === "tl" || dir === "bl";
  const movesTop = dir === "tl" || dir === "tr";
  return {
    movesLeft,
    movesTop,
    anchorX: movesLeft ? crop.x + crop.w : crop.x,
    anchorY: movesTop ? crop.y + crop.h : crop.y,
    cornerX: movesLeft ? crop.x : crop.x + crop.w,
    cornerY: movesTop ? crop.y : crop.y + crop.h,
  };
};

const getSide = (anchor: number, pointer: number, towardStart: boolean) =>
  pointer === anchor ? (towardStart ? -1 : 1) : Math.sign(pointer - anchor);

// lays a span of `length` from the anchor on the given side, inside the frame
const placeSpan = (
  anchor: number,
  length: number,
  side: number,
  size: number,
): number => clamp(side > 0 ? anchor : anchor - length, 0, size - length);

export const getCropPoints = (
  dir: Direction,
  isFree: boolean,
  ratio: number,
  startX: number,
  startY: number,
  clientX: number,
  clientY: number,
  width: number,
  height: number,
  crop: CropRect,
): CropRect => {
  const { movesLeft, movesTop, anchorX, anchorY, cornerX, cornerY } = getAnchor(
    dir,
    crop,
  );
  const pointerX = clamp(cornerX + clientX - startX, 0, width);
  const pointerY = clamp(cornerY + clientY - startY, 0, height);
  const sideX = getSide(anchorX, pointerX, movesLeft);
  const sideY = getSide(anchorY, pointerY, movesTop);

  if (isFree) {
    const w = Math.max(Math.abs(pointerX - anchorX), minSize);
    const h = Math.max(Math.abs(pointerY - anchorY), minSize);
    return {
      x: placeSpan(anchorX, w, sideX, width),
      y: placeSpan(anchorY, h, sideY, height),
      w,
      h,
    };
  }

  const desiredWidth =
    ratio >= 1
      ? Math.abs(pointerX - anchorX)
      : Math.abs(pointerY - anchorY) * ratio;
  const availableWidth = sideX > 0 ? width - anchorX : anchorX;
  const availableHeight = sideY > 0 ? height - anchorY : anchorY;
  const maxWidth = Math.min(availableWidth, availableHeight * ratio);
  const w = Math.max(
    Math.min(desiredWidth, maxWidth),
    Math.max(minSize, minSize * ratio),
  );
  const h = w / ratio;

  return {
    x: placeSpan(anchorX, w, sideX, width),
    y: placeSpan(anchorY, h, sideY, height),
    w,
    h,
  };
};

export const getInitalCrop = (
  cropRatio: number,
  width: number,
  height: number,
): CropRectExtended => {
  const offsetPercent = 0.12;
  const frameRatio = width / height;
  let wPx = 0;
  let hPx = 0;

  if (cropRatio === 1) {
    wPx = (frameRatio > 1 ? height : width) * (1 - offsetPercent * 2);
    hPx = wPx;
  }

  if (cropRatio > 1) {
    if (frameRatio > cropRatio) {
      hPx = height * (1 - offsetPercent * 2);
      wPx = hPx * cropRatio;
    } else {
      wPx = width * (1 - offsetPercent * 2);
      hPx = wPx / cropRatio;
    }
  }

  if (cropRatio < 1) {
    if (frameRatio > cropRatio) {
      hPx = height * (1 - offsetPercent * 2);
      wPx = hPx * cropRatio;
    } else {
      wPx = width * (1 - offsetPercent * 2);
      hPx = wPx / cropRatio;
    }
  }

  const w = (wPx / width) * 100;
  const h = (hPx / height) * 100;
  const x = ((width - wPx) / 2 / width) * 100;
  const y = ((height - hPx) / 2 / height) * 100;
  const xP = Math.round((x / 100) * width);
  const yP = Math.round((y / 100) * height);
  const wP = Math.round((w / 100) * width);
  const hP = Math.round((h / 100) * height);

  return { x, y, w, h, xP, yP, wP, hP };
};

// a crop rect stores w/h as percentages of two different axes, so a rect that
// holds the ratio in frame space drifts off it in image space; re-derive the
// driven axis from the other one so the saved crop matches the ratio exactly
export const snapRectToRatio = (
  crop: CropRect,
  ratio: number,
  width: number,
  height: number,
): CropRect => {
  let wPx = (crop.w / 100) * width;
  let hPx = (crop.h / 100) * height;

  if (ratio >= 1) {
    hPx = wPx / ratio;
  } else {
    wPx = hPx * ratio;
  }

  let w = (wPx / width) * 100;
  let h = (hPx / height) * 100;

  // scale both axes together when the snap overflows, to keep the ratio
  const overflow = Math.max(w / (100 - crop.x), h / (100 - crop.y), 1);
  w /= overflow;
  h /= overflow;

  return { ...crop, w, h };
};

export const getCropByNewSizes = (
  crop: CropRect,
  width: number,
  height: number,
  frameWidth: number,
): CropRect => {
  const diffPercent = width / frameWidth;
  const x = Math.floor(crop.x * diffPercent);
  const y = Math.floor(crop.y * diffPercent);
  const w = Math.ceil(crop.w * diffPercent);
  const h = Math.ceil(crop.h * diffPercent);
  return {
    x: x < 0 ? 0 : x,
    y: y < 0 ? 0 : y,
    w: w > width ? width : w,
    h: h > height ? height : h,
  };
};

export const degree2Rad = (degree: number): number => (degree * Math.PI) / 180;

export const createPreviewBlob = async (bitmap: ImageBitmap): Promise<Blob> => {
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

export function hasAlphaChannel(bitmap: ImageBitmap): boolean {
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
