import type { Direction } from "../types";
import styles from "./Crop.module.css";

type CropPointersProps = {
  onMouseDown: (e: React.MouseEvent, type: Direction, cursor: string) => void;
};

export const CropPointers = ({ onMouseDown }: CropPointersProps) => {
  return (
    <>
      <div
        className={`${styles.pointer} ${styles.pointerTopLeft}`}
        onMouseDown={(e) => onMouseDown(e, "tl", "nwse")}
      />
      <div
        className={`${styles.pointer} ${styles.pointerTopRight}`}
        onMouseDown={(e) => onMouseDown(e, "tr", "nesw")}
      />
      <div
        className={`${styles.pointer} ${styles.pointerBottomRight}`}
        onMouseDown={(e) => onMouseDown(e, "br", "nwse")}
      />
      <div
        className={`${styles.pointer} ${styles.pointerBottomLeft}`}
        onMouseDown={(e) => onMouseDown(e, "bl", "nesw")}
      />
    </>
  );
};
