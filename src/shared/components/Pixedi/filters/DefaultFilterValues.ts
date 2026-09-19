import type { ActionFilter } from "../types";

export const DefaultFilterValues = (): ActionFilter => ({
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  hueRotate: 0,
  brightness: 100,
  contrast: 100,
});
