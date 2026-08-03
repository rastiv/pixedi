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
};

export const getInitialState = (
  extension: string,
  width: number,
  height: number,
  reducedBase64: string,
  originalBase64: string,
  originalSize: number,
  settings: Settings,
): PixediContextType => ({
  history: {
    pointer: 0,
    items: [
      {
        name: "Initial",
        base64: reducedBase64,
        width,
        height,
        ext: extension,
      },
    ],
  },
  currentAction: null,
  originalBase64,
  originalSize,
  extension,
  sidebar: false,
  settings,
});
