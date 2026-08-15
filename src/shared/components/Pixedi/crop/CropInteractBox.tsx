import { useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { useCropInteraction, CropPointers, CropLines, CropPointer } from ".";
import { getInitalCrop } from "../utils";
import { Preview } from "../preview";
import { useMobile } from "../hooks";
import { ActionName, type CropRect } from "../types";
import styles from "./crop.module.css";

export const CropInteractBox = () => {
  const { currentAction, setCurrentAction, getLastHistoryItem } =
    usePixediContext();
  const mobile = useMobile();
  const boxRef = useRef<HTMLDivElement>(null);

  const onCropUpdate = (crop: CropRect) => {
    if (!currentAction || currentAction.name !== ActionName.CROP) {
      return;
    }
    setCurrentAction({
      ...currentAction,
      args: {
        ...currentAction.args,
        crop,
      },
    });
  };

  const { handleCropStart } = useCropInteraction({
    boxRef,
    onCropUpdate,
  });

  if (!currentAction || currentAction.name !== ActionName.CROP) {
    return null;
  }

  const { width, height } = getLastHistoryItem();
  const { x, y, w, h } = getInitalCrop(currentAction.args.ratio, width, height);

  return (
    <>
      <Preview
        isClipped={true}
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
