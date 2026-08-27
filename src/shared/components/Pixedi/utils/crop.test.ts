import { describe, expect, it } from "vitest";
import {
  degree2Rad,
  getCropByNewSizes,
  getCropPoints,
  getInitalCrop,
  snapRectToRatio,
} from "./crop";

const fallback = { x: 10, y: 20, w: 80, h: 60 };

describe("getInitalCrop", () => {
  it.each([
    [1, 200, 100, { x: 31, y: 12, w: 38, h: 76 }],
    [
      16 / 9,
      200,
      100,
      { x: 16.22222222222222, y: 12, w: 67.55555555555556, h: 76 },
    ],
    [9 / 16, 200, 100, { x: 39.3125, y: 12, w: 21.375, h: 76 }],
    [1, 100, 200, { x: 12, y: 31, w: 76, h: 38 }],
  ])(
    "centers a %s crop inside a %sx%s frame",
    (ratio, width, height, expected) => {
      const crop = getInitalCrop(ratio, width, height);

      expect(crop.x).toBeCloseTo(expected.x);
      expect(crop.y).toBeCloseTo(expected.y);
      expect(crop.w).toBeCloseTo(expected.w);
      expect(crop.h).toBeCloseTo(expected.h);
      expect(crop.x + crop.w / 2).toBeCloseTo(50);
      expect(crop.y + crop.h / 2).toBeCloseTo(50);
    },
  );
});

describe("getCropPoints", () => {
  it("keeps free-form edge resizing within the frame and minimum width", () => {
    const crop = getCropPoints(
      "br",
      true,
      1,
      100,
      0,
      -100,
      0,
      100,
      100,
      { x: 10, y: 20, w: 40, h: 50 },
      fallback,
    );

    expect(crop).toEqual({ x: 10, y: 20, w: 32, h: 50 });
  });

  it("keeps free-form corner resizing within parent bounds", () => {
    const crop = getCropPoints(
      "br",
      true,
      1,
      0,
      0,
      200,
      200,
      100,
      100,
      { x: 20, y: 30, w: 40, h: 40 },
      fallback,
    );

    expect(crop).toEqual({ x: 20, y: 30, w: 80, h: 70 });
  });

  it("preserves fixed ratios when the requested resize remains valid", () => {
    const crop = getCropPoints(
      "br",
      false,
      2,
      100,
      0,
      120,
      0,
      200,
      200,
      { x: 50, y: 50, w: 80, h: 40 },
      fallback,
    );

    expect(crop).toEqual({ x: 50, y: 50, w: 100, h: 50 });
    expect(crop.w / crop.h).toBe(2);
  });

  it("reaches the top boundary when a fixed-ratio crop is expanded past it", () => {
    const crop = getCropPoints(
      "tl",
      false,
      1,
      100,
      100,
      98,
      98,
      600,
      400,
      { x: 80.6, y: 0.6, w: 399.4, h: 399.4 },
      { x: 80.6, y: 0.6, w: 399.4, h: 399.4 },
    );

    expect(crop.y).toBe(0);
    expect(crop.h).toBe(400);
    expect(crop.w / crop.h).toBe(1);
  });

  it("constrains fixed-ratio resizes to the frame boundary", () => {
    const crop = getCropPoints(
      "br",
      false,
      2,
      100,
      0,
      200,
      0,
      100,
      100,
      { x: 10, y: 20, w: 80, h: 40 },
      fallback,
    );

    expect(crop).toEqual({ x: 10, y: 20, w: 90, h: 45 });
  });
});

describe("snapRectToRatio", () => {
  it.each([
    [1, 6099, 4014],
    [16 / 9, 6099, 4014],
    [9 / 16, 4014, 6099],
  ])(
    "keeps a %s crop exactly on ratio in image space",
    (ratio, width, height) => {
      // a rect the frame rounded off ratio: w/h percentages of different axes
      const drifted = snapRectToRatio(
        { x: 12.5, y: 8.5, w: 50.4, h: 75.9 },
        ratio,
        width,
        height,
      );

      const wPx = (drifted.w / 100) * width;
      const hPx = (drifted.h / 100) * height;

      expect(Math.round(wPx) / Math.round(hPx)).toBeCloseTo(ratio, 3);
    },
  );

  it("scales both axes together when the snapped crop leaves the frame", () => {
    const snapped = snapRectToRatio(
      { x: 40, y: 10, w: 60, h: 90 },
      1,
      100,
      100,
    );

    expect(snapped.x + snapped.w).toBeCloseTo(100);
    expect(snapped.w).toBeCloseTo(snapped.h);
  });
});

describe("crop utility helpers", () => {
  it("rescales crop rectangles and clamps their visible bounds", () => {
    expect(
      getCropByNewSizes({ x: -1, y: 10, w: 80, h: 60 }, 100, 50, 50),
    ).toEqual({
      x: 0,
      y: 20,
      w: 100,
      h: 50,
    });
  });

  it.each([
    [0, 0],
    [90, Math.PI / 2],
    [180, Math.PI],
  ])("converts %s degrees to radians", (degrees, radians) => {
    expect(degree2Rad(degrees)).toBeCloseTo(radians);
  });
});
