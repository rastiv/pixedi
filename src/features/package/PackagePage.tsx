import { useState } from "react";
import styles from "./PackagePage.module.css";

type HistoryItem =
  | {
      action: "init";
      width: number;
      height: number;
      left?: number;
      top?: number;
    }
  | {
      action: "crop";
      width: number;
      height: number;
      left: number;
      top: number;
    }
  | {
      action: "flip";
      horizontal: boolean;
      vertical: boolean;
    }
  | {
      action: "rotate";
      degrees: number;
    };

const hstr: HistoryItem[] = [
  { action: "init", width: 6099, height: 4014 },
  { action: "crop", width: 70, height: 100, left: 10, top: 0 },
  { action: "flip", horizontal: true, vertical: false },
  { action: "crop", width: 50, height: 80, left: 25, top: 5 },
  { action: "flip", horizontal: false, vertical: true },
  { action: "crop", width: 70, height: 64, left: 10, top: 28 },
  { action: "rotate", degrees: 270 },
  { action: "crop", width: 100, height: 70, left: 0, top: 15 },
];
// const hstr: HistoryItem[] = [
//   { action: "init", width: 6099, height: 4014 },
//   { action: "rotate", degrees: 90 },
//   { action: "flip", horizontal: true, vertical: false },
//   { action: "rotate", degrees: 180 },
//   { action: "flip", horizontal: false, vertical: true },
//   { action: "rotate", degrees: 270 },
// ];

// Orientation is kept as two independent, user-facing pieces of state:
// a clockwise rotation (0/90/180/270) and per-axis flip flags. Both are read
// off the history rather than accumulated - a `rotate` item carries the
// absolute angle, so the last one up to the pointer wins.
// The view is built from the crop by flipping first, then rotating:
//   view = Rot(rotation) . Flip
type Mat = [[number, number], [number, number]];

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

const getAggregatedCrop = (history: HistoryItem[], pointer: number) => {
  let initWidth = 1;
  let initHeight = 1;
  let box = { x: 0, y: 0, w: 1, h: 1 };
  let rotation = 0;
  let flipH = false;
  let flipV = false;

  for (let i = 0; i <= pointer; i++) {
    const item = history[i];
    if (item.action === "init") {
      initWidth = item.width;
      initHeight = item.height;
      box = { x: 0, y: 0, w: 1, h: 1 };
      rotation = 0;
      flipH = false;
      flipV = false;
    } else if (item.action === "crop") {
      const l = (item.left ?? 0) / 100;
      const t = (item.top ?? 0) / 100;
      const cw = (item.width ?? 100) / 100;
      const ch = (item.height ?? 100) / 100;

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
    } else if (item.action === "flip") {
      // the history item names the axes as the user sees them, but the flip
      // layer lives under the rotate layer - at 90/270 the axes are swapped
      const swapped = rotation === 90 || rotation === 270;
      const horizontal = swapped ? item.vertical : item.horizontal;
      const vertical = swapped ? item.horizontal : item.vertical;
      if (horizontal) flipH = !flipH;
      if (vertical) flipV = !flipV;
    } else if (item.action === "rotate") {
      // degrees are absolute: the last rotate up to the pointer wins
      rotation = normalizeDegrees(item.degrees ?? 0);
    }
  }

  // crop dimensions in original image pixels (axis-aligned in image space)
  const boxWidth = box.w * initWidth;
  const boxHeight = box.h * initHeight;

  // 90/270 rotations swap the visible axes, so the view ratio flips
  const swapped = rotation === 90 || rotation === 270;
  const viewWidth = swapped ? boxHeight : boxWidth;
  const viewHeight = swapped ? boxWidth : boxHeight;

  return {
    box,
    boxWidth,
    boxHeight,
    initWidth,
    initHeight,
    viewWidth,
    viewHeight,
    rotation,
    flipH,
    flipV,
  };
};

export const PackagePage = () => {
  const [history] = useState<HistoryItem[]>(hstr);
  const [pointer, setPointer] = useState(0);

  const prev = () => {
    if (pointer > 0) setPointer(pointer - 1);
  };

  const next = () => {
    if (pointer < history.length - 1) setPointer(pointer + 1);
  };

  const cropInfo = getAggregatedCrop(history, pointer);
  const {
    box,
    boxWidth,
    boxHeight,
    viewWidth,
    viewHeight,
    rotation,
    flipH,
    flipV,
  } = cropInfo;

  return (
    <div>
      <div className={styles.container} style={{ maxWidth: "1000px" }}>
        <h1>PackagePage</h1>
        <div className={styles.tls}>
          <button disabled={pointer === 0} onClick={prev}>
            Prev
          </button>
          <span style={{ margin: "0 10px" }}>
            {pointer + 1} / {history.length}
          </span>
          <button disabled={pointer === history.length - 1} onClick={next}>
            Next
          </button>
          <span
            style={{ marginLeft: "20px", fontSize: "0.9rem", color: "#666" }}
          >
            Size: {Math.round(viewWidth)} x {Math.round(viewHeight)} px
          </span>
        </div>
        <div className={styles.wrp}>
          <div
            className={styles.frm}
            style={{
              aspectRatio: `${viewWidth} / ${viewHeight}`,
            }}
          >
            <div
              className={styles.rotate}
              style={{
                width: `${(boxWidth / viewWidth) * 100}%`,
                height: `${(boxHeight / viewHeight) * 100}%`,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              }}
            >
              <div
                className={styles.flip}
                style={{
                  transform: `scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                }}
              >
                <img
                  className={styles.image}
                  src="/bird.jpg"
                  alt="bird"
                  style={{
                    width: `${(1 / box.w) * 100}%`,
                    height: `${(1 / box.h) * 100}%`,
                    left: `${-(box.x / box.w) * 100}%`,
                    top: `${-(box.y / box.h) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
