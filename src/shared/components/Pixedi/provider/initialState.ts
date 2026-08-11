import type { History, Action } from "../types";

import type { Settings } from "../types";

export type PixediContextType = {
  history: History;
  currentAction: Action | null;
  reducedBase64: string;
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
  originalBase64,
  originalSize,
  extension,
  sidebar: false,
  settings,
  isAlpha,
});
