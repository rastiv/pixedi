import { describe, expect, it } from "vitest";
import type { CropRect, HistoryItem } from "../types";
import {
  closestTurn,
  getActions,
  getCoverScale,
  getPreview,
  getPreviewLayers,
  getProcessingSteps,
  getRotatedSizes,
  isSwapped,
  splitSegments,
  type Preview,
  type Region,
} from "./preview";

const initial: HistoryItem = {
  width: 6099,
  height: 4014,
  action: { name: "initial", args: null },
};

const fullRegion: Region = {
  cx: 3049.5,
  cy: 2007,
  w: 6099,
  h: 4014,
  angle: 0,
};

const rotateItem = (
  degrees: number,
  width: number,
  height: number,
): HistoryItem => ({
  width,
  height,
  action: { name: "rotate", args: { degrees } },
});

const cropItem = (
  rect: CropRect,
  width: number,
  height: number,
): HistoryItem => ({
  width,
  height,
  action: {
    name: "crop",
    args: { id: "free", ratio: 1, isFree: true, ...rect },
  },
});

const closeRegion = (region: Region) => ({
  cx: expect.closeTo(region.cx, 6),
  cy: expect.closeTo(region.cy, 6),
  w: expect.closeTo(region.w, 6),
  h: expect.closeTo(region.h, 6),
  angle: expect.closeTo(region.angle, 6),
});

const rad = (degrees: number) => (degrees * Math.PI) / 180;

describe("getPreview", () => {
  it("keeps the view sizes in sync with the stored history sizes", () => {
    // rotate degrees are absolute, so the second rotate lands on 270 in total
    const rotated = rotateItem(90, 4014, 6099);
    const flipped: HistoryItem = {
      width: 4014,
      height: 6099,
      action: { name: "flip", args: { horizontal: true, vertical: false } },
    };
    const items = [initial, rotated, flipped];
    const rotatedAgain = rotateItem(
      270,
      ...sizesOf(getRotatedSizes(items, 270)),
    );

    const preview = getPreview([...items, rotatedAgain]);

    expect(rotatedAgain.width).toBe(4014);
    expect(rotatedAgain.height).toBe(6099);
    expect(preview.viewWidth).toBe(rotatedAgain.width);
    expect(preview.viewHeight).toBe(rotatedAgain.height);
    expect(preview.degrees).toBe(270);
    // flips mirror the view as it is seen, so the 180deg turn runs the other
    // way round inside the mirrored layer
    expect(preview.flipX).toBe(true);
    expect(preview.flipY).toBe(false);
    expect(preview.beta).toBe(-90);
    expect(preview.scale).toBe(1);
  });

  it("maps a crop authored in view space back into image space", () => {
    const { region, viewWidth, viewHeight, beta } = getPreview([
      initial,
      rotateItem(90, 4014, 6099),
      cropItem({ x: 0, y: 0, w: 50, h: 50 }, 2007, 3049),
    ]);

    // the top-left quarter of a 90deg view is the bottom-left quarter of the image
    expect(region).toEqual(
      closeRegion({ cx: 1524.75, cy: 3010.5, w: 3049.5, h: 2007, angle: 0 }),
    );
    expect(beta).toBe(90);
    expect(viewWidth).toBeCloseTo(initial.height / 2);
    expect(viewHeight).toBeCloseTo(initial.width / 2);
  });

  it("zooms a free angle in and swaps the frame past 45 degrees", () => {
    const portrait: HistoryItem = { ...initial, width: 2272, height: 3408 };
    const { viewWidth, viewHeight, scale, beta } = getPreview([
      portrait,
      rotateItem(105, 3408, 2272),
    ]);

    expect(beta).toBe(105);
    expect(viewWidth).toBe(3408);
    expect(viewHeight).toBe(2272);
    expect(scale).toBeCloseTo(
      Math.max(
        (3408 * Math.abs(Math.cos(rad(105))) +
          2272 * Math.abs(Math.sin(rad(105)))) /
          2272,
        (3408 * Math.abs(Math.sin(rad(105))) +
          2272 * Math.abs(Math.cos(rad(105)))) /
          3408,
      ),
    );
  });

  it("keeps the angle editable instead of compounding the zoom", () => {
    const edited = getPreview([
      initial,
      rotateItem(105, 4014, 6099),
      rotateItem(110, 4014, 6099),
    ]);
    const direct = getPreview([initial, rotateItem(110, 4014, 6099)]);

    expect(edited.beta).toBe(110);
    expect(edited.scale).toBe(direct.scale);
  });

  it("moves the tilt into the region when cropping a rotated view", () => {
    const base: HistoryItem = { ...initial, width: 800, height: 600 };
    const scale = getCoverScale(800, 600, 800, 600, 15);
    const items = [
      base,
      rotateItem(15, 800, 600),
      cropItem({ x: 25, y: 25, w: 50, h: 50 }, 400, 300),
    ];

    const cropped = getPreview(items);

    expect(cropped.region).toEqual(
      closeRegion({
        cx: 400,
        cy: 300,
        w: 400 / scale,
        h: 300 / scale,
        angle: -15,
      }),
    );
    expect(cropped.beta).toBe(0);
    expect(cropped.scale).toBe(1);
    expect(cropped.viewWidth).toBeCloseTo(400 / scale);
    expect(cropped.degrees).toBe(15);

    // turning back to 0 tilts the cropped region back by the same amount
    const unrotated = getPreview([...items, rotateItem(0, 400, 300)]);
    expect(unrotated.beta).toBe(-15);
    expect(unrotated.scale).toBeGreaterThan(1);
  });

  it("mirrors the view on a flip and reverses later turns inside it", () => {
    const base: HistoryItem = { ...initial, width: 800, height: 600 };
    const items: HistoryItem[] = [
      base,
      rotateItem(15, 800, 600),
      {
        width: 800,
        height: 600,
        action: { name: "flip", args: { horizontal: true, vertical: false } },
      },
    ];

    const flipped = getPreview(items);
    expect(flipped.flipX).toBe(true);
    expect(flipped.beta).toBe(15);

    expect(getPreview([...items, rotateItem(20, 800, 600)]).beta).toBe(10);
  });
});

