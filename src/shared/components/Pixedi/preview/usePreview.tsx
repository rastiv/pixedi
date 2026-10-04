import { useEffect, useLayoutEffect, useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { ActionName, type CropRect } from "../types";
import { getOrientedSizes } from "../utils/crop";
import { getPreviewLayers } from "../utils/preview";
import { applyShapeMaskGeometry } from "../utils/shape";

type UsePreviewProps = {
  isClipped?: boolean;
  isFilter?: boolean;
  isMasked?: boolean;
};

export const usePreview = ({
  isClipped,
  isFilter,
  isMasked,
}: UsePreviewProps) => {
  const {
    history,
    previewUrl,
    currentAction,
    getLastRotation,
    eventBus,
    showCompare,
    i18n,
  } = usePixediContext();
  const previewRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const previousActionRef = useRef(currentAction?.name);
  const previousPreviewUrlRef = useRef(previewUrl);

  const historyItems = history.items.slice(0, history.pointer + 1);
  if (currentAction) {
    const { width, height } = history.items.at(history.pointer)!;
    historyItems.push({
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

  const preview = getPreviewLayers(historyItems);
  const layerCount = preview.layers.length;
  const previousLayerCountRef = useRef(layerCount);

  useLayoutEffect(() => {
    const previousAction = previousActionRef.current;
    const nextAction = currentAction?.name;
    const previewChanged = previousPreviewUrlRef.current !== previewUrl;
    // a committed (or undone) shape moves the transforms into a new inner
    // layer while the reused outer one resets, so animating would replay them
    const layersChanged = previousLayerCountRef.current !== layerCount;
    previousActionRef.current = nextAction;
    previousPreviewUrlRef.current = previewUrl;
    previousLayerCountRef.current = layerCount;

    const actionChanged =
      previousAction && nextAction && previousAction !== nextAction;
    if (!actionChanged && !previewChanged && !layersChanged) return;

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
  }, [currentAction?.name, previewUrl, layerCount]);

  useLayoutEffect(() => {
    if (isFilter && !showCompare && previewRef.current) {
      previewRef.current.style.removeProperty("clip-path");
    }
  }, [isFilter, showCompare]);

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
        if (isMasked)
          applyShapeMaskGeometry(previewRef.current, { x, y, w, h });
      }
    };

    const onFilterUpdate = (event: Event) => {
      if (!isFilter) return;
      const customEvent = event as CustomEvent<Record<string, number | string>>;
      const filters = customEvent.detail;

      if (filterRef.current) {
        if (filters.url) {
          filterRef.current.style.filter = `url(#${filters.url})`;
        } else {
          const filterString = Object.entries(filters)
            .map(([key, value]) =>
              key === "hueRotate"
                ? `hue-rotate(${value}deg)`
                : `${key}(${value}%)`,
            )
            .join(" ");
          filterRef.current.style.filter = filterString;
        }
      }
    };

    const onCompareUpdate = (event: Event) => {
      if (!isFilter) return;

      const customEvent = event as CustomEvent<number>;
      const percent = customEvent.detail;
      if (previewRef.current) {
        previewRef.current.style.clipPath = `xywh(${percent}% 0% ${100 - percent}% 100%)`;
      }
    };

    const controller = new AbortController();
    const { signal } = controller;

    eventBus.addEventListener("resize-update", onResizeUpdate, { signal });
    eventBus.addEventListener("clip-path-update", onClipPathUpdate, { signal });
    eventBus.addEventListener("filter-update", onFilterUpdate, { signal });
    eventBus.addEventListener("compare-update", onCompareUpdate, { signal });

    return () => controller.abort();
  }, [isClipped, isFilter, isMasked, currentAction?.name, eventBus]);

  return { previewRef, filterRef, previewUrl, i18n, ...preview };
};
