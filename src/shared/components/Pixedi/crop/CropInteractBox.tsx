import { useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { useCropInteraction, CropPointers, CropLines, CropPointer } from ".";
import { getInitalCrop } from "../utils";
import { Preview } from "../preview";
import { useMobile } from "../hooks";
import styles from "./crop.module.css";

export const CropInteractBox = () => {
  const { currentAction, getLastHistoryItem } = usePixediContext();
  const mobile = useMobile();

  const cropRef = useRef<HTMLDivElement>(null);

  const { handleCropStart } = useCropInteraction({
    cropRef,
  });

  if (!currentAction || currentAction.name !== "crop") {
    return null;
  }

  const { width, height } = getLastHistoryItem();
  const { x, y, w, h } = getInitalCrop(currentAction.args.ratio, width, height);

  return (
    <>
      <Preview style={{ clipPath: `xywh(${x}% ${y}% ${w}% ${h}%)` }} />
      <div
        className={styles.wrapper}
        style={{
          aspectRatio: `${width} / ${height}`,
        }}
      >
        <div
          ref={cropRef}
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
