import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PixediProvider } from "../provider/PixediProvider";
import { usePixediContext } from "../provider/usePixediContext";
import { Frame } from "../frame";
import { getInitalCrop } from "../utils/crop";
import type { ActionCrop } from "../types";

const width = 4209;
const height = 2769;

const Probe = ({ args }: { args: ActionCrop }) => {
  const { setCurrentAction, getLastHistoryItem } = usePixediContext();
  const { width: itemWidth, height: itemHeight } = getLastHistoryItem();

  return (
    <>
      <button
        type="button"
        onClick={() => setCurrentAction({ name: "crop", args })}
      >
        start crop
      </button>
      <div data-testid="sizes">{`${itemWidth} x ${itemHeight}`}</div>
    </>
  );
};

// buttons in render order: the probe, then the crop tools save and close
const getSaveButton = (container: HTMLElement) =>
  container.querySelectorAll("button")[1];

const renderCrop = (args: ActionCrop) => {
  const view = render(
    <PixediProvider
      mimeType="png"
      previewUrl="data:image/png;base64,initial"
      originalBlob={new Blob([], { type: "image/png" })}
      width={width}
      height={height}
      settings={{}}
      isAlpha={false}
    >
      <Probe args={args} />
      <Frame />
    </PixediProvider>,
  );

  fireEvent.click(view.container.querySelectorAll("button")[0]);

  return view;
};

describe("CropTools", () => {
  afterEach(cleanup);

  it.each([
    ["freeform", { id: "freeform", ratio: width / height, isFree: true }],
    ["original", { id: "original", ratio: width / height, isFree: false }],
    ["1:1", { id: "1:1", ratio: 1, isFree: false }],
  ])("saves the untouched %s crop at its initial sizes", (_, args) => {
    const { container, getByTestId } = renderCrop(args);

    fireEvent.click(getSaveButton(container));

    const initialCrop = getInitalCrop(args.ratio, width, height);
    const expected = `${Math.round((initialCrop.w / 100) * width)} x ${Math.round(
      (initialCrop.h / 100) * height,
    )}`;

    expect(getByTestId("sizes").textContent).toBe(expected);
  });

  it("saves preset sizes instead of the measured crop", () => {
    const { container, getByTestId } = renderCrop({
      id: "instagram",
      ratio: 1,
      isFree: false,
      preset: { width: 1080, height: 1080 },
    });

    fireEvent.click(getSaveButton(container));

    expect(getByTestId("sizes").textContent).toBe("1080 x 1080");
  });
});
