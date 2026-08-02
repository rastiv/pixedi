import { useEffect, useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { ResizeTools } from "../resize";
import { CropTools, CropInteractBox } from "../crop";
import { FlipTools } from "../flip";
import { RotateTools } from "../rotate";
import styles from "./frame.module.css";
import rootStyles from "../index.module.css";

export const Frame = () => {
  const { getLastHistoryItem, currentAction } = usePixediContext();
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { width, height, base64, ext } = getLastHistoryItem();

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
      frameRef.current.style.background = "var(--color-black)";
      frameRef.current.style.transform = "";
    }
    if (imageRef.current) {
      imageRef.current.style.transform = "";
      const supportAlpha = ["png", "webp", "gif"].includes(ext);
      imageRef.current.style.background = supportAlpha
        ? "transparent"
        : "var(--color-white)";
    }
  }, [currentAction, height, width, ext]);

  return (
    <div className={frameClassName}>
      <div
        ref={frameRef}
        style={{
          aspectRatio: `${width} / ${height}`,
        }}
        className={styles.framePreview}
      >
        <img
          ref={imageRef}
          src={base64}
          alt="Image"
          className={imageClassName}
        />
        {isCrop && <CropInteractBox key={currentAction?.args?.id} />}
      </div>
      {isResize && <ResizeTools frameRef={frameRef} />}
      {isCrop && <CropTools />}
      {isFlip && <FlipTools frameRef={frameRef} />}
      {isRotate && <RotateTools frameRef={frameRef} imageRef={imageRef} />}
    </div>
  );
};
