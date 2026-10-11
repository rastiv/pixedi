import { afterEach, describe, expect, it, vi } from "vitest";
import { blobToBase64, fitToMaxSize, imageProcessor } from "./imageProcessor";
import { getActions, getPreview } from "./preview";
import type { HistoryItem } from "../types";

const createCtxMock = () => {
  const ctx = {
    globalCompositeOperation: "source-over",
    composites: [] as string[],
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    clip: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(() => {
      ctx.composites.push(ctx.globalCompositeOperation);
    }),
  };
  return ctx;
};

describe("imageProcessor shape", () => {
  afterEach(() => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
  });

  it("masks an outlined shape without clipping the image itself", async () => {
    const contexts: ReturnType<typeof createCtxMock>[] = [];
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation(() => {
      const ctx = createCtxMock();
      contexts.push(ctx);
      return ctx as unknown as CanvasRenderingContext2D;
    });
    vi.mocked(createImageBitmap).mockResolvedValue({
      width: 100,
      height: 100,
      close: vi.fn(),
    } as unknown as ImageBitmap);

    const processor = await imageProcessor(new Blob([], { type: "image/png" }));
    processor.shape({ shape: "star", outlined: true, border: 0.1 });

    const [main, mask] = contexts;
    // a clip on the main context would keep every pixel outside the shape
    expect(main.clip).not.toHaveBeenCalled();
    expect(mask.clip).toHaveBeenCalled();
    expect(mask.stroke).toHaveBeenCalled();
    expect(main.composites.at(-1)).toBe("destination-in");
  });
});

type Matrix = [number, number, number, number, number, number];

// records the canvas transform calls as one affine matrix [a, b, c, d, e, f]
const createTransformCtxMock = () => {
  let m: Matrix = [1, 0, 0, 1, 0, 0];
  const multiply = ([a, b, c, d, e, f]: Matrix) => {
    const [A, B, C, D, E, F] = m;
    m = [
      A * a + C * b,
      B * a + D * b,
      A * c + C * d,
      B * c + D * d,
      A * e + C * f + E,
      B * e + D * f + F,
    ];
  };
  const ctx = {
    ...createCtxMock(),
    drawn: null as Matrix | null,
    translate: vi.fn((x: number, y: number) => multiply([1, 0, 0, 1, x, y])),
    scale: vi.fn((x: number, y: number) => multiply([x, 0, 0, y, 0, 0])),
    rotate: vi.fn((r: number) =>
      multiply([Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0]),
    ),
    drawImage: vi.fn(() => {
      ctx.drawn = m;
    }),
  };
  return ctx;
};

describe("imageProcessor transform", () => {
  afterEach(() => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
  });

  it("draws the region into a frame sized canvas like the preview", async () => {
    const main = createTransformCtxMock();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation(
      () => main as unknown as CanvasRenderingContext2D,
    );
    vi.mocked(createImageBitmap).mockResolvedValue({
      width: 800,
      height: 600,
      close: vi.fn(),
    } as unknown as ImageBitmap);

    const items: HistoryItem[] = [
      { width: 800, height: 600, action: { name: "initial", args: null } },
      {
        width: 800,
        height: 600,
        action: { name: "flip", args: { horizontal: true, vertical: false } },
      },
      {
        width: 600,
        height: 800,
        action: { name: "rotate", args: { degrees: 75 } },
      },
      {
        width: 300,
        height: 400,
        action: {
          name: "crop",
          args: {
            id: "free",
            ratio: 1,
            isFree: true,
            x: 10,
            y: 20,
            w: 50,
            h: 50,
          },
        },
      },
      {
        width: 300,
        height: 400,
        action: { name: "rotate", args: { degrees: 80 } },
      },
    ];
    const preview = getPreview(items);
    const { transform } = getActions(items);

    const processor = await imageProcessor(new Blob([], { type: "image/png" }));
    processor.transform(transform!);

    const canvas = main.drawn!;
    const { region, beta, scale, flipX, flipY, viewWidth, viewHeight } =
      preview;
    const rad = (degrees: number) => (degrees * Math.PI) / 180;
    // the source pixel the preview shows at a frame position
    const sourceAt = (u: number, v: number) => {
      let x = (u - 0.5) * viewWidth;
      let y = (v - 0.5) * viewHeight;
      if (flipX) x = -x;
      if (flipY) y = -y;
      const lx = (x * Math.cos(rad(-beta)) - y * Math.sin(rad(-beta))) / scale;
      const ly = (x * Math.sin(rad(-beta)) + y * Math.cos(rad(-beta))) / scale;
      const a = rad(region.angle);
      return [
        region.cx + lx * Math.cos(a) - ly * Math.sin(a),
        region.cy + lx * Math.sin(a) + ly * Math.cos(a),
      ];
    };

    for (const [u, v] of [
      [0, 0],
      [1, 0],
      [0.3, 0.7],
      [1, 1],
    ]) {
      const [sx, sy] = sourceAt(u, v);
      const [a, b, c, d, e, f] = canvas;
      expect(a * sx + c * sy + e).toBeCloseTo(u * transform!.width, 6);
      expect(b * sx + d * sy + f).toBeCloseTo(v * transform!.height, 6);
    }
  });
});

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
