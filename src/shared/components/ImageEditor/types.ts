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

export type CropSizes = {
  w: number;
  h: number;
};

export type CropRect = CropSizes & {
  x: number;
  y: number;
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
  val: number;
};

export type Action =
  | { name: "resize"; args: Sizes }
  | { name: "crop"; args: ActionCrop }
  | { name: "flipH"; args: ActionWithVal }
  | { name: "flipV"; args: ActionWithVal }
  | { name: "filters"; args: Record<string, number> };

export type HistoryItem = Sizes & {
  name: string;
  base64: string;
};

export type History = {
  pointer: number;
  items: Array<HistoryItem>;
};

export type FuncSaveArgs = (base64: string) => Promise<void> | void;
