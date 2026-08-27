import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PixediProvider } from "../provider/PixediProvider";
import { usePixediContext } from "../provider/usePixediContext";
import { Preview } from "./Preview";

const SetRotation = ({ degrees }: { degrees: number }) => {
  const { setCurrentAction } = usePixediContext();

  return (
    <button
      type="button"
      onClick={() => setCurrentAction({ name: "rotate", args: { degrees } })}
    >
      Set rotation
    </button>
  );
};

const PreviewControls = () => {
  const { setCurrentAction, eventBus } = usePixediContext();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setCurrentAction({
            name: "resize",
            args: { width: 1200, height: 900 },
          });
          eventBus.dispatchEvent(
            new CustomEvent<number>("resize-update", { detail: 150 }),
          );
        }}
      >
        Resize
      </button>
      <button
        type="button"
        onClick={() =>
          setCurrentAction({
            name: "crop",
            args: { id: "1:1", ratio: 1, isFree: false },
          })
        }
      >
        Crop
      </button>
    </>
  );
};

const renderPreview = (degrees: number) => {
  const { container } = render(
    <PixediProvider
      mimeType="png"
      previewUrl="data:image/png;base64,initial"
      originalBlob={new Blob([], { type: "image/png" })}
      width={800}
      height={600}
      settings={{}}
      isAlpha={false}
    >
      <Preview />
      <SetRotation degrees={degrees} />
    </PixediProvider>,
  );

  fireEvent.click(container.querySelector("button")!);

  const image = container.querySelector("img")!;
  const rotateLayer = image.parentElement?.parentElement;
  const preview = rotateLayer?.parentElement;

  expect(rotateLayer).not.toBeNull();
  expect(preview).not.toBeNull();

  return { preview: preview!, rotateLayer: rotateLayer! };
};

describe("Preview resize geometry", () => {
  it("resets an unsaved resize scale when another action is selected", () => {
    const { container, getByText } = render(
      <PixediProvider
        mimeType="png"
        previewUrl="data:image/png;base64,initial"
        originalBlob={new Blob([], { type: "image/png" })}
        width={800}
        height={600}
        settings={{}}
        isAlpha={false}
      >
        <Preview />
        <PreviewControls />
      </PixediProvider>,
    );
    const preview =
      container.querySelector("img")!.parentElement!.parentElement!
        .parentElement!;

    fireEvent.click(getByText("Resize"));
    expect(preview.style.transform).toBe("scale(1.5)");

    fireEvent.click(getByText("Crop"));
    expect(preview.style.transform).toBe("scale(1)");
    expect(preview.style.transition).toBe("none");
    expect(
      Array.from(preview.querySelectorAll<HTMLElement>("*")).every(
        (element) => element.style.transition === "none",
      ),
    ).toBe(true);
  });
});

describe("Preview rotation geometry", () => {
  it.each([
    { degrees: 0, rotation: 0, viewWidth: 800, viewHeight: 600 },
    { degrees: 90, rotation: 90, viewWidth: 600, viewHeight: 800 },
    { degrees: 180, rotation: 180, viewWidth: 800, viewHeight: 600 },
    // degrees are passed through unnormalized so CSS rotates the short way
    { degrees: -90, rotation: -90, viewWidth: 600, viewHeight: 800 },
    { degrees: 360, rotation: 360, viewWidth: 800, viewHeight: 600 },
  ])(
    "uses orientation-aware dimensions at $degrees degrees",
    ({ degrees, rotation, viewWidth, viewHeight }) => {
      const { preview, rotateLayer } = renderPreview(degrees);

      expect(preview.style.aspectRatio).toBe(`${viewWidth} / ${viewHeight}`);
      expect(parseFloat(rotateLayer.style.width)).toBeCloseTo(
        (800 / viewWidth) * 100,
      );
      expect(parseFloat(rotateLayer.style.height)).toBeCloseTo(
        (600 / viewHeight) * 100,
      );
      expect(rotateLayer.style.transform).toBe(
        `translate(-50%, -50%) rotate(${rotation}deg)`,
      );
    },
  );
});
