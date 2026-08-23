import type { History, Action } from "../types";

import type { Settings } from "../types";

export type PixediContextType = {
  history: History;
  currentAction: Action | null;
  previewUrl: string;
  originalBlob: Blob | null;
  extension: string | null;
  sidebar: boolean;
  settings: Settings;
  isAlpha: boolean;
};

export const initialSettings: Settings = {
  quality: 0.65,
  saveAsWEBP: false,
};

export const getInitialState = (
  extension: string,
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
  extension,
  sidebar: false,
  settings,
  isAlpha,
});
