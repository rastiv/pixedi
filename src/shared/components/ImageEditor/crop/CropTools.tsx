import { useEffect, useRef, useState } from "react";
import { Button, Separator } from "../ui";
import type { CropRect } from "../types";
import { useImageEditorContext } from "../provider/useImageEditorContext";
import { eventBus } from "../eventBus";
import { getInitalCrop } from "../utils";
import { useImageProcessor } from "../hooks";
import { Check, Loader, X } from "../assets/icons";

export const CropTools = () => {
  const {
    setCurrentAction,
    getCurrentAction,
    getLastHistoryItem,
    addToHistory,
    setSidebar,
  } = useImageEditorContext();
  const { crop, resize } = useImageProcessor();
  const [loading, setLoading] = useState(false);
  const action = getCurrentAction();
  const { base64, width, height } = getLastHistoryItem();

  const leftRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef<HTMLDivElement>(null);
  const cropRectRef = useRef<CropRect | null>(null);

  const handleClose = () => {
    setCurrentAction(null);
    setSidebar(true);
  };

  useEffect(() => {
    if (action?.name !== "crop") {
      return;
    }
    const { x, y, w, h } = getInitalCrop(action.args.ratio, width, height);
    const xPx = Math.round((x / 100) * width);
    const yPx = Math.round((y / 100) * height);
    const wPx = Math.round((w / 100) * width);
    const hPx = Math.round((h / 100) * height);

    if (leftRef.current) leftRef.current.textContent = xPx.toString();
    if (topRef.current) topRef.current.textContent = yPx.toString();
    if (widthRef.current) widthRef.current.textContent = wPx.toString();
    if (heightRef.current) heightRef.current.textContent = hPx.toString();
    cropRectRef.current = { x: xPx, y: yPx, w: wPx, h: hPx };

    const onCropUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<CropRect>;
      const { x, y, w, h } = customEvent.detail;
      cropRectRef.current = customEvent.detail;
      if (leftRef.current) leftRef.current.textContent = x.toString();
      if (topRef.current) topRef.current.textContent = y.toString();
      if (widthRef.current) widthRef.current.textContent = w.toString();
      if (heightRef.current) heightRef.current.textContent = h.toString();
    };

    eventBus.addEventListener("crop-update", onCropUpdate);

    return () => {
      eventBus.removeEventListener("crop-update", onCropUpdate);
    };
  }, [action, width, height]);

  const handleSave = async () => {
    if (!action || action.name !== "crop") {
      return;
    }
    try {
      setLoading(true);
      if (!cropRectRef.current) {
        return;
      }
      const { x, y, w, h } = cropRectRef.current;
      const { preset } = action.args;
      let processedBase64 = await crop(base64, x, y, w, h);

      if (preset) {
        const { w, h } = preset;
        processedBase64 = await resize(processedBase64, w, h);
      }

      addToHistory({
        name: "Crop",
        base64: processedBase64,
        width: preset ? preset.w : cropRectRef.current!.w,
        height: preset ? preset.h : cropRectRef.current!.h,
      });
      setSidebar(true);
    } catch (error) {
      console.error("Failed to process image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crop-tools">
      <div className="crop-tools-info">
        <div className="crop-tools-info-label">left</div>
        <div className="crop-tools-info-value semibold" ref={leftRef} />
      </div>
      <div className="crop-tools-info">
        <div className="crop-tools-info-label">top</div>
        <div className="crop-tools-info-value semibold" ref={topRef} />
      </div>
      <div className="crop-tools-info">
        <div className="crop-tools-info-label">width</div>
        <div className="crop-tools-info-value semibold" ref={widthRef} />
      </div>
      <div className="crop-tools-info">
        <div className="crop-tools-info-label">height</div>
        <div className="crop-tools-info-value semibold" ref={heightRef} />
      </div>
      <Separator orientation="vertical" />
      <Button
        variant="ghost"
        className="text-green"
        style={{ height: "36px", width: "36px" }}
        disabled={loading}
        onClick={handleSave}
      >
        {loading ? <Loader /> : <Check />}
      </Button>
      <Separator orientation="vertical" />
      <Button
        variant="ghost"
        style={{ height: "36px", width: "36px" }}
        disabled={loading}
        onClick={handleClose}
      >
        <X className="text-red" />
      </Button>
    </div>
  );
};
