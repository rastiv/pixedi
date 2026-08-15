import { useEffect, useRef } from "react";
import { usePreview } from "./usePreview";
import { eventBus } from "../eventBus";
import { usePixediContext } from "../provider/usePixediContext";
import type { CropRect } from "../types";
import styles from "./Preview.module.css";

type PreviewType = {
  isClipped: boolean;
  style?: React.CSSProperties;
};

export const Preview = ({ isClipped = false, style = {} }: PreviewType) => {
  const { history, reducedBase64, getLastHistoryItem, currentAction } =
    usePixediContext();
  const { width, height } = getLastHistoryItem();
  const previewRef = useRef<HTMLDivElement>(null);

  const updatedHistory = {
    pointer: currentAction ? history.pointer + 1 : history.pointer,
    items: currentAction
      ? [...history.items, { ...history.items.at(-1)!, action: currentAction }]
      : history.items,
  };

  const {
    box,
    boxWidth,
    boxHeight,
    viewWidth,
    viewHeight,
    rotation,
    flipH,
    flipV,
  } = usePreview(updatedHistory);

  useEffect(() => {
    if (isClipped && previewRef.current) {
      previewRef.current.style.transition = "none";
    }

    const onResizeUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<number>;
      const scale = customEvent.detail;
      if (previewRef.current) {
        previewRef.current.style.transform = `scale(${scale / 100})`;
      }
    };

    const onClipPathUpdate = (event: Event) => {
      if (!isClipped) return;
      const customEvent = event as CustomEvent<CropRect>;
      const { x, y, w, h } = customEvent.detail;
      if (previewRef.current) {
        previewRef.current.style.clipPath = `xywh(${x}% ${y}% ${w}% ${h}%)`;
      }
    };

    eventBus.addEventListener("resize-update", onResizeUpdate);
    eventBus.addEventListener("clip-path-update", onClipPathUpdate);

    return () => {
      eventBus.removeEventListener("resize-update", onResizeUpdate);
      eventBus.removeEventListener("clip-path-update", onClipPathUpdate);
    };
  }, [isClipped]);

  return (
    <div
      ref={previewRef}
      className={styles.preview}
      style={{
        aspectRatio: `${width} / ${height}`,
        ...style,
      }}
    >
      <div
        className={styles.rotate}
        style={{
          width: `${(boxWidth / viewWidth) * 100}%`,
          height: `${(boxHeight / viewHeight) * 100}%`,
          transform: `rotate(${rotation}deg)`,
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
            src={reducedBase64}
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
