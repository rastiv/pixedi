import { useEffect, useLayoutEffect, useRef } from "react";
import { getPreview } from "../utils/preview";
import { usePixediContext } from "../provider/usePixediContext";
import type { CropRect } from "../types";
import { ActionName } from "../types";
import { getOrientedSizes } from "../utils/crop";
import styles from "./Preview.module.css";

type PreviewType = {
  isClipped?: boolean;
  style?: React.CSSProperties;
};

export const Preview = ({ isClipped, style = {} }: PreviewType) => {
  const { history, previewUrl, currentAction, getLastRotation, eventBus } =
    usePixediContext();
  const previewRef = useRef<HTMLDivElement>(null);
  const previousActionRef = useRef(currentAction?.name);

  useLayoutEffect(() => {
    const previousAction = previousActionRef.current;
    const nextAction = currentAction?.name;
    previousActionRef.current = nextAction;

    if (!previousAction || !nextAction || previousAction === nextAction) return;

    const preview = previewRef.current;
    if (!preview) return;

    const elements = [preview, ...preview.querySelectorAll<HTMLElement>("*")];
    elements.forEach((element) => {
      element.style.transition = "none";
    });
    preview.getBoundingClientRect();

    const restoreTransitions = () => {
      elements.forEach((element) => {
        element.style.removeProperty("transition");
      });
    };
    const frame = requestAnimationFrame(restoreTransitions);

    return () => {
      cancelAnimationFrame(frame);
      restoreTransitions();
    };
  }, [currentAction?.name]);

  const newHistoryItem = [];
  if (currentAction) {
    const { width, height } = history.items.at(history.pointer)!;
    newHistoryItem.push({
      ...(currentAction.name === ActionName.ROTATE
        ? getOrientedSizes(
            width,
            height,
            getLastRotation(),
            currentAction.args.degrees,
          )
        : { width, height }),
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
  } = getPreview(historyItems);

  useEffect(() => {
    if (isClipped && previewRef.current) {
      previewRef.current.style.transition = "none";
    }

    if (currentAction?.name !== ActionName.RESIZE && previewRef.current) {
      previewRef.current.style.transform = "scale(1)";
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
  }, [isClipped, currentAction?.name, eventBus]);

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
