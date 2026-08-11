import { useEffect, useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { ResizeTools } from "../resize";
import { CropTools, CropInteractBox } from "../crop";
import { FlipTools } from "../flip";
import { RotateTools } from "../rotate";
import styles from "./frame.module.css";
import rootStyles from "../index.module.css";
import { RotateBox } from "../rotate/RotateBox";
import { Preview } from "../preview";

export const Frame = () => {
  const { getLastHistoryItem, currentAction, isAlpha } = usePixediContext();
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { width, height, base64 } = getLastHistoryItem();

  const isCrop = currentAction?.name === "crop";
  const isResize = currentAction?.name === "resize";
  const isFlip = currentAction?.name === "flip";
  const isRotate = currentAction?.name === "rotate";
  const isFade = isCrop;

  const frameClassName = `${styles.frame} ${isFade ? rootStyles.mask : ""}`;
  const imageClassName = `${styles.frameImage} ${
    isFade ? styles.frameImageFaded : ""
  }`;

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
      <Preview />
      {/* <div ref={frameRef} className={styles.framePreview}>
        <img
          ref={imageRef}
          src={base64}
          alt="Image"
          className={imageClassName}
        />
        {isCrop && <CropInteractBox key={currentAction?.args?.id} />}
        {isRotate && isAlpha() && <RotateBox />}
      </div>
      }
      {isCrop && <CropTools />}
      {isFlip && <FlipTools frameRef={frameRef} />}
      {isRotate && <RotateTools frameRef={frameRef} imageRef={imageRef} />} */}
      {isResize && <ResizeTools />}
    </div>
  );
};
