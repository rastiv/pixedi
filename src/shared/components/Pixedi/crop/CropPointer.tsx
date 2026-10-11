import type { Direction } from "../types";
import styles from "./Crop.module.css";

type CropPointerProps = {
  onPointerDown: (type: Direction, cursor?: string) => void;
};

export const CropPointer = ({ onPointerDown }: CropPointerProps) => {
  return (
    <div className={styles.mobileBorder}>
      <div
        className={styles.mobilePointer}
        onPointerDown={() => onPointerDown("br", "nwse")}
      />
    </div>
  );
};
