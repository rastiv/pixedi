import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useImageProcessor } from "./useImageProcessor";

const bitmap = {
  width: 120,
  height: 80,
  close: vi.fn(),
};

const context = {
  clearRect: vi.fn(),
  drawImage: vi.fn(),
  filter: "",
  restore: vi.fn(),
  rotate: vi.fn(),
  save: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
};

const validPng = "data:image/png;base64,aGVsbG8=";
const validJpeg = "data:image/jpeg;base64,aGVsbG8=";

describe("useImageProcessor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(bitmap));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/png;base64,processed",
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("rejects malformed Base64 before attempting to decode an image", async () => {
    const { result } = renderHook(() => useImageProcessor());

    await expect(result.current.resize("invalid", 10, 10)).rejects.toThrow(
      "Invalid Base64 image format",
    );
    expect(createImageBitmap).not.toHaveBeenCalled();
  });

  it("resizes an image and serializes PNG output without a quality argument", async () => {
    const { result } = renderHook(() => useImageProcessor());

    await expect(result.current.resize(validPng, 60, 40)).resolves.toBe(
      "data:image/png;base64,processed",
    );

    expect(createImageBitmap).toHaveBeenCalledTimes(1);
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 60, 40);
    expect(context.drawImage).toHaveBeenCalledWith(bitmap, 0, 0, 60, 40);
    expect(bitmap.close).toHaveBeenCalledTimes(1);
    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith(
      "image/png",
    );
  });

  it("crops an image with source and destination rectangles", async () => {
    const { result } = renderHook(() => useImageProcessor());

    await result.current.crop(validPng, 5, 6, 50, 40);

    expect(context.drawImage).toHaveBeenCalledWith(
      bitmap,
      5,
      6,
      50,
      40,
      0,
      0,
      50,
      40,
    );
    expect(bitmap.close).toHaveBeenCalledTimes(1);
  });

  it("flips an image using the expected canvas transforms", async () => {
    const { result } = renderHook(() => useImageProcessor());

    await result.current.flip(validPng, true, false);

    expect(context.translate).toHaveBeenCalledWith(120, 0);
    expect(context.scale).toHaveBeenCalledWith(-1, 1);
    expect(context.drawImage).toHaveBeenCalledWith(bitmap, 0, 0);
    expect(context.restore).toHaveBeenCalledTimes(1);
    expect(bitmap.close).toHaveBeenCalledTimes(1);
  });

  it("rotates an image around its center", async () => {
    const { result } = renderHook(() => useImageProcessor());

    await result.current.rotate(validPng, 90);

    expect(context.translate).toHaveBeenCalledWith(60, 40);
    expect(context.rotate).toHaveBeenCalledWith(Math.PI / 2);
    expect(context.drawImage).toHaveBeenCalledWith(bitmap, -60, -40);
    expect(context.restore).toHaveBeenCalledTimes(1);
  });

  it("applies filters and uses quality for JPEG output", async () => {
    const { result } = renderHook(() => useImageProcessor());

    await result.current.filter(validJpeg, { brightness: 120, contrast: 90 });

    expect(context.filter).toBe("brightness(120%) contrast(90%)");
    expect(context.drawImage).toHaveBeenCalledWith(bitmap, 0, 0);
    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith(
      "image/jpeg",
      0.85,
    );
  });

  it("uses quality for WebP output", async () => {
    const { result } = renderHook(() => useImageProcessor());
    const webp = "data:image/webp;base64,aGVsbG8=";

    await result.current.resize(webp, 60, 40);

    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith(
      "image/webp",
      0.85,
    );
  });

  it("processes GIF input as PNG", async () => {
    const { result } = renderHook(() => useImageProcessor());
    const gif = "data:image/gif;base64,aGVsbG8=";

    await result.current.resize(gif, 60, 40);

    expect(createImageBitmap).toHaveBeenCalledWith(
      expect.objectContaining({ type: "image/png" }),
    );
    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith(
      "image/png",
    );
  });
});
