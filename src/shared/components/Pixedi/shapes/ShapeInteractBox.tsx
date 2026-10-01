// import { useRef } from "react";
// import { usePixediContext } from "../provider/usePixediContext";
import { useId } from "react";
import { Preview } from "../preview";
import { shapes } from "../constants/";
// import { shapes } from "../constants";
// import styles from "./Shape.modules.css";

export const ShapeInteractBox = () => {
  const maskId = useId();
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <mask id={maskId} maskContentUnits="objectBoundingBox">
            {/* <path
              d={shapes[currentShape]}
              fill={isOutline ? "transparent" : "white"}
              stroke="white"
              // Базирано на превю контейнера от 400px за коректна визуална дебелина в браузъра
              strokeWidth={isOutline ? strokeWidth / 400 : 0}
              strokeLinejoin="round"
              style={{ transition: "all 0.2s ease" }}
            /> */}
            <path
              d={shapes["shield"]}
              fill={"transparent"}
              stroke="white"
              // Базирано на превю контейнера от 400px за коректна визуална дебелина в браузъра
              strokeWidth={10 / 400}
              strokeLinejoin="round"
              style={{ transition: "all 0.2s ease" }}
            />
          </mask>
        </defs>
      </svg>
      {/* <Preview isClipped style={{ clipPath: `url(#circle-clip)` }} /> */}
      <Preview
        isClipped
        style={{ mask: `url(#${maskId})`, WebkitMask: `url(#${maskId})` }}
      />
    </>
  );
};
