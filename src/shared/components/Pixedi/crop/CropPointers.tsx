import type { Direction } from "../types";
import styles from "./Crop.module.css";

type CropPointersProps = {
  onPointerDown: (type: Direction, cursor: string) => void;
};

export const CropPointers = ({ onPointerDown }: CropPointersProps) => {
  return (
    <>
      <div
        className={`${styles.pointer} ${styles.pointerTopLeft}`}
        onPointerDown={() => onPointerDown("tl", "nwse")}
      />
      <div
        className={`${styles.pointer} ${styles.pointerTopRight}`}
        onPointerDown={() => onPointerDown("tr", "nesw")}
      />
      <div
        className={`${styles.pointer} ${styles.pointerBottomRight}`}
        onPointerDown={() => onPointerDown("br", "nwse")}
      />
      <div
        className={`${styles.pointer} ${styles.pointerBottomLeft}`}
        onPointerDown={() => onPointerDown("bl", "nesw")}
      />
    </>
  );
};
