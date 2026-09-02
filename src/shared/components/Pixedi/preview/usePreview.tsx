import { useEffect, useLayoutEffect, useRef } from "react";
import { usePixediContext } from "../provider/usePixediContext";
import { ActionName, type CropRect } from "../types";
import { getOrientedSizes } from "../utils/crop";
import { getPreview } from "../utils/preview";

type UsePreviewProps = {
  isClipped?: boolean;
};

export const usePreview = ({ isClipped }: UsePreviewProps) => {
  const { history, previewUrl, currentAction, getLastRotation, eventBus } =
    usePixediContext();
  const previewRef = useRef<HTMLDivElement>(null);
  const previousActionRef = useRef(currentAction?.name);
  const previousPreviewUrlRef = useRef(previewUrl);

  useLayoutEffect(() => {
    const previousAction = previousActionRef.current;
    const nextAction = currentAction?.name;
    const previewChanged = previousPreviewUrlRef.current !== previewUrl;
    previousActionRef.current = nextAction;
    previousPreviewUrlRef.current = previewUrl;

    const actionChanged =
      previousAction && nextAction && previousAction !== nextAction;
    if (!actionChanged && !previewChanged) return;

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
  }, [currentAction?.name, previewUrl]);

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

  const preview = getPreview(historyItems);

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

  return { previewRef, previewUrl, ...preview };
};
