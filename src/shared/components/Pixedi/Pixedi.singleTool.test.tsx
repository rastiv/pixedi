import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PixediProvider } from "./provider/PixediProvider";
import { Frame } from "./frame";
import type { Settings } from "./types";

const newBlob = new Blob(["saved"], { type: "image/png" });

const get = vi.fn(async () => ({
  newBlob,
  previewBlob: new Blob(["preview"], { type: "image/png" }),
  mimeType: "image/png",
  width: 800,
  height: 600,
  isAlpha: false,
}));

vi.mock("./utils/imageProcessor", () => ({
  blobToBase64: vi.fn(async () => "data:image/png;base64,saved"),
  imageProcessor: vi.fn(async () => ({
    crop: vi.fn(),
    flip: vi.fn(),
    rotate: vi.fn(),
    resize: vi.fn(),
    filters: vi.fn(),
    get,
  })),
}));

const settings: Settings = { tools: ["rotate"] };

const renderSingleTool = (onSave = vi.fn(), onBack = vi.fn()) => {
  const view = render(
    <PixediProvider
      mimeType="png"
      previewUrl="data:image/png;base64,initial"
      originalBlob={new Blob([], { type: "image/png" })}
      width={800}
      height={600}
      settings={settings}
      isAlpha={false}
      onSave={onSave}
      onBack={onBack}
    >
      <Frame />
    </PixediProvider>,
  );

  return { ...view, onSave, onBack };
};

const getButton = (container: HTMLElement, label: string) =>
  container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;

describe("Pixedi single tool mode", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:preview"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    cleanup();
  });

  it("opens the only tool without the header", () => {
    const { container } = renderSingleTool();

    expect(getButton(container, "+90°")).toBeTruthy();
    expect(container.textContent).not.toContain("Reset");
  });

  it("calls onBack when the tool is closed", () => {
    const { container, onBack, onSave } = renderSingleTool();

    fireEvent.click(getButton(container, "Close"));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("processes the image and calls onSave", async () => {
    const { container, onSave } = renderSingleTool();

    fireEvent.click(getButton(container, "+90°"));
    fireEvent.click(getButton(container, "Save"));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(newBlob));
    expect(get).toHaveBeenCalledTimes(1);
  });

  it("shows the loader while saving", async () => {
    let resolveSave: () => void = () => {};
    const onSave = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        }),
    );
    const { container } = renderSingleTool(onSave);

    fireEvent.click(getButton(container, "+90°"));
    fireEvent.click(getButton(container, "Save"));

    await waitFor(() => expect(onSave).toHaveBeenCalled());

    const saveButton = getButton(container, "Save");
    expect(saveButton.disabled).toBe(true);
    expect(saveButton.querySelector("animateTransform")).toBeTruthy();

    resolveSave();
    await waitFor(() =>
      expect(getButton(container, "Save").disabled).toBe(false),
    );
  });
});
