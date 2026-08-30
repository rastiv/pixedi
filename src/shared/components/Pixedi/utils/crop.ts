import { PREVIEW_MAX_DIMENSION, PREVIEW_QUALITY } from "../constants";
import type { CropRect, CropRectExtended, Direction, Sizes } from "../types";

const minSize = 32;

const getCropTL = (
  isFree: boolean,
  ratio: number,
  startX: number,
  startY: number,
  clientX: number,
  clientY: number,
  width: number,
  height: number,
  crop: CropRect,
  fallback: CropRect,
): CropRect => {
  let { x, y, w, h } = crop;

  if (isFree) {
    const right = width - crop.w - crop.x;
    x += clientX - startX;
    if (x < 0) x = 0;
    w = width - x - right;
    if (w < minSize) {
      w = minSize;
      x = width - right - minSize;
    }

    const bottom = height - h - y;
    y += clientY - startY;
    if (y < 0) y = 0;
    h = height - y - bottom;
    if (h < minSize) {
      h = minSize;
      y = height - bottom - minSize;
    }
  } else {
    if (ratio >= 1) {
      const difW = clientX - startX;
      const difH = Math.round(difW / ratio);
      w -= difW;
      h -= difH;
      x += difW;
      y += difH;
    } else {
      const difH = clientY - startY;
      const difW = Math.round(difH * ratio);
      w -= difW;
      h -= difH;
      x += difW;
      y += difH;
    }
    if (x < 0 || y < 0 || w < minSize || h < minSize) {
      return fallback;
    }
  }

  return { x, y, w, h };
};

const getCropTR = (
  isFree: boolean,
  ratio: number,
  startX: number,
  startY: number,
  clientX: number,
  clientY: number,
  width: number,
  height: number,
  crop: CropRect,
  fallback: CropRect,
): CropRect => {
  const { x } = crop;
  let { y, w, h } = crop;

  if (isFree) {
    w += clientX - startX;
    if (w + x > width) w = width - x;
    if (w < minSize) w = minSize;

    const bottom = height - h - y;
    y += clientY - startY;
    if (y < 0) y = 0;
    h = height - y - bottom;
    if (h < minSize) {
      h = minSize;
      y = height - bottom - minSize;
    }
  } else {
    if (ratio > 1) {
      const difW = clientX - startX;
      const difH = Math.round(difW / ratio);
      w += difW;
      h += difH;
      y -= difH;
    } else {
      const difH = clientY - startY;
      const difW = Math.round(difH * ratio);
      w -= difW;
      h -= difH;
      y += difH;
    }
    if (w + x > width || y < 0 || w < minSize || h < minSize) {
      return fallback;
    }
  }

  return { x, y, w, h };
};

const getCropBL = (
  isFree: boolean,
  ratio: number,
  startX: number,
  startY: number,
  clientX: number,
  clientY: number,
  width: number,
  height: number,
  crop: CropRect,
  fallback: CropRect,
): CropRect => {
  const { y } = crop;
  let { x, w, h } = crop;

  if (isFree) {
    h += clientY - startY;
    if (h + y > height) h = height - y;
    if (h < minSize) h = minSize;

    const right = width - crop.w - crop.x;
    x += clientX - startX;
    if (x < 0) x = 0;
    w = width - x - right;
    if (w < minSize) {
      w = minSize;
      x = width - right - minSize;
    }
  } else {
    if (ratio >= 1) {
      const difW = clientX - startX;
      const difH = Math.round(difW / ratio);
      w -= difW;
      h -= difH;
      x += difW;
    } else {
      const difH = clientY - startY;
      const difW = Math.round(difH * ratio);
      w += difW;
      h += difH;
      x -= difW;
    }
    if (h + y > height || x < 0 || w < minSize || h < minSize) {
      return fallback;
    }
  }

  return { x, y, w, h };
};

const getCropBR = (
  isFree: boolean,
  ratio: number,
  startX: number,
  startY: number,
  clientX: number,
  clientY: number,
  width: number,
  height: number,
  crop: CropRect,
  fallback: CropRect,
): CropRect => {
  const { x, y } = crop;
  let { w, h } = crop;

  if (isFree) {
    w += clientX - startX;
    if (w + x > width) w = width - x;
    if (w < minSize) w = minSize;

    h += clientY - startY;
    if (h + y > height) h = height - y;
    if (h < minSize) h = minSize;
  } else {
    if (ratio >= 1) {
      const difW = clientX - startX;
      const difH = Math.round(difW / ratio);
      w += difW;
      h += difH;
    } else {
      const difH = clientY - startY;
      const difW = Math.round(difH * ratio);
      w += difW;
      h += difH;
    }
    if (h + y > height || w + x > width || w < minSize || h < minSize) {
      return fallback;
    }
  }

  return { x, y, w, h };
};

const getFixedCrop = (
  dir: Direction,
  ratio: number,
  startX: number,
  startY: number,
  clientX: number,
  clientY: number,
  width: number,
  height: number,
  crop: CropRect,
): CropRect => {
  const movesLeft = dir === "tl" || dir === "bl";
  const movesTop = dir === "tl" || dir === "tr";
  const right = crop.x + crop.w;
  const bottom = crop.y + crop.h;
  const deltaX = clientX - startX;
  const deltaY = clientY - startY;
  const desiredWidth =
    ratio >= 1
      ? crop.w + (movesLeft ? -deltaX : deltaX)
      : (crop.h + (movesTop ? -deltaY : deltaY)) * ratio;
  const availableWidth = movesLeft ? right : width - crop.x;
  const availableHeight = movesTop ? bottom : height - crop.y;
  const maxWidth = Math.min(availableWidth, availableHeight * ratio);
  const minimumWidth = Math.max(minSize, minSize * ratio);
  const w = Math.min(Math.max(desiredWidth, minimumWidth), maxWidth);
  const h = w / ratio;

  return {
    x: movesLeft ? right - w : crop.x,
    y: movesTop ? bottom - h : crop.y,
    w,
    h,
  };
};

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
  fallback: CropRect,
): CropRect => {
  if (!isFree) {
    return getFixedCrop(
      dir,
      ratio,
      startX,
      startY,
      clientX,
      clientY,
      width,
      height,
      crop,
    );
  }

  if (dir === "tl")
    return getCropTL(
      isFree,
      ratio,
      startX,
      startY,
      clientX,
      clientY,
      width,
      height,
      crop,
      fallback,
    );
  if (dir === "tr")
    return getCropTR(
      isFree,
      ratio,
      startX,
      startY,
      clientX,
      clientY,
      width,
      height,
      crop,
      fallback,
    );
  if (dir === "bl")
    return getCropBL(
      isFree,
      ratio,
      startX,
      startY,
      clientX,
      clientY,
      width,
      height,
      crop,
      fallback,
    );
  if (dir === "br")
    return getCropBR(
      isFree,
      ratio,
      startX,
      startY,
      clientX,
      clientY,
      width,
      height,
      crop,
      fallback,
    );
  return { x: 0, y: 0, w: 0, h: 0 };
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

// true when the absolute rotation swaps the visible axes (90 / 270)
export const isQuarterTurn = (degrees: number): boolean =>
  Math.abs(Math.round(degrees / 90)) % 2 === 1;

// rotate.args.degrees is absolute, so visible sizes have to be re-derived from
// the rotation the stored sizes were produced with, not from the new delta
export const getOrientedSizes = (
  width: number,
  height: number,
  fromDegrees: number,
  toDegrees: number,
): Sizes =>
  isQuarterTurn(fromDegrees) === isQuarterTurn(toDegrees)
    ? { width, height }
    : { width: height, height: width };

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
