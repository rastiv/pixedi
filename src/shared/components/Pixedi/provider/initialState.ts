import { DefaultFilterValues } from "../filters";
import { type History, type Action, ActionName } from "../types";

import type { Settings } from "../types";

export type PixediContextType = {
  history: History;
  currentAction: Action | null;
  previewUrl: string;
  originalBlob: Blob | null;
  mimeType: string | null;
  sidebar: boolean;
  settings: Settings;
  isAlpha: boolean;
  showCompare: boolean;
  singleToolUI: boolean;
};

const getInitialAction = (
  tools: string[],
  width: number,
  height: number,
): Action | null => {
  if (tools.length === 1) {
    switch (tools[0]) {
      case "resize":
        return { name: ActionName.RESIZE, args: { width, height } };
      case "crop":
        return {
          name: ActionName.CROP,
          args: { id: "freeform", ratio: width / height, isFree: true },
        };
      case "presetCrop":
        return {
          name: ActionName.PRESET_CROP,
          args: {
            id: "facebook-post",
            ratio: 1200 / 630,
            isFree: false,
            preset: { width: 1200, height: 630 },
          },
        };
      case "flip":
        return {
          name: ActionName.FLIP,
          args: { horizontal: false, vertical: false },
        };
      case "rotate":
        return { name: ActionName.ROTATE, args: { degrees: 0 } };
      case "filters":
        return { name: ActionName.FILTERS, args: DefaultFilterValues() };
      default:
        return null;
    }
  }
  return null;
};

export const initialSettings: Settings = {
  tools: ["resize", "crop", "presetCrop", "flip", "rotate", "filters"],
  infobar: true,
  quality: 0.85,
  saveAsWEBP: false,
  exportAs: "blob",
  background: "circled",
};

export const getInitialState = (
  mimeType: string,
  width: number,
  height: number,
  originalBlob: Blob | null,
  previewUrl: string,
  isAlpha: boolean,
  settings: Settings,
): PixediContextType => ({
  history: {
    pointer: 0,
    items: [
      {
        width,
        height,
        action: {
          name: ActionName.INITIAL,
          args: null,
        },
      },
    ],
  },
  currentAction: getInitialAction(settings?.tools || [], width, height),
  previewUrl,
  originalBlob,
  mimeType,
  sidebar: false,
  settings,
  isAlpha,
  showCompare: false,
  singleToolUI: settings?.tools?.length === 1,
});
