import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.stubGlobal("createImageBitmap", vi.fn());
vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("");
vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((cb) => {
  cb(null);
});

if (!globalThis.ImageBitmap) {
  class ImageBitmapMock {
    close() {}
  }

  vi.stubGlobal("ImageBitmap", ImageBitmapMock);
}
