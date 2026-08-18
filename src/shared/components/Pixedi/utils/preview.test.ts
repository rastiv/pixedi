import { describe, expect, it } from "vitest";
import type { HistoryItem } from "../types";
import { getPreview } from "./preview";
import { getOrientedSizes } from "../utils";

const initial: HistoryItem = {
  width: 6099,
  height: 4014,
  action: { name: "initial", args: null },
};

describe("getPreview", () => {
  it("keeps the view sizes in sync with the stored history sizes", () => {
    // rotate degrees are absolute, so the second rotate lands on 270 in total
    const rotated = {
      ...getOrientedSizes(initial.width, initial.height, 0, 90),
      action: { name: "rotate", args: { degrees: 90 } },
    } as HistoryItem;
    const flipped = {
      width: rotated.width,
      height: rotated.height,
      action: { name: "flip", args: { horizontal: true, vertical: false } },
    } as HistoryItem;
    const rotatedAgain = {
      ...getOrientedSizes(flipped.width, flipped.height, 90, 270),
      action: { name: "rotate", args: { degrees: 270 } },
    } as HistoryItem;

    const items = [initial, rotated, flipped, rotatedAgain];
    const { viewWidth, viewHeight, rotation, flipH, flipV } = getPreview(items);

    expect(rotatedAgain.width).toBe(4014);
    expect(rotatedAgain.height).toBe(6099);
    expect(viewWidth).toBe(rotatedAgain.width);
    expect(viewHeight).toBe(rotatedAgain.height);
    expect(rotation).toBe(270);
    // the flip was authored at 90deg, where the visible axes are swapped
    expect(flipH).toBe(false);
    expect(flipV).toBe(true);
  });

  it("maps a crop authored in view space back into image space", () => {
    const items: HistoryItem[] = [
      initial,
      {
        ...getOrientedSizes(initial.width, initial.height, 0, 90),
        action: { name: "rotate", args: { degrees: 90 } },
      },
      {
        width: 2007,
        height: 3049,
        action: {
          name: "crop",
          args: {
            id: "free",
            ratio: 1,
            isFree: true,
            x: 0,
            y: 0,
            w: 50,
            h: 50,
          },
        },
      },
    ];

    const { box, boxWidth, boxHeight, viewWidth, viewHeight } =
      getPreview(items);

    // the top-left quarter of a 90deg view is the bottom-left quarter of the image
    expect(box).toEqual({ x: 0, y: 0.5, w: 0.5, h: 0.5 });
    expect(boxWidth).toBeCloseTo(initial.width / 2);
    expect(boxHeight).toBeCloseTo(initial.height / 2);
    expect(viewWidth).toBeCloseTo(initial.height / 2);
    expect(viewHeight).toBeCloseTo(initial.width / 2);
  });
});
