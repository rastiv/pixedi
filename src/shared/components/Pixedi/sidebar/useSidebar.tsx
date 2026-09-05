import type { ReactNode } from "react";
import { Crop, FlipH, Fullscreen, Presets, Rotate } from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import { ActionName, type Tools } from "../types";

type MappedTool = {
  icon: ReactNode;
  label: string;
};

const TOOL_DATA: Partial<Record<Tools, MappedTool>> = {
  [ActionName.RESIZE]: { icon: <Fullscreen />, label: "Resize" },
  [ActionName.CROP]: { icon: <Crop />, label: "Crop" },
  [ActionName.PRESET_CROP]: { icon: <Presets />, label: "Presets" },
  [ActionName.FLIP]: { icon: <FlipH />, label: "Flip" },
  [ActionName.ROTATE]: { icon: <Rotate />, label: "Rotate" },
};

export const getToolData = (tool: Tools): MappedTool | null =>
  TOOL_DATA[tool] ?? null;

export const useSidebar = () => {
  const {
    settings,
    currentAction,
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
    }

    setSidebar(false);
  };

  return { click };
};
