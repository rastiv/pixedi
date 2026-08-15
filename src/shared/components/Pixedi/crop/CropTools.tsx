import { useEffect, useRef } from "react";
import { SaveCloseGroup } from "../ui";
import { ActionName, type CropRect } from "../types";
import { usePixediContext } from "../provider/usePixediContext";
import { eventBus } from "../eventBus";
import { getInitalCrop } from "../utils";
import styles from "./crop.module.css";
import rootStyles from "../index.module.css";

export const CropTools = () => {
  const {
    setCurrentAction,
    currentAction,
    getLastHistoryItem,
    addToHistory,
    setSidebar,
  } = usePixediContext();
  const { width, height } = getLastHistoryItem();

  const leftRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef<HTMLDivElement>(null);
  const clipPathRef = useRef<CropRect | null>(null);

  const handleClose = () => {
    setCurrentAction(null);
    setSidebar(true);
  };

  useEffect(() => {
    if (currentAction?.name !== "crop") {
      return;
    }
    const { x, y, w, h } = getInitalCrop(
      currentAction.args.ratio,
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
  }, [currentAction, width, height]);

  const handleSave = async () => {
    if (!currentAction || currentAction.name !== ActionName.CROP) {
      return;
    }

    console.log(clipPathRef.current);

    // if (!cropRectRef.current) {
    //   return;
    // }
    // const { x, y, w, h } = cropRectRef.current;
    // const { preset } = currentAction.args;
    // let processedBase64 = await crop(base64, x, y, w, h);

    // if (preset) {
    //   const { w, h } = preset;
    //   processedBase64 = await resize(processedBase64, w, h);
    // }

    // addToHistory({
    //   width: preset ? preset.w : cropRectRef.current!.w,
    //   height: preset ? preset.h : cropRectRef.current!.h,
    //   action: preset
    //     ? {
    //         name: "presetCrop",
    //         args: { x, y, w, h, width: preset.w, height: preset.h },
    //       }
    //     : { name: "crop", args: { x, y, w, h } },
    // });
    // setSidebar(true);
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
