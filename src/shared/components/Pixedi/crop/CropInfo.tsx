import { useEffect, useRef } from "react";
import { getInitalCrop } from "../utils/crop";
import { usePixediContext } from "../provider/usePixediContext";
import { ActionName, type CropRectExtended } from "../types";
import styles from "./Crop.module.css";

export const CropInfo = () => {
  const xRef = useRef<HTMLDivElement>(null);
  const yRef = useRef<HTMLDivElement>(null);
  const wRef = useRef<HTMLDivElement>(null);
  const hRef = useRef<HTMLDivElement>(null);

  const { currentAction, getLastHistoryItem, eventBus } = usePixediContext();
  const { width, height } = getLastHistoryItem();

  useEffect(() => {
    if (!(
      currentAction?.name === ActionName.CROP ||
      currentAction?.name === ActionName.PRESET_CROP
    )) {
      return;
    }
    const initialCrop = getInitalCrop(currentAction.args.ratio, width, height);
    const { xP, yP, wP, hP } = initialCrop;

    if (xRef.current) xRef.current.textContent = xP.toString();
    if (yRef.current) yRef.current.textContent = yP.toString();
    if (wRef.current) wRef.current.textContent = wP.toString();
    if (hRef.current) hRef.current.textContent = hP.toString();

    const onCropUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<CropRectExtended>;
      const { x, y, w, h } = customEvent.detail;
      if (xRef.current) xRef.current.textContent = x.toString();
      if (yRef.current) yRef.current.textContent = y.toString();
      if (wRef.current) wRef.current.textContent = w.toString();
      if (hRef.current) hRef.current.textContent = h.toString();
    };

    eventBus.addEventListener("crop-update", onCropUpdate);

    return () => {
      eventBus.removeEventListener("crop-update", onCropUpdate);
    };
  }, [currentAction, height, width, eventBus]);

  return (
    <>
      <div className={`${styles.info} ${styles.infoX}`}>
        <b ref={xRef} />
      </div>
      <div className={`${styles.info} ${styles.infoY}`}>
        <b ref={yRef} />
      </div>
      <div className={`${styles.info} ${styles.infoW}`}>
        <b ref={wRef} />
      </div>
      <div className={`${styles.info} ${styles.infoH}`}>
        <b ref={hRef} />
      </div>
    </>
  );
};
