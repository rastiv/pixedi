import {
  ActionName,
  type ActionFilter,
  type HistoryItem,
  type ShapeMask,
} from "../types";
import { isQuarterTurn } from "../utils/crop";

type Mat = [[number, number], [number, number]];

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const mul = (a: Mat, b: Mat): Mat => [
  [
    a[0][0] * b[0][0] + a[0][1] * b[1][0],
    a[0][0] * b[0][1] + a[0][1] * b[1][1],
  ],
  [
    a[1][0] * b[0][0] + a[1][1] * b[1][0],
    a[1][0] * b[0][1] + a[1][1] * b[1][1],
  ],
];

const normalizeDegrees = (degrees: number) =>
  (((Math.round(degrees / 90) % 4) + 4) % 4) * 90;

// clockwise rotation in a y-down coordinate space
const rotationMatrix = (degrees: number): Mat => {
  switch (normalizeDegrees(degrees)) {
    case 90:
      return [
        [0, -1],
        [1, 0],
      ];
    case 180:
      return [
        [-1, 0],
        [0, -1],
      ];
    case 270:
      return [
        [0, 1],
        [-1, 0],
      ];
    default:
      return [
        [1, 0],
        [0, 1],
      ];
  }
};

const flipMatrix = (flipH: boolean, flipV: boolean): Mat => [
  [flipH ? -1 : 1, 0],
  [0, flipV ? -1 : 1],
];

// Linear part mapping view coords -> crop-space coords, i.e. the inverse of the
// view transform: Flip . Rot(-rotation)
const orientationMatrix = (rotation: number, flipH: boolean, flipV: boolean) =>
  mul(flipMatrix(flipH, flipV), rotationMatrix(-rotation));

// offset that keeps the mapped unit square inside the unit square
const offsetOf = (m: Mat) => [
  m[0][0] < 0 || m[0][1] < 0 ? 1 : 0,
  m[1][0] < 0 || m[1][1] < 0 ? 1 : 0,
];

const applyOrientation = (m: Mat, u: number, v: number) => {
  const c = offsetOf(m);
  return [m[0][0] * u + m[0][1] * v + c[0], m[1][0] * u + m[1][1] * v + c[1]];
};

// an open shape tool has no rect yet, only a saved one changes the image
export const isCommittedShape = (item: HistoryItem): boolean =>
  item.action.name === ActionName.SHAPES &&
  item.action.args.w !== undefined &&
  item.action.args.h !== undefined;

const getLastFilterArgs = (items: HistoryItem[]) =>
  items.filter((item) => item.action.name === ActionName.FILTERS).at(-1)?.action
    .args as ActionFilter | undefined;

const getFilters = (items: HistoryItem[]): string[] =>
  Object.entries(getLastFilterArgs(items) || {}).map(([key, value]) =>
    key === "url"
      ? `url(#${value})`
      : key === "hueRotate"
        ? `hue-rotate(${value}deg)`
        : `${key}(${value}%)`,
  );

export type Preview = {
  box: { x: number; y: number; w: number; h: number };
  boxWidth: number;
  boxHeight: number;
  newWidth: number;
  newHeight: number;
  initWidth: number;
  initHeight: number;
  viewWidth: number;
  viewHeight: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  filters: string[];
  shape: ShapeMask | null;
};

