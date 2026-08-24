import { useEffect, useRef } from "react";
import { SaveCloseGroup } from "../ui";
import { ActionName, type CropRect } from "../types";
import { usePixediContext } from "../provider/usePixediContext";
import { getInitalCrop } from "../utils/crop";
import rootStyles from "../index.module.css";
import styles from "./Crop.module.css";

export const CropTools = () => {
  const {
    setCurrentAction,
    currentAction,
    getLastHistoryItem,
    addToHistory,
    setSidebar,
    eventBus,
  } = usePixediContext();
  const { width, height } = getLastHistoryItem();

  const leftRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef<HTMLDivElement>(null);
  const clipPathRef = useRef<CropRect>({ x: 0, y: 0, w: 0, h: 0 });

  const handleClose = () => {
    setCurrentAction(null);
    setSidebar(true);
  };

  useEffect(() => {
    if (currentAction?.name !== "crop") {
      return;
    }
    const { x, y, w, h } = getInitalCrop(
      currentAction.args.ratio || 1,
      width,
      height,
    );
    const xPx = Math.round((x / 100) * width);
    const yPx = Math.round((y / 100) * height);
    const wPx = Math.round((w / 100) * width);
    const hPx = Math.round((h / 100) * height);

    if (leftRef.current) leftRef.current.textContent = xPx.toString();
    if (topRef.current) topRef.current.textContent = yPx.toString();
    if (widthRef.current) widthRef.current.textContent = wPx.toString();
    if (heightRef.current) heightRef.current.textContent = hPx.toString();

    const onCropUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<CropRect>;
      const { x, y, w, h } = customEvent.detail;
      clipPathRef.current = customEvent.detail;
      if (leftRef.current) leftRef.current.textContent = x.toString();
      if (topRef.current) topRef.current.textContent = y.toString();
      if (widthRef.current) widthRef.current.textContent = w.toString();
      if (heightRef.current) heightRef.current.textContent = h.toString();
    };

    const onClipPathUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<CropRect>;
      clipPathRef.current = customEvent.detail;
    };

    eventBus.addEventListener("crop-update", onCropUpdate);
    eventBus.addEventListener("clip-path-update", onClipPathUpdate);

    return () => {
      eventBus.removeEventListener("crop-update", onCropUpdate);
      eventBus.removeEventListener("clip-path-update", onClipPathUpdate);
    };
  }, [currentAction, width, height, eventBus]);

  const handleSave = async () => {
    if (!currentAction || currentAction.name !== ActionName.CROP) {
      return;
    }

    const updatedWidth =
      currentAction.args?.preset?.width ||
      Math.round((width * clipPathRef.current.w) / 100);
    const updatedHeight =
      currentAction.args?.preset?.height ||
      Math.round((height * clipPathRef.current.h) / 100);

    addToHistory({
      width: updatedWidth,
      height: updatedHeight,
      action: {
        name: "crop",
        args: { ...currentAction.args, ...clipPathRef.current },
      },
    });

    setSidebar(true);
  };

  return (
    <div className={styles.tools}>
      <div className={styles.toolsInfo}>
        <div className={styles.toolsInfoLabel}>left</div>
        <div
          className={`${styles.toolsInfoValue} ${rootStyles.semibold}`}
          ref={leftRef}
        />
      </div>
      <div className={styles.toolsInfo}>
        <div className={styles.toolsInfoLabel}>top</div>
        <div
          className={`${styles.toolsInfoValue} ${rootStyles.semibold}`}
          ref={topRef}
        />
      </div>
      <div className={styles.toolsInfo}>
        <div className={styles.toolsInfoLabel}>width</div>
        <div
          className={`${styles.toolsInfoValue} ${rootStyles.semibold}`}
          ref={widthRef}
        />
      </div>
      <div className={styles.toolsInfo}>
        <div className={styles.toolsInfoLabel}>height</div>
        <div
          className={`${styles.toolsInfoValue} ${rootStyles.semibold}`}
          ref={heightRef}
        />
      </div>
      <SaveCloseGroup onSave={handleSave} onClose={handleClose} />
    </div>
  );
};
