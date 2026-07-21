import { describe, expect, it } from "vitest";
import {
  degree2Rad,
  getCropByNewSizes,
  getCropPoints,
  getInitalCrop,
} from "./utils";

const element = {
  offsetLeft: 10,
  offsetTop: 20,
  offsetWidth: 80,
  offsetHeight: 60,
} as HTMLElement;

describe("getInitalCrop", () => {
  it.each([
    [1, 200, 100, { x: 30, y: 10, w: 40, h: 80 }],
    [
      16 / 9,
      200,
      100,
      { x: 14.444444444444446, y: 10, w: 71.11111111111111, h: 80 },
    ],
    [9 / 16, 200, 100, { x: 38.75, y: 10, w: 22.5, h: 80 }],
    [1, 100, 200, { x: 10, y: 30, w: 80, h: 40 }],
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
      "r",
      true,
      1,
      100,
      0,
      -100,
      0,
      100,
      100,
      { x: 10, y: 20, w: 40, h: 50 },
      element,
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
      element,
    );

    expect(crop).toEqual({ x: 20, y: 30, w: 80, h: 70 });
  });

  it("preserves fixed ratios when the requested resize remains valid", () => {
    const crop = getCropPoints(
      "r",
      false,
      2,
      100,
      0,
      120,
      0,
      200,
      200,
      { x: 50, y: 50, w: 80, h: 40 },
      element,
    );

    expect(crop).toEqual({ x: 50, y: 45, w: 100, h: 50 });
    expect(crop.w / crop.h).toBe(2);
  });

  it("restores the element rectangle for invalid fixed-ratio resizes", () => {
    const crop = getCropPoints(
      "r",
      false,
      2,
      100,
      0,
      200,
      0,
      100,
      100,
      { x: 10, y: 20, w: 80, h: 40 },
      element,
    );

    expect(crop).toEqual({ x: 10, y: 20, w: 80, h: 60 });
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
