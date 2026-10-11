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
// places the source image inside the region box; a region cut out of a tilted
// view is turned back around its center
const getContentStyle = ({
  region,
  initWidth,
  initHeight,
}: PreviewData): React.CSSProperties => {
  const { cx, cy, w, h, angle } = region;
  return {
    width: `${(initWidth / w) * 100}%`,
    height: `${(initHeight / h) * 100}%`,
    left: `${-((cx - w / 2) / w) * 100}%`,
    top: `${-((cy - h / 2) / h) * 100}%`,
    ...(angle
      ? {
          transformOrigin: `${(cx / initWidth) * 100}% ${(cy / initHeight) * 100}%`,
          transform: `rotate(${-angle}deg)`,
        }
      : {}),
  };
};

const PreviewLayer = ({ layers, previewUrl }: PreviewLayerProps) => {
  const layer = layers.at(-1)!;
  const { region, viewWidth, viewHeight, beta, scale, flipX, flipY } = layer;
  const inner = layers.slice(0, -1);
  const innerShape = inner.at(-1)?.shape;
  const contentStyle = getContentStyle(layer);

  // flips live outside the rotation so they mirror the view as it is seen,
  // the rotate layer zooms in to keep the frame covered at any angle
  return (
    <div
      className={styles.flip}
      style={{
        transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
      }}
    >
      <div
        className={styles.rotate}
        style={{
          width: `${(region.w / viewWidth) * 100}%`,
          height: `${(region.h / viewHeight) * 100}%`,
          transform: `translate(-50%, -50%) rotate(${beta}deg)${scale !== 1 ? ` scale(${scale})` : ""}`,
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