// the source pixel under a point of the view, given in frame fractions
const viewToImage = (preview: Preview, u: number, v: number) => {
  const { region, beta, scale, flipX, flipY, viewWidth, viewHeight } = preview;
  let x = (u - 0.5) * viewWidth;
  let y = (v - 0.5) * viewHeight;
  if (flipX) x = -x;
  if (flipY) y = -y;
  const turn = (px: number, py: number, degrees: number) => [
    px * Math.cos(rad(degrees)) - py * Math.sin(rad(degrees)),
    px * Math.sin(rad(degrees)) + py * Math.cos(rad(degrees)),
  ];
  const [lx, ly] = turn(x, y, -beta);
  const [ix, iy] = turn(lx / scale, ly / scale, region.angle);
  return [region.cx + ix, region.cy + iy];
};

describe("crop continuity", () => {
  it.each([
    { degrees: 15, flip: false },
    { degrees: 105, flip: false },
    { degrees: -30, flip: true },
    { degrees: 200, flip: true },
  ])(
    "shows the same pixels after cropping at $degrees deg (flip $flip)",
    ({ degrees, flip }) => {
      const base: HistoryItem = { ...initial, width: 800, height: 600 };
      const items: HistoryItem[] = [
        base,
        ...(flip
          ? [
              {
                width: 800,
                height: 600,
                action: {
                  name: "flip",
                  args: { horizontal: true, vertical: false },
                },
              } as HistoryItem,
            ]
          : []),
        rotateItem(degrees, 800, 600),
      ];
      const rect = { x: 10, y: 20, w: 50, h: 40 };
      const before = getPreview(items);
      const after = getPreview([...items, cropItem(rect, 100, 100)]);

      const corners = [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ];
      for (const [u, v] of corners) {
        const expected = viewToImage(
          before,
          (rect.x + u * rect.w) / 100,
          (rect.y + v * rect.h) / 100,
        );
        const actual = viewToImage(after, u, v);
        expect(actual[0]).toBeCloseTo(expected[0], 6);
        expect(actual[1]).toBeCloseTo(expected[1], 6);
      }
      // the new frame keeps the aspect ratio of the crop rect
      expect(after.viewWidth / after.viewHeight).toBeCloseTo(
        (rect.w * before.viewWidth) / (rect.h * before.viewHeight),
      );
    },
  );
});

const sizesOf = ({ width, height }: { width: number; height: number }) =>
  [width, height] as const;

describe("closestTurn", () => {
  it.each([
    { degrees: 0, reference: 1197, expected: 1080 },
    { degrees: 1197, reference: 0, expected: 117 },
    { degrees: 350, reference: 10, expected: -10 },
    { degrees: -90, reference: 0, expected: -90 },
    { degrees: 270, reference: 0, expected: -90 },
  ])(
    "maps $degrees to $expected next to $reference",
    ({ degrees, reference, expected }) => {
      expect(closestTurn(degrees, reference)).toBe(expected);
    },
  );
});

describe("getRotatedSizes", () => {
  const resized: HistoryItem[] = [
    initial,
    {
      width: 1200,
      height: 800,
      action: { name: "resize", args: { width: 1200, height: 800 } },
    },
  ];

  it("swaps a previous resize when the frame turns on its side", () => {
    expect(getRotatedSizes(resized, 90)).toEqual({ width: 800, height: 1200 });
    expect(getRotatedSizes(resized, 105)).toEqual({ width: 800, height: 1200 });
  });

  it("keeps the sizes for angles closer to the current orientation", () => {
    expect(getRotatedSizes(resized, 30)).toEqual({ width: 1200, height: 800 });
    expect(getRotatedSizes(resized, 180)).toEqual({ width: 1200, height: 800 });
  });

  it("rounds a tie at 45 degrees up to the next quarter turn", () => {
    expect(isSwapped(45)).toBe(true);
    expect(isSwapped(135)).toBe(false);
  });
});

