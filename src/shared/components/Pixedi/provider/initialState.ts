import type { History, Action } from "../types";

import type { Settings } from "../types";

export type PixediContextType = {
  history: History;
  currentAction: Action | null;
  reducedBase64: string;
  originalBlob: Blob | null;
  originalSize: number;
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
  reducedBase64: string,
  originalBlob: Blob | null,
  originalSize: number,
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
  reducedBase64,
  originalBlob,
  originalSize,
  extension,
  sidebar: false,
  settings,
  isAlpha,
});
