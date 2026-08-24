import { useEffect, useRef, useMemo } from "react";
import { useCropInteraction, CropPointers, CropLines, CropPointer } from ".";
import { usePixediContext } from "../provider/usePixediContext";
import { getInitalCrop } from "../utils/crop";
import { Preview } from "../preview";
import { useMobile } from "../hooks";
import { ActionName } from "../types";
import { emitClipPathUpdate } from "../eventBus";
import styles from "./Crop.module.css";

export const CropInteractBox = () => {
  const { currentAction, getLastHistoryItem, eventBus } = usePixediContext();
  const mobile = useMobile();
  const boxRef = useRef<HTMLDivElement>(null);

  const { handleCropStart } = useCropInteraction({ boxRef });

  const { width, height } = getLastHistoryItem();
  const ratio =
    currentAction?.name === ActionName.CROP ? currentAction.args.ratio : 1;

  const initialCrop = useMemo(
    () => getInitalCrop(ratio, width, height),
    [ratio, width, height],
  );
  const { x, y, w, h } = initialCrop;

  useEffect(() => {
    emitClipPathUpdate(eventBus, initialCrop);
  }, [initialCrop, eventBus]);

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
