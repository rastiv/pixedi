import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PixediProvider } from "../provider/PixediProvider";
import { usePixediContext } from "../provider/usePixediContext";
import { Preview } from "./Peview";

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

const renderPreview = (degrees: number) => {
  const { container } = render(
    <PixediProvider
      extension="png"
      reducedBase64="data:image/png;base64,initial"
      originalBase64="data:image/png;base64,initial"
      originalSize={1234}
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

describe("Preview rotation geometry", () => {
  it.each([
    { degrees: 0, rotation: 0, viewWidth: 800, viewHeight: 600 },
    { degrees: 90, rotation: 90, viewWidth: 600, viewHeight: 800 },
    { degrees: 180, rotation: 180, viewWidth: 800, viewHeight: 600 },
    { degrees: -90, rotation: 270, viewWidth: 600, viewHeight: 800 },
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
