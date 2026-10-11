import {
  ActionName,
  type ActionFilter,
  type HistoryItem,
  type ShapeMask,
} from "../types";

const EPSILON = 1e-6;

export const normalizeAngle = (degrees: number) =>
  ((degrees % 360) + 360) % 360;

// the shortest signed turn from one angle to another, in (-180, 180]
export const shortestTurn = (from: number, to: number) => {
  const delta = normalizeAngle(to - from);
  return delta > 180 ? delta - 360 : delta;
};

// the angle equivalent to `degrees` that is closest to `reference`
export const closestTurn = (degrees: number, reference: number) =>
  reference + shortestTurn(reference, degrees);

// exact values on quarter turns, so 90deg does not leave a 1e-16 zoom behind
const trig = (degrees: number): [cos: number, sin: number] => {
  const angle = normalizeAngle(degrees);
  if (angle === 0) return [1, 0];
  if (angle === 90) return [0, 1];
  if (angle === 180) return [-1, 0];
  if (angle === 270) return [0, -1];
  const rad = (angle * Math.PI) / 180;
  return [Math.cos(rad), Math.sin(rad)];
};

// clockwise rotation in a y-down coordinate space (same as css/canvas rotate)
const rotate = (x: number, y: number, degrees: number): [number, number] => {
  const [cos, sin] = trig(degrees);
  return [x * cos - y * sin, x * sin + y * cos];
};

// the frame orientation follows the nearest quarter turn
const quarterOf = (degrees: number) => Math.round(degrees / 90);

const isOdd = (value: number) => Math.abs(value) % 2 === 1;

// true when the frame is closer to a 90/270 turn, which swaps its axes
export const isSwapped = (degrees: number) => isOdd(quarterOf(degrees));

// the zoom that makes the rotated region cover the whole frame
export const getCoverScale = (
  frameWidth: number,
  frameHeight: number,
  width: number,
  height: number,
  degrees: number,
) => {
  const [cos, sin] = trig(degrees).map(Math.abs);
  return Math.max(
    (frameWidth * cos + frameHeight * sin) / width,
    (frameWidth * sin + frameHeight * cos) / height,
    1,
  );
};

// the part of the original image in play, in source pixels; `angle` is the
// rotation of its axes in image space (0 unless a crop was made on a tilted view)
export type Region = {
  cx: number;
  cy: number;
  w: number;
  h: number;
  angle: number;
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
  region: Region;
  // rotation of the region layer in the view, unnormalized so css animates
  // the short way round
  beta: number;
  // zoom that keeps the rotated region covering the whole frame
  scale: number;
  // flips in view space, applied outside the rotation
  flipX: boolean;
  flipY: boolean;
  // the absolute angle the user sees (the last rotate in the segment)
  degrees: number;
  newWidth: number;
  newHeight: number;
  initWidth: number;
  initHeight: number;
  // frame sizes in region pixels
  viewWidth: number;
  viewHeight: number;
  filters: string[];
  shape: ShapeMask | null;
};

const getFrame = (region: Region, beta: number) => {
  const swapped = isSwapped(beta);
  const viewWidth = swapped ? region.h : region.w;
  const viewHeight = swapped ? region.w : region.h;
  return {
    viewWidth,
    viewHeight,
    scale: getCoverScale(viewWidth, viewHeight, region.w, region.h, beta),
  };
};

