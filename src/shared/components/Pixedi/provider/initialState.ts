import type { History, Action } from "../types";

import type { Settings } from "../types";

export type PixediContextType = {
  history: History;
  currentAction: Action | null;
  originalBase64: string;
  originalSize: number;
  extension: string | null;
  sidebar: boolean;
  settings: Settings;
  isAlpha: boolean;
};

export const getInitialState = (
  extension: string,
  width: number,
  height: number,
  reducedBase64: string,
  originalBase64: string,
  originalSize: number,
  settings: Settings,
  isAlpha: boolean,
): PixediContextType => ({
  history: {
    pointer: 0,
    items: [
      {
        base64: reducedBase64,
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
  originalBase64,
  originalSize,
  extension,
  sidebar: false,
  settings,
  isAlpha,
});
