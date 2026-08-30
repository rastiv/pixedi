import { useRef } from "react";
import {
  useCropInteraction,
  CropPointers,
  CropLines,
  CropPointer,
  CropInfo,
} from ".";
import { usePixediContext } from "../provider/usePixediContext";
import { Preview } from "../preview";
import { useMobile } from "../hooks";
import styles from "./Crop.module.css";

export const CropInteractBox = () => {
  const { getLastHistoryItem } = usePixediContext();
  const mobile = useMobile();
  const boxRef = useRef<HTMLDivElement>(null);

  const { handleCropStart, initialCrop } = useCropInteraction({ boxRef });

  const { width, height } = getLastHistoryItem();
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
            <>
              <CropPointers onMouseDown={handleCropStart} />
              <CropInfo />
            </>
          )}
        </div>
      </div>
    </>
  );
};
