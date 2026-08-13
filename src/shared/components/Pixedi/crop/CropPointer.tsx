import React from "react";
import type { Direction } from "../types";
import styles from "./crop.module.css";

type CropPointerProps = {
  onMouseDown: (
    e: React.MouseEvent | React.TouchEvent,
    type: Direction,
    cursor?: string,
  ) => void;
};

export const CropPointer = ({ onMouseDown }: CropPointerProps) => {
  return (
    <div className={styles.mobileBorder}>
      <div
        className={styles.mobilePointer}
        onTouchStart={(e) => onMouseDown(e, "br", "nwse")}
      />
    </div>
  );
};
