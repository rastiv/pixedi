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

const initialSettings: Settings = {
  quality: 0.85,
  saveAsWEBP: false,
};

export const getInitialState = (
  extension: string,
  width: number,
  height: number,
  previewUrl: string,
  originalBlob: Blob | null,
  settings: Settings = initialSettings,
  isAlpha: boolean,
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
