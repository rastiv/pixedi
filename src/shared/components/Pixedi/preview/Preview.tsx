import { usePreview } from "./usePreview";
import { usePixediContext } from "../provider/usePixediContext";
import { getShapeMaskStyle } from "../utils/shape";
import type { Preview as PreviewData } from "../utils/preview";
import styles from "./Preview.module.css";

type PreviewType = {
  isClipped?: boolean;
  isFilter?: boolean;
  isMasked?: boolean;
  faded?: boolean;
  style?: React.CSSProperties;
};

type PreviewLayerProps = {
  layers: PreviewData[];
  previewUrl: string;
};

// every layer renders one history segment; earlier segments are nested inside
// as the "image" of the later ones, so baked shapes transform with later edits
const PreviewLayer = ({ layers, previewUrl }: PreviewLayerProps) => {
  const {
    box,
    boxWidth,
    boxHeight,
    viewWidth,
    viewHeight,
    rotation,
    flipH,
    flipV,
  } = layers.at(-1)!;
  const inner = layers.slice(0, -1);
  const innerShape = inner.at(-1)?.shape;
  const contentStyle = {
    width: `${(1 / box.w) * 100}%`,
    height: `${(1 / box.h) * 100}%`,
    left: `${-(box.x / box.w) * 100}%`,
    top: `${-(box.y / box.h) * 100}%`,
  };

  return (
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
        {inner.length ? (
          <div className={styles.image} style={contentStyle}>
            <div
              className={styles.layer}
              style={innerShape ? getShapeMaskStyle(innerShape) : undefined}
            >
              <PreviewLayer layers={inner} previewUrl={previewUrl} />
            </div>
          </div>
        ) : (
          <img
            className={styles.image}
            src={previewUrl}
            alt="Preview Image"
            style={contentStyle}
          />
        )}
      </div>
    </div>
  );
};

export const Preview = ({
  isClipped,
  isFilter,
  isMasked,
  faded,
  style = {},
}: PreviewType) => {
  const { showCompare } = usePixediContext();
  const { previewRef, filterRef, previewUrl, layers, filters, i18n } =
    usePreview({ isClipped, isFilter, isMasked });
  const { viewWidth, viewHeight } = layers.at(-1)!;

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
      {showCompare && !isFilter && (
        <div className={`${styles.label} ${styles.before}`}>
          {i18n("before")}
        </div>
      )}
      {showCompare && isFilter && (
        <div className={`${styles.label} ${styles.after}`}>{i18n("after")}</div>
      )}
      <div
        ref={filterRef}
        className={styles.filter}
        style={{ filter: filters.join(" ") }}
      >
        <PreviewLayer layers={layers} previewUrl={previewUrl} />
      </div>
    </div>
  );
};
