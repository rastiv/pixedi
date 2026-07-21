import React from "react";
import type { Direction } from "../types";

type CropPointerProps = {
  onMouseDown: (
    e: React.MouseEvent | React.TouchEvent,
    type: Direction,
    cursor?: string,
  ) => void;
};

export const CropPointer = ({ onMouseDown }: CropPointerProps) => {
  return (
    <div className="crop-p-b">
      <div
        className="crop-p-p"
        onTouchStart={(e) => onMouseDown(e, "br", "nwse")}
      />
    </div>
  );
};
