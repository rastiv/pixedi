import { describe, expect, it } from "vitest";
import { shapes } from "../constants/shapes";
import {
  applyShapeMaskImage,
  getShapeMaskGeometry,
  getShapeMaskImage,
} from "./shape";

describe("shapes", () => {
  // a path ending next to (not on) the start makes Z add a tiny segment, whose
  // miter joins spike into an outlined shape
  it.each(Object.entries(shapes))(
    "%s does not end a hair away from its start point",
    (_, d) => {
      const [sx, sy] = d
        .match(/^M([\d.]+),([\d.]+)/)!
        .slice(1)
        .map(Number);
      const [ex, ey] = d
        .match(/([\d.]+),([\d.]+) Z$/)!
        .slice(1)
        .map(Number);
      const gap = Math.hypot(ex - sx, ey - sy);
      expect(gap === 0 || gap > 0.01).toBe(true);
    },
  );
});

const decode = (image: string) =>
  decodeURIComponent(
    image.replace(/^url\("data:image\/svg\+xml,/, "").replace(/"\)$/, ""),
  );

describe("getShapeMaskImage", () => {
  it("fills the path for a full shape", () => {
    const svg = decode(
      getShapeMaskImage({ shape: "square", outlined: false, border: 0.1 }),
    );
    expect(svg).toContain("fill='white'");
    expect(svg).not.toContain("stroke");
  });

  it("strokes the inside of the path with sharp joins for an outlined shape", () => {
    const svg = decode(
      getShapeMaskImage({ shape: "square", outlined: true, border: 0.1 }),
    );
    expect(svg).toContain("fill='none'");
    // twice the border, clipped to the path, leaves exactly the border inside
    expect(svg).toContain("stroke-width='0.2'");
    expect(svg).toContain("clip-path='url(#s)'");
    expect(svg).toContain("stroke-linejoin='miter'");
  });
});

describe("applyShapeMaskImage", () => {
  it("sets the mask image for the given border", () => {
    const el = document.createElement("div");
    const mask = { shape: "star", outlined: true, border: 0.125 } as const;
    applyShapeMaskImage(el, mask);
    expect(el.style.maskImage).toBe(getShapeMaskImage(mask));
    expect(decode(el.style.maskImage)).toContain("stroke-width='0.25'");
  });
});

describe("getShapeMaskGeometry", () => {
  it("converts a rect offset into a mask position", () => {
    expect(getShapeMaskGeometry({ x: 25, y: 10, w: 50, h: 80 })).toEqual({
      size: "50% 80%",
      position: "50% 50%",
    });
  });

  it("does not divide by zero for a full-size rect", () => {
    expect(getShapeMaskGeometry({ x: 0, y: 0, w: 100, h: 100 })).toEqual({
      size: "100% 100%",
      position: "0% 0%",
    });
  });
});
