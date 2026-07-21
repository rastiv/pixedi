import type { Direction } from "../types";

type CropBordersProps = {
  onMouseDown: (e: React.MouseEvent, type: Direction, cursor: string) => void;
};

export const CropBorders = ({ onMouseDown }: CropBordersProps) => {
  return (
    <>
      <span
        className="crop-b crop-b-t"
        onMouseDown={(e: React.MouseEvent) => onMouseDown(e, "t", "ns")}
      />
      <span
        className="crop-b crop-b-r"
        onMouseDown={(e) => onMouseDown(e, "r", "ew")}
      />
      <span
        className="crop-b crop-b-b"
        onMouseDown={(e) => onMouseDown(e, "b", "ns")}
      />
      <span
        className="crop-b crop-b-l"
        onMouseDown={(e) => onMouseDown(e, "l", "ew")}
      />
    </>
  );
};
