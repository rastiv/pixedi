export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export type Sizes = {
  width: number;
  height: number;
};

export type Direction = "r" | "l" | "t" | "b" | "tl" | "tr" | "bl" | "br";

export type FlipDirection = {
  horizontal: boolean;
  vertical: boolean;
};

export type CropSizes = {
  w: number;
  h: number;
};

export type CropPosition = {
  x: number;
  y: number;
};

export type Flip = {
  horizontal: boolean;
  vertical: boolean;
};

export type CropRect = CropSizes &
  CropPosition & {
    xPx?: number;
    yPx?: number;
    wPx?: number;
    hPx?: number;
  };

export type ActionCrop = {
  id: string;
  ratio: number;
  isFree: boolean;
  preset: CropSizes | null;
};

export type ActionWithVal = {
  val: boolean;
};

export type Action =
  | { name: "resize"; args: Sizes }
  | { name: "crop"; args: ActionCrop }
  | { name: "flip"; args: null }
  | { name: "rotate"; args: null }
  | { name: "filters"; args: Record<string, number> };

export type HistoryItemAction =
  | { name: "initial"; args: null }
  | { name: "resize"; args: Sizes }
  | { name: "crop"; args: CropSizes & CropPosition }
  | { name: "presetCrop"; args: Sizes & CropSizes & CropPosition }
  | { name: "flip"; args: Flip }
  | { name: "rotate"; args: number }
  | { name: "filters"; args: Record<string, number> };

export type HistoryItem = Sizes & {
  base64: string;
  action: HistoryItemAction;
};

export type History = {
  pointer: number;
  items: Array<HistoryItem>;
};

export type FuncSaveArgs = (base64: string) => Promise<void> | void;

export type Theme = "light" | "dark";

export type Settings = {
  quality?: number;
};
