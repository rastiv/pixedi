import { useRef } from "react";
import { useCropInteraction, CropBox } from ".";
import { Preview } from "../preview";

export const CropInteractBox = () => {
  const boxRef = useRef<HTMLDivElement>(null);

  const { handleCropStart, initialCrop } = useCropInteraction({ boxRef });
  const { x, y, w, h } = initialCrop;

  return (
    <>
      <Preview
        isClipped
        style={{ clipPath: `xywh(${x}% ${y}% ${w}% ${h}%)` }}
      />
      <CropBox
        boxRef={boxRef}
        rect={initialCrop}
        onCropStart={handleCropStart}
      />
    </>
  );
};
