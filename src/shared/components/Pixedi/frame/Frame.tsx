import { useEffect, useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { ResizeTools } from "../resize";
import { CropTools, CropInteractBox } from "../crop";
import { FlipTools } from "../flip";
import { RotateTools } from "../rotate";
import { Preview } from "../preview";
import { ActionName } from "../types";
import styles from "./Frame.module.css";
import rootStyles from "../index.module.css";

export const Frame = () => {
  const { getLastHistoryItem, currentAction, isAlpha } = usePixediContext();
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { width, height } = getLastHistoryItem();

  const isCrop = currentAction?.name === ActionName.CROP;
  const isResize = currentAction?.name === ActionName.RESIZE;
  const isFlip = currentAction?.name === ActionName.FLIP;
  const isRotate = currentAction?.name === ActionName.ROTATE;
  const isFade = isCrop;

  const frameClassName = `${styles.frame} ${isFade ? rootStyles.mask : ""}`;

  useEffect(() => {
    if (frameRef.current) {
      frameRef.current.style.aspectRatio = `${width} / ${height}`;
      frameRef.current.style.background = isAlpha
        ? "transparent"
        : "var(--color-black)";
      frameRef.current.style.transform = "";
    }
    if (imageRef.current) {
      imageRef.current.style.transform = "";
      imageRef.current.style.background = "transparent";
    }
  }, [currentAction, isAlpha, height, width]);

  return (
    <div className={frameClassName}>
      <Preview style={isCrop ? { opacity: 0.4 } : {}} />
      {isCrop && <CropInteractBox key={currentAction?.args?.id} />}
      {isResize && <ResizeTools />}
      {isCrop && <CropTools />}
      {isFlip && <FlipTools />}
      {isRotate && <RotateTools />}
    </div>
  );
};
