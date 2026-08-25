import { describe, expect, it } from "vitest";
import { blobToBase64 } from "./imageProcessor";

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