export const getPreview = (items: HistoryItem[]): Preview => {
  let initWidth = 1;
  let initHeight = 1;
  let box = { x: 0, y: 0, w: 1, h: 1 };
  let rotation = 0;
  let flipH = false;
  let flipV = false;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.action.name === ActionName.INITIAL) {
      initWidth = item.width;
      initHeight = item.height;
      box = { x: 0, y: 0, w: 1, h: 1 };
      rotation = 0;
      flipH = false;
      flipV = false;
    } else if (
      item.action.name === ActionName.CROP ||
      item.action.name === ActionName.SHAPES
    ) {
      const l = (item.action.args.x ?? 0) / 100;
      const t = (item.action.args.y ?? 0) / 100;
      const cw = (item.action.args.w ?? 100) / 100;
      const ch = (item.action.args.h ?? 100) / 100;

      // map the crop rect corners from view space into crop space
      const m = orientationMatrix(rotation, flipH, flipV);
      const corners = [
        applyOrientation(m, l, t),
        applyOrientation(m, l + cw, t),
        applyOrientation(m, l, t + ch),
        applyOrientation(m, l + cw, t + ch),
      ];
      const s0 = Math.min(...corners.map((p) => p[0]));
      const s1 = Math.max(...corners.map((p) => p[0]));
      const t0 = Math.min(...corners.map((p) => p[1]));
      const t1 = Math.max(...corners.map((p) => p[1]));

      box = {
        x: box.x + s0 * box.w,
        y: box.y + t0 * box.h,
        w: box.w * (s1 - s0),
        h: box.h * (t1 - t0),
      };
      // cropping never changes the orientation
    } else if (item.action.name === ActionName.FLIP) {
      // the history item names the axes as the user sees them, but the flip
      // layer lives under the rotate layer - at 90/270 the axes are swapped
      const swapped = isQuarterTurn(rotation);
      const horizontal = swapped
        ? item.action.args.vertical
        : item.action.args.horizontal;
      const vertical = swapped
        ? item.action.args.horizontal
        : item.action.args.vertical;
      if (horizontal) flipH = !flipH;
      if (vertical) flipV = !flipV;
    } else if (item.action.name === ActionName.ROTATE) {
      // degrees are absolute (and kept unnormalized so CSS animates the short
      // way round): the last rotate up to the pointer wins
      rotation = item.action.args.degrees;
    }
  }

  // crop dimensions in original image pixels (axis-aligned in image space)
  const boxWidth = box.w * initWidth;
  const boxHeight = box.h * initHeight;

  // 90/270 rotations swap the visible axes, so the view ratio flips
  const swapped = isQuarterTurn(rotation);
  const viewWidth = swapped ? boxHeight : boxWidth;
  const viewHeight = swapped ? boxWidth : boxHeight;

  const lastItem = items.at(-1);
  const newWidth = lastItem?.width || 0;
  const newHeight = lastItem?.height || 0;

  const filters = getFilters(items);

  let shape: ShapeMask | null = null;
  if (
    lastItem?.action.name === ActionName.SHAPES &&
    isCommittedShape(lastItem)
  ) {
    const { shape: type, outlined, border } = lastItem.action.args;
    shape = { shape: type, outlined, border };
  }

  return {
    box,
    boxWidth,
    boxHeight,
    newWidth,
    newHeight,
    initWidth,
    initHeight,
    viewWidth,
    viewHeight,
    rotation,
    flipH,
    flipV,
    filters,
    shape,
  };
};

// a shape bakes its mask into the image, so every committed shape closes a
// segment and its output becomes the initial image of the next one
export const splitSegments = (items: HistoryItem[]): HistoryItem[][] => {
  const segments: HistoryItem[][] = [[]];
  for (const item of items) {
    segments.at(-1)!.push(item);
    if (isCommittedShape(item)) {
      segments.push([
        {
          width: item.width,
          height: item.height,
          action: { name: ActionName.INITIAL, args: null },
        },
      ]);
    }
  }
  return segments;
};

// filters are applied once over the final output, transparent pixels stay
// transparent, so they do not need to be split by segment
export const getPreviewLayers = (items: HistoryItem[]) => ({
  layers: splitSegments(items).map(getPreview),
  filters: getFilters(items),
});

export const getProcessingSteps = (items: HistoryItem[]) => {
  const steps = splitSegments(items)
    .map((segment) => {
      const step = getActions(segment);
      delete step.filters;
      return step;
    })
    .filter((step) => Object.keys(step).length > 0);
  return { steps, filters: getLastFilterArgs(items) };
};

export const getActions = (items: HistoryItem[]) => {
  const {
    box,
    flipH,
    flipV,
    rotation,
    newWidth,
    newHeight,
    initWidth,
    initHeight,
    viewWidth,
    viewHeight,
    shape,
  } = getPreview(items);

  const ActionFilter = getLastFilterArgs(items);

  const clampedX = clamp(box.x, 0, 1);
  const clampedY = clamp(box.y, 0, 1);
  const clampedBox = {
    x: clampedX,
    y: clampedY,
    w: clamp(box.w, 0, 1 - clampedX),
    h: clamp(box.h, 0, 1 - clampedY),
  };

  // the stored degrees are absolute and unnormalized, so 360 has to collapse
  // to a no-op instead of being handed to the processor
  const degrees = normalizeDegrees(rotation);

  return {
    ...(clampedBox.x === 0 &&
    clampedBox.y === 0 &&
    clampedBox.w === 1 &&
    clampedBox.h === 1
      ? {}
      : {
          crop: {
            x: Math.round(initWidth * box.x),
            y: Math.round(initHeight * box.y),
            w: Math.round(initWidth * box.w),
            h: Math.round(initHeight * box.h),
          },
        }),
    ...(degrees !== 0
      ? {
          rotate: {
            degrees,
          },
        }
      : {}),
    ...(flipH || flipV
      ? {
          flip: {
            horizontal: flipH,
            vertical: flipV,
          },
        }
      : {}),
    // the view sizes already account for the crop and the axis swap, so only a
    // deliberate resize makes the stored sizes differ from them
    ...(Math.round(viewWidth) !== newWidth ||
    Math.round(viewHeight) !== newHeight
      ? {
          resize: {
            width: newWidth,
            height: newHeight,
          },
        }
      : {}),
    ...(ActionFilter ? { filters: ActionFilter } : {}),
    ...(shape ? { shape } : {}),
  };
};