export const getPreview = (items: HistoryItem[]): Preview => {
  let initWidth = 1;
  let initHeight = 1;
  let region: Region = { cx: 0.5, cy: 0.5, w: 1, h: 1, angle: 0 };
  let beta = 0;
  let flipX = false;
  let flipY = false;
  let degrees = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.action.name === ActionName.INITIAL) {
      initWidth = item.width;
      initHeight = item.height;
      region = {
        cx: initWidth / 2,
        cy: initHeight / 2,
        w: initWidth,
        h: initHeight,
        angle: 0,
      };
      beta = 0;
      flipX = false;
      flipY = false;
      degrees = 0;
    } else if (
      item.action.name === ActionName.CROP ||
      item.action.name === ActionName.SHAPES
    ) {
      const l = (item.action.args.x ?? 0) / 100;
      const t = (item.action.args.y ?? 0) / 100;
      const cw = (item.action.args.w ?? 100) / 100;
      const ch = (item.action.args.h ?? 100) / 100;
      const { viewWidth, viewHeight, scale } = getFrame(region, beta);

      // the crop rect in centered view pixels
      const vx = (l + cw / 2 - 0.5) * viewWidth;
      const vy = (t + ch / 2 - 0.5) * viewHeight;
      const vw = cw * viewWidth;
      const vh = ch * viewHeight;

      // back through the view transform (flip, rotate, zoom) into region
      // pixels, then into image pixels
      const [lx, ly] = rotate(flipX ? -vx : vx, flipY ? -vy : vy, -beta);
      const [ix, iy] = rotate(lx / scale, ly / scale, region.angle);

      // the quarter turn and the flips stay on the view, only the residual
      // tilt moves into the new region, which is axis aligned with the view
      const quarter = quarterOf(beta);
      const residual = beta - quarter * 90;
      const swapped = isOdd(quarter);
      region = {
        cx: region.cx + ix,
        cy: region.cy + iy,
        w: (swapped ? vh : vw) / scale,
        h: (swapped ? vw : vh) / scale,
        angle: region.angle - residual,
      };
      beta = quarter * 90;
    } else if (item.action.name === ActionName.FLIP) {
      // the history item names the axes as the user sees them, and the flips
      // live outside the rotation, so they apply as they are
      if (item.action.args.horizontal) flipX = !flipX;
      if (item.action.args.vertical) flipY = !flipY;
    } else if (item.action.name === ActionName.ROTATE) {
      // degrees are absolute: the delta is applied in view space, so a
      // mirrored view turns the layer the other way round
      const delta = item.action.args.degrees - degrees;
      beta += flipX !== flipY ? -delta : delta;
      degrees = item.action.args.degrees;
    }
  }

  const { viewWidth, viewHeight, scale } = getFrame(region, beta);

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
    region,
    beta,
    scale,
    flipX,
    flipY,
    degrees,
    newWidth,
    newHeight,
    initWidth,
    initHeight,
    viewWidth,
    viewHeight,
    filters,
    shape,
  };
};

// stored sizes after rotating the last history item to `degrees`; they only
// swap when the frame flips between landscape and portrait, which keeps a
// previous resize intact
export const getRotatedSizes = (items: HistoryItem[], degrees: number) => {
  const { width, height } = items.at(-1)!;
  const segment = splitSegments(items).at(-1)!;
  const before = getPreview(segment);
  const after = getPreview([
    ...segment,
    { width, height, action: { name: ActionName.ROTATE, args: { degrees } } },
  ]);
  return isSwapped(before.beta) === isSwapped(after.beta)
    ? { width, height }
    : { width: height, height: width };
};

const isIdentity = ({
  region,
  beta,
  flipX,
  flipY,
  initWidth,
  initHeight,
}: Preview) =>
  !flipX &&
  !flipY &&
  normalizeAngle(beta) < EPSILON &&
  Math.abs(region.angle) < EPSILON &&
  Math.abs(region.cx - initWidth / 2) < EPSILON &&
  Math.abs(region.cy - initHeight / 2) < EPSILON &&
  Math.abs(region.w - initWidth) < EPSILON &&
  Math.abs(region.h - initHeight) < EPSILON;

export type TransformStep = {
  region: Region;
  beta: number;
  scale: number;
  flipX: boolean;
  flipY: boolean;
  width: number;
  height: number;
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

export const getActions = (
  items: HistoryItem[],
): {
  transform?: TransformStep;
  resize?: { width: number; height: number };
  filters?: ActionFilter;
  shape?: ShapeMask;
} => {
  const preview = getPreview(items);
  const {
    region,
    beta,
    scale,
    flipX,
    flipY,
    newWidth,
    newHeight,
    viewWidth,
    viewHeight,
    shape,
  } = preview;

  const ActionFilter = getLastFilterArgs(items);

  return {
    // crop, flips and rotation collapse into one draw; the stored degrees are
    // absolute and unnormalized, so a full turn collapses to a no-op
    ...(isIdentity(preview)
      ? {}
      : {
          transform: {
            region,
            beta: normalizeAngle(beta),
            scale,
            flipX,
            flipY,
            width: Math.max(1, Math.round(viewWidth)),
            height: Math.max(1, Math.round(viewHeight)),
          },
        }),
    // the view sizes already account for the crop and the axis swap, so only a
    // deliberate resize (or the zoom of a crop on a tilted view, which keeps
    // the oriented scale) makes the stored sizes differ from them
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
