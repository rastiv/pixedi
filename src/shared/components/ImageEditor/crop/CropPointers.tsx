import type { Direction } from "../types";

type CropPointersProps = {
  onMouseDown: (e: React.MouseEvent, type: Direction, cursor: string) => void;
};

export const CropPointers = ({ onMouseDown }: CropPointersProps) => {
  return (
    <>
      <span
        className="crop-ps crop-ps-tl"
        onMouseDown={(e) => onMouseDown(e, "tl", "nwse")}
      />
      <span
        className="crop-ps crop-ps-t"
        onMouseDown={(e) => onMouseDown(e, "t", "ns")}
      />
      <span
        className="crop-ps crop-ps-tr"
        onMouseDown={(e) => onMouseDown(e, "tr", "nesw")}
      />
      <span
        className="crop-ps crop-ps-r"
        onMouseDown={(e) => onMouseDown(e, "r", "ew")}
      />
      <span
        className="crop-ps crop-ps-br"
        onMouseDown={(e) => onMouseDown(e, "br", "nwse")}
      />
      <span
        className="crop-ps crop-ps-b"
        onMouseDown={(e) => onMouseDown(e, "b", "ns")}
      />
      <span
        className="crop-ps crop-ps-bl"
        onMouseDown={(e) => onMouseDown(e, "bl", "nesw")}
      />
      <span
        className="crop-ps crop-ps-l"
        onMouseDown={(e) => onMouseDown(e, "l", "ew")}
      />
    </>
  );
};
