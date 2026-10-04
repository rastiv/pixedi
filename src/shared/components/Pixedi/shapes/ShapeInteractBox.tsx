import { useId } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { Preview } from "../preview";
import { shapes } from "../constants/";
import { ActionName } from "../types";
// import { shapes } from "../constants";
// import styles from "./Shape.modules.css";

export const ShapeInteractBox = () => {
  const { currentAction } = usePixediContext();
  const isShapes = currentAction?.name === ActionName.SHAPES;
  const shape = (isShapes && currentAction?.args?.shape) || "heart";
  const outlined = (isShapes && currentAction?.args?.outlined) || false;
  const border = (isShapes && currentAction?.args?.border) || 0.075;
  const maskId = useId();

  const aspectRatio = 4014 / 6099;
  // const aspectRatio = 3408 / 2272;
  console.log(shape, outlined, border);

  const path = shapes[shape];

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <mask id={maskId} maskContentUnits="objectBoundingBox">
            <path
              d={path}
              fill={outlined ? "transparent" : "white"}
              transform={`scale(${aspectRatio}, 1)`}
              stroke="white"
              strokeWidth={border}
              style={{ transition: "all 0.2s ease" }}
            />
          </mask>
        </defs>
      </svg>
      <Preview
        isClipped
        style={{ mask: `url(#${maskId})`, WebkitMask: `url(#${maskId})` }}
      />
    </>
  );
};
