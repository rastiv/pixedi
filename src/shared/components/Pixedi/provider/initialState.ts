import { DefaultFilterValues } from "../filters/DefaultFilterValues";
import { SHAPE_BORDER } from "../constants/shapes";
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
  translations: Record<string, string>;
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
      case ActionName.RESIZE:
        return { name: ActionName.RESIZE, args: { width, height } };
      case ActionName.CROP:
        return {
          name: ActionName.CROP,
          args: { id: "freeform", ratio: width / height, isFree: true },
        };
      case ActionName.PRESET_CROP:
        return {
          name: ActionName.PRESET_CROP,
          args: {
            id: "facebook-post",
            ratio: 1200 / 630,
            isFree: false,
            preset: { width: 1200, height: 630 },
          },
        };
      case ActionName.FLIP:
        return {
          name: ActionName.FLIP,
          args: { horizontal: false, vertical: false },
        };
      case ActionName.ROTATE:
        return { name: ActionName.ROTATE, args: { degrees: 0 } };
      case "filters":
        return { name: ActionName.FILTERS, args: DefaultFilterValues() };
      case ActionName.SHAPES:
        return {
          name: ActionName.SHAPES,
          args: { shape: "heart", outlined: false, border: SHAPE_BORDER },
        };
      default:
        return null;
    }
  }
  return null;
};

export const initialSettings: Settings = {
  tools: [
    ActionName.RESIZE,
    ActionName.CROP,
    ActionName.PRESET_CROP,
    ActionName.FLIP,
    ActionName.ROTATE,
    ActionName.FILTERS,
    ActionName.SHAPES,
  ],
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
  translations: Record<string, string>,
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
  translations,
  isAlpha,
  showCompare: false,
  singleToolUI: settings?.tools?.length === 1,
});
