import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { ActionName, type CropRect, type ShapeMask } from "../types";
import {
  closestTurn,
  getPreviewLayers,
  getRotatedSizes,
} from "../utils/preview";
import { applyShapeMaskGeometry, applyShapeMaskImage } from "../utils/shape";

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
  const { history, previewUrl, currentAction, eventBus, showCompare, i18n } =
    usePixediContext();
  const previewRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const previousActionRef = useRef(currentAction?.name);
  const previousPreviewUrlRef = useRef(previewUrl);

  const historyItems = history.items.slice(0, history.pointer + 1);
  if (currentAction) {
    const { width, height } = history.items.at(history.pointer)!;
    historyItems.push({
      ...(currentAction.name === ActionName.ROTATE
        ? getRotatedSizes(historyItems, currentAction.args.degrees)
        : { width, height }),
      action: currentAction,
    });
  }

  const preview = getPreviewLayers(historyItems);

  // css animates the raw angle difference, so going from 1197deg back to 0
  // would replay three full turns; every layer is rendered at the equivalent
  // angle closest to what is on screen, which never turns more than half way
  const targetBetas = preview.layers.map((layer) => layer.beta);
  const [shownBetas, setShownBetas] = useState(targetBetas);
  const [previousTargets, setPreviousTargets] = useState(targetBetas);
  const targetsChanged =
    targetBetas.length !== previousTargets.length ||
    targetBetas.some((beta, index) => beta !== previousTargets[index]);
  if (targetsChanged) {
    setPreviousTargets(targetBetas);
    setShownBetas(
      targetBetas.map((beta, index) =>
        closestTurn(beta, shownBetas[index] ?? beta),
      ),
    );
  }
  const layers = preview.layers.map((layer, index) => ({
    ...layer,
    beta: targetsChanged ? layer.beta : (shownBetas[index] ?? layer.beta),
  }));

  const layerCount = preview.layers.length;
  const previousLayerCountRef = useRef(layerCount);
  // a crop on a tilted view moves the tilt from the rotate layer into the
  // region, which looks the same but would animate as a spin
  const regionAngle = preview.layers.at(-1)!.region.angle;
  const previousRegionAngleRef = useRef(regionAngle);

  useLayoutEffect(() => {
    const previousAction = previousActionRef.current;
    const nextAction = currentAction?.name;
    const previewChanged = previousPreviewUrlRef.current !== previewUrl;
    // a committed (or undone) shape moves the transforms into a new inner
    // layer while the reused outer one resets, so animating would replay them
    const layersChanged = previousLayerCountRef.current !== layerCount;
    const tiltMoved = previousRegionAngleRef.current !== regionAngle;
    previousActionRef.current = nextAction;
    previousPreviewUrlRef.current = previewUrl;
    previousLayerCountRef.current = layerCount;
    previousRegionAngleRef.current = regionAngle;

    const actionChanged =
      previousAction && nextAction && previousAction !== nextAction;
    if (!actionChanged && !previewChanged && !layersChanged && !tiltMoved)
      return;

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
  }, [currentAction?.name, previewUrl, layerCount, regionAngle]);

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

    const onShapeMaskUpdate = (event: Event) => {
      if (!isMasked || !previewRef.current) return;
      applyShapeMaskImage(
        previewRef.current,
        (event as CustomEvent<ShapeMask>).detail,
      );
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
    eventBus.addEventListener("shape-mask-update", onShapeMaskUpdate, {
      signal,
    });
    eventBus.addEventListener("filter-update", onFilterUpdate, { signal });
    eventBus.addEventListener("compare-update", onCompareUpdate, { signal });

    return () => controller.abort();
  }, [isClipped, isFilter, isMasked, currentAction?.name, eventBus]);

  return { previewRef, filterRef, previewUrl, i18n, ...preview, layers };
};
