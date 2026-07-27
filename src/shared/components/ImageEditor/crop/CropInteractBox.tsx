import { useRef } from "react";
import { useImageEditorContext } from "../provider/useImageEditorContext";
import {
  CropBorders,
  useCropInteraction,
  CropPointers,
  CropLines,
  CropPointer,
} from ".";
import { getInitalCrop } from "../utils";
import { useMobile } from "../hooks";
import styles from "./crop.module.css";

export const CropInteractBox = () => {
  const { getCurrentAction, getLastHistoryItem } = useImageEditorContext();
  const currentAction = getCurrentAction();
  const mobile = useMobile();

  const imgRef = useRef<HTMLImageElement>(null);
  const cropRef = useRef<HTMLDivElement>(null);

  const { handleCropStart } = useCropInteraction({
    imgRef,
    cropRef,
  });

  if (!currentAction || currentAction.name !== "crop") {
    return null;
  }

  const { width, height, base64 } = getLastHistoryItem();
  const { x, y, w, h } = getInitalCrop(currentAction.args.ratio, width, height);

  return (
    <>
      <img
        ref={imgRef}
        src={base64}
        alt="Image"
        className={styles.cropImage}
        style={{ clipPath: `xywh(${x}% ${y}% ${w}% ${h}%)` }}
      />
      <div
        ref={cropRef}
        className={styles.cropBox}
        style={{ width: `${w}%`, height: `${h}%`, top: `${y}%`, left: `${x}%` }}
      >
        <CropLines />
        {mobile ? (
          <CropPointer onMouseDown={handleCropStart} />
        ) : (
          <>
            <CropBorders onMouseDown={handleCropStart} />
            <CropPointers onMouseDown={handleCropStart} />
          </>
        )}
      </div>
    </>
  );
};
