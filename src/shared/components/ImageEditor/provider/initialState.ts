import type { History, Action } from "../types";

export type ImageEditorContextType = {
  history: History;
  currentAction: Action | null;
  extension: string | null;
  sidebar: boolean;
};

export const getInitialState = (
  extension: string,
  width: number,
  height: number,
  base64: string,
): ImageEditorContextType => ({
  history: {
    pointer: 0,
    items: [
      {
        name: "Initial",
        base64,
        width,
        height,
      },
    ],
  },
  currentAction: null,
  extension,
  sidebar: false,
});
