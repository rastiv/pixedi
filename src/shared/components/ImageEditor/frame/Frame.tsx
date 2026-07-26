import { useRef } from "react";
import { useImageEditorContext } from "../provider/useImageEditorContext";
import { Crop } from "../crop";
import { CropTools } from "../crop";
import styles from "./frame.module.css";
import rootStyles from "../index.module.css";
import { ResizeTools } from "../resize";

export const Frame = () => {
  const { getLastHistoryItem, currentAction } = useImageEditorContext();
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { width, height, base64 } = getLastHistoryItem();

  const isCrop = currentAction?.name === "crop";
  const isResize = currentAction?.name === "resize";
  const isFade = isCrop || isResize;

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
        {isCrop && <Crop key={currentAction?.args?.id} />}
      </div>
      {isResize && <ResizeTools onResizing={handleResizing} />}
      {isCrop && <CropTools />}
    </div>
  );
};
