import { useRef } from "react";
import { useCropInteraction, CropPointers, CropLines, CropPointer } from ".";
import { usePixediContext } from "../provider/usePixediContext";
import { getInitalCrop } from "../utils";
import { Preview } from "../preview";
import { useMobile } from "../hooks";
import { ActionName } from "../types";
import { emitClipPathUpdate } from "../eventBus";
import styles from "./crop.module.css";

export const CropInteractBox = () => {
  const { currentAction, getLastHistoryItem } = usePixediContext();
  const mobile = useMobile();
  const boxRef = useRef<HTMLDivElement>(null);

  const { handleCropStart } = useCropInteraction({
    boxRef,
  });

  if (!currentAction || currentAction.name !== ActionName.CROP) {
    return null;
  }

  const { width, height } = getLastHistoryItem();
  const initialCrop = getInitalCrop(currentAction.args.ratio, width, height);
  const { x, y, w, h } = initialCrop;

  return (
    <>
      <Preview
        isClipped
        style={{ clipPath: `xywh(${x}% ${y}% ${w}% ${h}%)` }}
      />
      <div
        className={styles.wrapper}
        style={{
          aspectRatio: `${width} / ${height}`,
        }}
      >
        <div
          ref={boxRef}
          className={styles.box}
          style={{
            width: `${w}%`,
            height: `${h}%`,
            top: `${y}%`,
            left: `${x}%`,
          }}
        >
          <CropLines />
          {mobile ? (
            <CropPointer onMouseDown={handleCropStart} />
          ) : (
            <CropPointers onMouseDown={handleCropStart} />
          )}
        </div>
      </div>
    </>
  );
};
