import type { History, Action } from "../types";

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
};

export const initialSettings: Settings = {
  quality: 0.85,
  saveAsWEBP: false,
  exportAs: "blob",
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
          name: "initial",
          args: null,
        },
      },
    ],
  },
  currentAction: null,
  previewUrl,
  originalBlob,
  mimeType,
  sidebar: false,
  settings,
  isAlpha,
});
