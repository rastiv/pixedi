import { useRef } from "react";
import { useImageEditorContext } from "../provider/useImageEditorContext";
import { ResizeTools } from "../resize";
import { CropTools } from "../crop";
import { CropInteractBox } from "../crop";
import { FlipTools } from "../flip";
import styles from "./frame.module.css";
import rootStyles from "../index.module.css";

export const Frame = () => {
  const { getLastHistoryItem, currentAction } = useImageEditorContext();
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { width, height, base64 } = getLastHistoryItem();

  const isCrop = currentAction?.name === "crop";
  const isResize = currentAction?.name === "resize";
  const isFlip = currentAction?.name === "flip";
  const isFade = isCrop;

  const handleResizing = (scale: number) => {
    if (frameRef.current) {
      frameRef.current.style.transform = `scale(${scale / 100})`;
    }
  };

  const frameClassName = `${styles.frame} ${isFade ? rootStyles.mask : ""}`;
  const imageClassName = `${styles.frameImage} ${
    isFade ? styles.frameImageFaded : ""
  }`;

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
      {isResize && <ResizeTools onResizing={handleResizing} />}
      {isCrop && <CropTools />}
      {isFlip && <FlipTools />}
    </div>
  );
};