describe("getActions", () => {
  it("does not emit a resize for a rotation that only swaps the axes", () => {
    expect(getActions([initial, rotateItem(90, 4014, 6099)])).toEqual({
      transform: {
        region: fullRegion,
        beta: 90,
        scale: 1,
        flipX: false,
        flipY: false,
        width: 4014,
        height: 6099,
      },
    });
  });

  it("collapses a full turn to no actions at all", () => {
    expect(getActions([initial, rotateItem(360, 6099, 4014)])).toEqual({});
  });

  it("normalizes negative degrees before handing them over", () => {
    expect(
      getActions([initial, rotateItem(-90, 4014, 6099)]).transform?.beta,
    ).toBe(270);
  });

  it("emits a deliberate resize in view space alongside the rotation", () => {
    const actions = getActions([
      initial,
      rotateItem(90, 4014, 6099),
      {
        width: 2007,
        height: 3050,
        action: { name: "resize", args: { width: 2007, height: 3050 } },
      },
    ]);

    expect(actions.transform?.beta).toBe(90);
    expect(actions.resize).toEqual({ width: 2007, height: 3050 });
  });

  it("emits the crop region in original image pixels", () => {
    // the crop sizes match the view, so no resize rides along with it
    expect(
      getActions([initial, cropItem({ x: 0, y: 0, w: 50, h: 50 }, 3050, 2007)]),
    ).toEqual({
      transform: {
        region: closeRegion({
          cx: 1524.75,
          cy: 1003.5,
          w: 3049.5,
          h: 2007,
          angle: 0,
        }),
        beta: 0,
        scale: 1,
        flipX: false,
        flipY: false,
        width: 3050,
        height: 2007,
      },
    });
  });

  it("keeps the oriented scale after cropping a zoomed view", () => {
    const base: HistoryItem = { ...initial, width: 800, height: 600 };
    const actions = getActions([
      base,
      rotateItem(15, 800, 600),
      cropItem({ x: 25, y: 25, w: 50, h: 50 }, 400, 300),
    ]);

    expect(actions.transform?.region.angle).toBeCloseTo(-15);
    // the region holds fewer source pixels than the crop, so it is upscaled
    expect(actions.transform!.width).toBeLessThan(400);
    expect(actions.resize).toEqual({ width: 400, height: 300 });
  });
});

const shapeItem = (args: Partial<CropRect> = {}): HistoryItem => ({
  width: 2000,
  height: 2000,
  action: {
    name: "shapes",
    args: { shape: "heart", outlined: false, border: 0.075, ...args },
  },
});

const committedShape = shapeItem({ x: 10, y: 0, w: 50, h: 100 });
const filter: HistoryItem = {
  width: 6099,
  height: 4014,
  action: { name: "filters", args: { url: "sepia" } },
};

describe("splitSegments", () => {
  it("closes a segment on a committed shape", () => {
    const segments = splitSegments([
      initial,
      committedShape,
      rotateItem(90, 2000, 2000),
    ]);

    expect(segments).toHaveLength(2);
    expect(segments[0]).toEqual([initial, committedShape]);
    expect(segments[1][0]).toEqual({
      width: 2000,
      height: 2000,
      action: { name: "initial", args: null },
    });
  });

  it("ignores an open shape without a rect", () => {
    expect(splitSegments([initial, shapeItem()])).toHaveLength(1);
  });
});

describe("getProcessingSteps", () => {
  it("crops and masks first, then applies later edits to the result", () => {
    const { steps, filters } = getProcessingSteps([
      initial,
      filter,
      committedShape,
      rotateItem(90, 2000, 2000),
    ]);

    expect(steps).toEqual([
      {
        transform: {
          region: closeRegion({
            cx: 2134.65,
            cy: 2007,
            w: 3049.5,
            h: 4014,
            angle: 0,
          }),
          beta: 0,
          scale: 1,
          flipX: false,
          flipY: false,
          width: 3050,
          height: 4014,
        },
        resize: { width: 2000, height: 2000 },
        shape: { shape: "heart", outlined: false, border: 0.075 },
      },
      {
        transform: {
          region: { cx: 1000, cy: 1000, w: 2000, h: 2000, angle: 0 },
          beta: 90,
          scale: 1,
          flipX: false,
          flipY: false,
          width: 2000,
          height: 2000,
        },
      },
    ]);
    // filters are global and applied once over the final output
    expect(filters).toEqual({ url: "sepia" });
  });
});

describe("getPreviewLayers", () => {
  it("renders one layer per segment with the shape on the closed one", () => {
    const { layers } = getPreviewLayers([initial, committedShape]);

    expect(layers).toHaveLength(2);
    expect(layers[0].shape).toEqual({
      shape: "heart",
      outlined: false,
      border: 0.075,
    });
    expect(layers[1].shape).toBeNull();
    expect(layers[1].viewWidth).toBe(2000);
  });
});
