import type { CSSProperties } from "react";
import { shapes } from "../constants/shapes";
import type { CropRect, ShapeMask } from "../types";

export const getShapeMaskImage = ({
  shape,
  outlined,
  border,
}: ShapeMask): string => {
  const paint = outlined
    ? `fill='none' stroke='white' stroke-width='${border}' stroke-linejoin='round' stroke-linecap='round'`
    : "fill='white'";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1' preserveAspectRatio='none'><path d='${shapes[shape]}' ${paint}/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

// mask-position percentages are relative to the free space (100 - size), so
// a rect offset has to be converted before it can be used as a position
const toMaskPosition = (offset: number, size: number) =>
  size >= 100 ? 0 : (offset / (100 - size)) * 100;

export const getShapeMaskGeometry = ({ x, y, w, h }: CropRect) => ({
  size: `${w}% ${h}%`,
  position: `${toMaskPosition(x, w)}% ${toMaskPosition(y, h)}%`,
});

export const getShapeMaskStyle = (
  mask: ShapeMask,
  rect: CropRect = { x: 0, y: 0, w: 100, h: 100 },
): CSSProperties => {
  const image = getShapeMaskImage(mask);
  const { size, position } = getShapeMaskGeometry(rect);
  return {
    maskImage: image,
    maskRepeat: "no-repeat",
    maskSize: size,
    maskPosition: position,
    WebkitMaskImage: image,
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskSize: size,
    WebkitMaskPosition: position,
  };
};

export const applyShapeMaskGeometry = (el: HTMLElement, rect: CropRect) => {
  const { size, position } = getShapeMaskGeometry(rect);
  el.style.maskSize = size;
  el.style.maskPosition = position;
  el.style.setProperty("-webkit-mask-size", size);
  el.style.setProperty("-webkit-mask-position", position);
};
