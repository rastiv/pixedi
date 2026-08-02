import type { History, Action } from "../types";

import type { Settings } from "../types";

export type PixediContextType = {
  history: History;
  currentAction: Action | null;
  extension: string | null;
  sidebar: boolean;
  settings: Settings;
};

export const getInitialState = (
  extension: string,
  width: number,
  height: number,
  base64: string,
  settings: Settings,
): PixediContextType => ({
  history: {
    pointer: 0,
    items: [
      {
        name: "Initial",
        base64,
        width,
        height,
        ext: extension,
      },
    ],
  },
  currentAction: null,
  extension,
  sidebar: false,
  settings,
});
