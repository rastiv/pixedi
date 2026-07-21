import type { CropRect, Direction } from "./types";

const minSize = 32;

const getDefaultCrop = (el: HTMLElement): CropRect => ({
  x: el.offsetLeft,
  y: el.offsetTop,
  w: el.offsetWidth,
  h: el.offsetHeight,
});

const getCropR = (
  isFree: boolean,
  ratio: number,
  startX: number,
  clientX: number,
  width: number,
  height: number,
  crop: CropRect,
  el: HTMLElement,
): CropRect => {
  const { x } = crop;
  let { y, w, h } = crop;

  if (isFree) {
    w += clientX - startX;
    if (w + x > width) w = width - x;
    if (w < minSize) w = minSize;
  } else {
    const difW = clientX - startX;
    const difH = Math.round(difW / ratio);
    w += difW;
    h += difH;
    y -= difH / 2;
    if (
      y < 0 ||
      h + y > height ||
      w + x > width ||
      w < minSize ||
      h < minSize
    ) {
      return getDefaultCrop(el);
    }
  }

  return { x, y, w, h };
};

const getCropL = (
  isFree: boolean,
  ratio: number,
  startX: number,
  clientX: number,
  width: number,
  height: number,
  crop: CropRect,
  el: HTMLElement,
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
  } else {
    const difW = clientX - startX;
    const difH = Math.round(difW / ratio);
    w -= difW;
    h -= difH;
    x += difW;
    y += difH / 2;
    if (y < 0 || x < 0 || h + y > height || w < minSize || h < minSize) {
      return getDefaultCrop(el);
    }
  }

  return { x, y, w, h };
};

const getCropT = (
  isFree: boolean,
  ratio: number,
  startY: number,
  clientY: number,
  width: number,
  height: number,
  crop: CropRect,
  el: HTMLElement,
): CropRect => {
  let { x, y, w, h } = crop;

  const bottom = height - h - y;
  if (isFree) {
    y += clientY - startY;
    if (y < 0) y = 0;
    h = height - y - bottom;
    if (h < minSize) {
      h = minSize;
      y = height - bottom - minSize;
    }
  } else {
    const difH = clientY - startY;
    const difW = Math.round(difH * ratio);
    h -= difH;
    w -= difW;
    x += difW / 2;
    y += difH;
    if (y < 0 || x < 0 || w + x > width || w < minSize || h < minSize) {
      return getDefaultCrop(el);
    }
  }

  return { x, y, w, h };
};

const getCropB = (
  isFree: boolean,
  ratio: number,
  startY: number,
  clientY: number,
  width: number,
  height: number,
  crop: CropRect,
  el: HTMLElement,
): CropRect => {
  const { y } = crop;
  let { x, w, h } = crop;

  if (isFree) {
    h += clientY - startY;
    if (h + y > height) h = height - y;
    if (h < minSize) h = minSize;
  } else {
    const difH = clientY - startY;
    const difW = Math.round(difH * ratio);
    h += difH;
    w += difW;
    x -= difW / 2;
    if (
      h + y > height ||
      x < 0 ||
      w + x > width ||
      w < minSize ||
      h < minSize
    ) {
      return getDefaultCrop(el);
    }
  }

  return { x, y, w, h };
};

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
  el: HTMLElement,
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
      return getDefaultCrop(el);
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
  el: HTMLElement,
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
      return getDefaultCrop(el);
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
  el: HTMLElement,
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
      return getDefaultCrop(el);
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
  el: HTMLElement,
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
      return getDefaultCrop(el);
    }
  }

  return { x, y, w, h };
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
  el: HTMLElement,
): CropRect => {
  if (dir === "r")
    return getCropR(isFree, ratio, startX, clientX, width, height, crop, el);
  if (dir === "l")
    return getCropL(isFree, ratio, startX, clientX, width, height, crop, el);
  if (dir === "t")
    return getCropT(isFree, ratio, startY, clientY, width, height, crop, el);
  if (dir === "b")
    return getCropB(isFree, ratio, startY, clientY, width, height, crop, el);
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
      el,
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
      el,
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
      el,
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
      el,
    );
  return { x: 0, y: 0, w: 0, h: 0 };
};

export const getInitalCrop = (
  cropRatio: number,
  width: number,
  height: number,
): CropRect => {
  const offsetPercent = 0.1;
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
  const xPx = Math.round((width - wPx) / 2);
  const yPx = Math.round((height - hPx) / 2);

  return { x, y, w, h, xPx, yPx, wPx, hPx };
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
