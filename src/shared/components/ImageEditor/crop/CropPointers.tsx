import type { Direction } from "../types";
import styles from "./crop.module.css";

type CropPointersProps = {
  onMouseDown: (e: React.MouseEvent, type: Direction, cursor: string) => void;
};

export const CropPointers = ({ onMouseDown }: CropPointersProps) => {
  return (
    <>
      <span
        className={`${styles.cropPointer} ${styles.cropPointerTopLeft}`}
        onMouseDown={(e) => onMouseDown(e, "tl", "nwse")}
      />
      <span
        className={`${styles.cropPointer} ${styles.cropPointerTop}`}
        onMouseDown={(e) => onMouseDown(e, "t", "ns")}
      />
      <span
        className={`${styles.cropPointer} ${styles.cropPointerTopRight}`}
        onMouseDown={(e) => onMouseDown(e, "tr", "nesw")}
      />
      <span
        className={`${styles.cropPointer} ${styles.cropPointerRight}`}
        onMouseDown={(e) => onMouseDown(e, "r", "ew")}
      />
      <span
        className={`${styles.cropPointer} ${styles.cropPointerBottomRight}`}
        onMouseDown={(e) => onMouseDown(e, "br", "nwse")}
      />
      <span
        className={`${styles.cropPointer} ${styles.cropPointerBottom}`}
        onMouseDown={(e) => onMouseDown(e, "b", "ns")}
      />
      <span
        className={`${styles.cropPointer} ${styles.cropPointerBottomLeft}`}
        onMouseDown={(e) => onMouseDown(e, "bl", "nesw")}
      />
      <span
        className={`${styles.cropPointer} ${styles.cropPointerLeft}`}
        onMouseDown={(e) => onMouseDown(e, "l", "ew")}
      />
    </>
  );
};
