import type { ReactNode } from "react";
import {
  Crop,
  Filters,
  FlipH,
  Fullscreen,
  Presets,
  Rotate,
  Shapes,
} from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import { DefaultFilterValues } from "../filters";
import { ActionName, type Tools } from "../types";

export const getToolIcon = (tool: Tools): ReactNode => {
  switch (tool) {
    case ActionName.RESIZE:
      return <Fullscreen />;
    case ActionName.CROP:
      return <Crop />;
    case ActionName.PRESET_CROP:
      return <Presets />;
    case ActionName.FLIP:
      return <FlipH />;
    case ActionName.ROTATE:
      return <Rotate />;
    case ActionName.FILTERS:
      return <Filters />;
    case ActionName.SHAPES:
      return <Shapes />;
    default:
      return null;
  }
};

export const useSidebar = () => {
  const {
    settings,
    currentAction,
    showCompare,
    toggleCompare,
    getLastRotation,
    getLastHistoryItem,
    setCurrentAction,
    setSidebar,
  } = usePixediContext();
  const tools = settings?.tools || [];
  const actionName = currentAction?.name;
  const { width, height } = getLastHistoryItem();

  const click = (tool: Tools) => {
    if (tools.includes(tool) && actionName === tool) {
      setCurrentAction(null);
      return;
    }

    switch (tool) {
      case ActionName.RESIZE:
        setCurrentAction({ name: ActionName.RESIZE, args: { width, height } });
        break;
      case ActionName.CROP:
        setCurrentAction({
          name: ActionName.CROP,
          args: { id: "freeform", ratio: width / height, isFree: true },
        });
        break;
      case ActionName.PRESET_CROP:
        setCurrentAction({
          name: ActionName.PRESET_CROP,
          args: {
            id: "facebook-post",
            ratio: 1200 / 630,
            isFree: false,
            preset: { width: 1200, height: 630 },
          },
        });
        break;
      case ActionName.FLIP:
        setCurrentAction({
          name: ActionName.FLIP,
          args: { horizontal: false, vertical: false },
        });
        break;
      case ActionName.ROTATE:
        setCurrentAction({
          name: ActionName.ROTATE,
          args: { degrees: getLastRotation() },
        });
        break;
      case ActionName.FILTERS:
        setCurrentAction({
          name: ActionName.FILTERS,
          args: DefaultFilterValues(),
        });
        break;
      case ActionName.SHAPES:
        setCurrentAction({
          name: ActionName.SHAPES,
          args: null,
        });
        break;
    }

    if (showCompare) toggleCompare();

    setSidebar(false);
  };

  return { click };
};
