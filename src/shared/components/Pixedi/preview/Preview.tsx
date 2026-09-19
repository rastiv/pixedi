import { usePreview } from "./usePreview";
import styles from "./Preview.module.css";

type PreviewType = {
  isClipped?: boolean;
  isFilter?: boolean;
  faded?: boolean;
  style?: React.CSSProperties;
};

export const Preview = ({
  isClipped,
  isFilter,
  faded,
  style = {},
}: PreviewType) => {
  const {
    previewRef,
    imageRef,
    previewUrl,
    box,
    boxWidth,
    boxHeight,
    viewWidth,
    viewHeight,
    rotation,
    flipH,
    flipV,
    filters,
  } = usePreview({ isClipped, isFilter });

  const previewClassName = `${styles.preview} ${faded ? styles.faded : ""}`;

  return (
    <div
      ref={previewRef}
      className={previewClassName}
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
            ref={imageRef}
            className={styles.image}
            src={previewUrl}
            alt="Preview Image"
            style={{
              width: `${(1 / box.w) * 100}%`,
              height: `${(1 / box.h) * 100}%`,
              left: `${-(box.x / box.w) * 100}%`,
              top: `${-(box.y / box.h) * 100}%`,
              filter: filters.join(" "),
            }}
          />
        </div>
      </div>
    </div>
  );
};
