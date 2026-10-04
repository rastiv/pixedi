import type { RefObject } from "react";
import { CropLines } from "./CropLines";
import { CropPointer } from "./CropPointer";
import { CropPointers } from "./CropPointers";
import { CropInfo } from "./CropInfo";
import { usePixediContext } from "../provider/usePixediContext";
import { useMobile } from "../hooks";
import type { CropRect, Direction } from "../types";
import styles from "./Crop.module.css";

type CropBoxProps = {
  boxRef: RefObject<HTMLDivElement | null>;
  rect: CropRect;
  onCropStart: (
    e: React.MouseEvent | React.TouchEvent,
    type: Direction,
    cursor?: string,
  ) => void;
};

export const CropBox = ({ boxRef, rect, onCropStart }: CropBoxProps) => {
  const { getLastHistoryItem } = usePixediContext();
  const mobile = useMobile();
  const { width, height } = getLastHistoryItem();
  const { x, y, w, h } = rect;

  return (
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
          <CropPointer onMouseDown={onCropStart} />
        ) : (
          <>
            <CropPointers onMouseDown={onCropStart} />
            <CropInfo />
          </>
        )}
      </div>
    </div>
  );
};
