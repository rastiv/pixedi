import { useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { Preview } from "../preview";
import { CropBox, useCropInteraction } from "../crop";
import { SHAPE_BORDER } from "../constants";
import { getShapeMaskStyle } from "../utils/shape";
import { ActionName, type ShapeMask } from "../types";

export const ShapeInteractBox = () => {
  const { currentAction } = usePixediContext();
  const boxRef = useRef<HTMLDivElement>(null);
  const { handleCropStart, initialCrop } = useCropInteraction({ boxRef });
  const { x, y, w, h } = initialCrop;

  const mask: ShapeMask =
    currentAction?.name === ActionName.SHAPES
      ? currentAction.args
      : { shape: "heart", outlined: false, border: SHAPE_BORDER };

  return (
    <>
      <Preview
        isClipped
        isMasked
        style={{
          clipPath: `xywh(${x}% ${y}% ${w}% ${h}%)`,
          ...getShapeMaskStyle(mask, initialCrop),
        }}
      />
      <CropBox
        boxRef={boxRef}
        rect={initialCrop}
        onCropStart={handleCropStart}
      />
    </>
  );
};
