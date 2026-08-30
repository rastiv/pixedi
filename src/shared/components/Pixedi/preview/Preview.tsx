import { usePreview } from "./usePreview";
import styles from "./Preview.module.css";

type PreviewType = {
  isClipped?: boolean;
  style?: React.CSSProperties;
};

export const Preview = ({ isClipped, style = {} }: PreviewType) => {
  const {
    previewRef,
    previewUrl,
    box,
    boxWidth,
    boxHeight,
    viewWidth,
    viewHeight,
    rotation,
    flipH,
    flipV,
  } = usePreview({ isClipped });

  return (
    <div
      ref={previewRef}
      className={styles.preview}
      style={{
        aspectRatio: `${viewWidth} / ${viewHeight}`,
        ...style,
      }}
    >
      <div
        className={styles.rotate}
        style={{
          width: `${(boxWidth / viewWidth) * 100}%`,
          height: `${(boxHeight / viewHeight) * 100}%`,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        }}
      >
        <div
          className={styles.flip}
          style={{
            transform: `scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
          }}
        >
          <img
            className={styles.image}
            src={previewUrl}
            alt="Preview Image"
            style={{
              width: `${(1 / box.w) * 100}%`,
              height: `${(1 / box.h) * 100}%`,
              left: `${-(box.x / box.w) * 100}%`,
              top: `${-(box.y / box.h) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
