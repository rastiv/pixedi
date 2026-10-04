import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PixediProvider } from "../provider/PixediProvider";
import { usePixediContext } from "../provider/usePixediContext";
import { Frame } from "../frame";
import { getInitalCrop } from "../utils/crop";
import { SHAPE_BORDER } from "../constants";

const width = 4209;
const height = 2769;

const Probe = () => {
  const { setCurrentAction, getLastHistoryItem } = usePixediContext();
  const item = getLastHistoryItem();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setCurrentAction({
            name: "shapes",
            args: { shape: "heart", outlined: false, border: SHAPE_BORDER },
          })
        }
      >
        start shapes
      </button>
      <div data-testid="item">{JSON.stringify(item)}</div>
    </>
  );
};

const renderShapes = () => {
  const view = render(
    <PixediProvider
      mimeType="png"
      previewUrl="data:image/png;base64,initial"
      originalBlob={new Blob([], { type: "image/png" })}
      width={width}
      height={height}
      settings={{}}
      translations={{}}
      isAlpha={false}
    >
      <Probe />
      <Frame />
    </PixediProvider>,
  );

  fireEvent.click(view.getByText("start shapes"));

  return view;
};

const getItem = (getByTestId: (id: string) => HTMLElement) =>
  JSON.parse(getByTestId("item").textContent!);

describe("ShapeTools", () => {
  afterEach(cleanup);

  it("saves a square shape crop with the selected options", () => {
    const { container, getByTestId, getByLabelText } = renderShapes();

    fireEvent.click(getByLabelText("outlined"));
    fireEvent.click(
      container.querySelector<HTMLButtonElement>('button[aria-label="Save"]')!,
    );

    const crop = getInitalCrop(1, width, height);
    const item = getItem(getByTestId);
    expect(item.width).toBe(item.height);
    expect(item.width).toBe(Math.round((crop.w / 100) * width));
    expect(item.action).toEqual({
      name: "shapes",
      args: {
        shape: "heart",
        outlined: true,
        border: SHAPE_BORDER,
        x: crop.x,
        y: crop.y,
        w: crop.w,
        h: crop.h,
      },
    });
  });

  it("masks the committed shape in the preview", () => {
    const { container } = renderShapes();

    fireEvent.click(
      container.querySelector<HTMLButtonElement>('button[aria-label="Save"]')!,
    );

    const masked = Array.from(
      container.querySelectorAll<HTMLElement>("div"),
    ).filter((el) => el.style.maskImage.startsWith('url("data:image/svg+xml'));
    expect(masked).toHaveLength(1);
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });

  it("discards the shape on close", () => {
    const { container, getByTestId } = renderShapes();

    fireEvent.click(
      container.querySelector<HTMLButtonElement>('button[aria-label="Close"]')!,
    );

    expect(getItem(getByTestId).action.name).toBe("initial");
  });
});
