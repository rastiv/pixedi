import { describe, expect, it } from "vitest";
import { blobToBase64, fitToMaxSize } from "./imageProcessor";

describe("fitToMaxSize", () => {
  it.each([undefined, 0, -100, NaN, Infinity])(
    "returns original sizes for invalid max %s",
    (max) => {
      expect(fitToMaxSize(4000, 2000, max)).toEqual({
        width: 4000,
        height: 2000,
      });
    },
  );

  it("does not upscale images within the limit", () => {
    expect(fitToMaxSize(800, 600, 1000)).toEqual({ width: 800, height: 600 });
    expect(fitToMaxSize(1000, 600, 1000)).toEqual({ width: 1000, height: 600 });
  });

  it("downscales landscape images by the longest side", () => {
    expect(fitToMaxSize(4000, 2000, 1000)).toEqual({
      width: 1000,
      height: 500,
    });
  });

  it("downscales portrait images by the longest side", () => {
    expect(fitToMaxSize(2000, 4000, 1000)).toEqual({
      width: 500,
      height: 1000,
    });
  });

  it("downscales square images", () => {
    expect(fitToMaxSize(3000, 3000, 1024)).toEqual({
      width: 1024,
      height: 1024,
    });
  });

  it("keeps each side at least 1px", () => {
    expect(fitToMaxSize(10000, 1, 100)).toEqual({ width: 100, height: 1 });
  });
});

describe("blobToBase64", () => {
  it("converts a blob to a full data URI", async () => {
    const blob = new Blob(["hello"], { type: "image/png" });
    const result = await blobToBase64(blob);

    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it("converts blob contents correctly", async () => {
    const text = "pixedi-test-content";
    const blob = new Blob([text], { type: "text/plain" });
    const result = await blobToBase64(blob);

    const base64 = result.split(",")[1];
    const decoded = atob(base64);

    expect(decoded).toBe(text);
  });
});
