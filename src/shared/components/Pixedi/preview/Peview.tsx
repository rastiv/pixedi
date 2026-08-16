import { useEffect, useRef } from "react";
import { usePreview } from "./usePreview";
import { eventBus } from "../eventBus";
import { usePixediContext } from "../provider/usePixediContext";
import type { CropRect } from "../types";
import { ActionName } from "../types";
import styles from "./Preview.module.css";

type PreviewType = {
  isClipped?: unknown;
  style?: React.CSSProperties;
};

export const Preview = ({ isClipped, style = {} }: PreviewType) => {
  const { history, reducedBase64, currentAction } = usePixediContext();
  const previewRef = useRef<HTMLDivElement>(null);

  const newHistoryItem = [];
  if (currentAction) {
    const { width, height } = history.items.at(history.pointer)!;
    newHistoryItem.push({
      width:
        currentAction.name === ActionName.ROTATE &&
        currentAction.args.degrees % 180 === 90
          ? height
          : width,
      height:
        currentAction.name === ActionName.ROTATE &&
        currentAction.args.degrees % 180 === 90
          ? width
          : height,
      action: currentAction,
    });
  }

  const historyItems = [
    ...history.items.slice(0, history.pointer + 1),
    ...newHistoryItem,
  ];

  const {
    box,
    boxWidth,
    boxHeight,
    viewWidth,
    viewHeight,
    rotation,
    flipH,
    flipV,
  } = usePreview(historyItems);

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
