import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PixediProvider } from "../provider/PixediProvider";
import { usePixediContext } from "../provider/usePixediContext";
import { Frame } from "../frame";

afterEach(cleanup);

const Controls = () => {
  const { history, getLastRotation, setCurrentAction } = usePixediContext();
  const item = history.items.at(history.pointer)!;
  const degrees =
    item.action.name === "rotate" ? item.action.args.degrees : "-";

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setCurrentAction({
            name: "rotate",
            args: { degrees: getLastRotation() },
          })
        }
      >
        Open rotate
      </button>
      <output>{`${item.width}x${item.height}:${item.action.name}:${degrees}`}</output>
    </>
  );
};

const renderRotate = () => {
  const view = render(
    <PixediProvider
      mimeType="png"
      previewUrl="data:image/png;base64,initial"
      originalBlob={new Blob([], { type: "image/png" })}
      width={800}
      height={600}
      settings={{}}
      isAlpha={false}
      translations={{}}
    >
      <Frame />
      <Controls />
    </PixediProvider>,
  );
  fireEvent.click(view.getByText("Open rotate"));

  const preview = () =>
    view.container.querySelector("img")!.parentElement!.parentElement!
      .parentElement!.parentElement!;
  // preset points are the only elements styled with a bare rotation (besides
  // the thumb, which starts at 0)
  const point = (angle: number) =>
    view.container.querySelector<HTMLElement>(
      `[style="transform: rotate(${angle}deg);"]`,
    )!;
  const button = (label: string) =>
    view.container.querySelector<HTMLButtonElement>(
      `button[aria-label="${label}"]`,
    )!;

  return { ...view, preview, point, button };
};

describe("RotateTools", () => {
  it("previews a preset angle and swaps the frame at 90 degrees", () => {
    const { preview, point, getByText } = renderRotate();

    fireEvent.click(point(90));

    expect(preview().style.aspectRatio).toBe("600 / 800");
    expect(getByText("90°")).toBeTruthy();
  });

  it("adds the rotation to the history with swapped sizes on save", () => {
    const { point, button, getByText } = renderRotate();

    expect(button("Save").disabled).toBe(true);
    fireEvent.click(point(270));
    fireEvent.click(button("Save"));

    // the selector turned the short way round, so the stored angle is -90
    expect(getByText("600x800:rotate:-90")).toBeTruthy();
  });

  it("keeps the committed angle editable when reopened", () => {
    const { point, button, getByText } = renderRotate();

    fireEvent.click(point(45));
    fireEvent.click(button("Save"));
    fireEvent.click(getByText("Open rotate"));

    expect(getByText("45°")).toBeTruthy();
    expect(button("Save").disabled).toBe(true);
  });

  it("restores the previous preview on close", () => {
    const { preview, point, button, getByText } = renderRotate();

    fireEvent.click(point(90));
    fireEvent.click(button("Close"));

    expect(preview().style.aspectRatio).toBe("800 / 600");
    expect(getByText("800x600:initial:-")).toBeTruthy();
  });
});
