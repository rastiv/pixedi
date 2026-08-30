import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PixediProvider } from "../provider/PixediProvider";
import { usePixediContext } from "../provider/usePixediContext";
import { Preview } from "../preview";
import { ResizeTools } from "./ResizeTools";

afterEach(cleanup);

const ResizeState = () => {
  const { history } = usePixediContext();
  const item = history.items.at(history.pointer)!;
  return <output>{`${item.width}x${item.height}:${item.action.name}`}</output>;
};

const renderResize = () =>
  render(
    <PixediProvider
      mimeType="png"
      previewUrl="data:image/png;base64,initial"
      originalBlob={new Blob([], { type: "image/png" })}
      width={800}
      height={600}
      settings={{}}
      isAlpha={false}
    >
      <div data-testid="frame">
        <Preview />
        <ResizeTools />
      </div>
      <ResizeState />
    </PixediProvider>,
  );

const getPreview = (container: HTMLElement) =>
  container.querySelector("img")!.parentElement!.parentElement!.parentElement!;

const getInputs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLInputElement>("input"));

describe("ResizeTools", () => {
  it("keeps dimensions proportional and clamps typed values", () => {
    const { container } = renderResize();
    const [width, height] = getInputs(container);

    fireEvent.change(width, { target: { value: "2000" } });
    fireEvent.blur(width);

    expect(width.value).toBe("1600");
    expect(height.value).toBe("1200");
    expect(getPreview(container).style.transform).toBe("scale(2)");
  });

  it("resizes from wheel and touch gestures inside the frame", () => {
    const { container, getByTestId } = renderResize();
    const frame = getByTestId("frame");
    const [width, height] = getInputs(container);

    fireEvent.wheel(frame, { deltaY: -1 });
    expect(width.value).toBe("816");
    expect(height.value).toBe("612");

    fireEvent.touchStart(frame, { touches: [{ clientY: 100 }] });
    fireEvent.touchMove(frame, { touches: [{ clientY: 80 }] });
    expect(width.value).toBe("832");
    expect(height.value).toBe("624");
  });

  it("ignores wheel gestures outside the frame", () => {
    const { container } = renderResize();
    const [width, height] = getInputs(container);

    fireEvent.wheel(document.body, { deltaY: -1 });

    expect(width.value).toBe("800");
    expect(height.value).toBe("600");
  });

  it("saves the resized dimensions to history", () => {
    const { container, getByText } = renderResize();
    const [width] = getInputs(container);

    fireEvent.change(width, { target: { value: "1200" } });
    fireEvent.blur(width);
    fireEvent.click(container.querySelectorAll("button")[0]);

    expect(getByText("1200x900:resize")).toBeTruthy();
    expect(getPreview(container).style.transform).toBe("scale(1)");
  });
});
