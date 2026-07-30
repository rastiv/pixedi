import type { Direction } from "../types";
import styles from "./crop.module.css";

type CropBordersProps = {
  onMouseDown: (e: React.MouseEvent, type: Direction, cursor: string) => void;
};

export const CropBorders = ({ onMouseDown }: CropBordersProps) => {
  return (
    <>
      <span
        className={`${styles.cropBorder} ${styles.cropBorderTop}`}
        onMouseDown={(e: React.MouseEvent) => onMouseDown(e, "t", "ns")}
      />
      <span
        className={`${styles.cropBorder} ${styles.cropBorderRight}`}
        onMouseDown={(e) => onMouseDown(e, "r", "ew")}
      />
      <span
        className={`${styles.cropBorder} ${styles.cropBorderBottom}`}
        onMouseDown={(e) => onMouseDown(e, "b", "ns")}
      />
      <span
        className={`${styles.cropBorder} ${styles.cropBorderLeft}`}
        onMouseDown={(e) => onMouseDown(e, "l", "ew")}
      />
    </>
  );
};
