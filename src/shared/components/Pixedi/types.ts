export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export type Direction = "tl" | "tr" | "bl" | "br";

export type ActionWithVal = {
  val: boolean;
};

export const ActionName = {
  INITIAL: "initial",
  RESIZE: "resize",
  CROP: "crop",
  PRESET_CROP: "presetCrop",
  FLIP: "flip",
  ROTATE: "rotate",
  FILTERS: "filters",
} as const;

export type Tools = Exclude<
  (typeof ActionName)[keyof typeof ActionName],
  "initial"
>;

export type Sizes = {
  width: number;
  height: number;
};

export type ActionFlip = {
  horizontal: boolean;
  vertical: boolean;
};

export type ActionCrop = {
  id: string;
  ratio: number;
  isFree: boolean;
  preset?: Sizes;
} & Partial<CropRect>;

export type CropRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type CropRectExtended = CropRect & {
  xP: number;
  yP: number;
  wP: number;
  hP: number;
};

export type ActionRotate = {
  degrees: number;
};

export type Action =
  | { name: typeof ActionName.INITIAL; args: null }
  | { name: typeof ActionName.RESIZE; args: Sizes }
  | { name: typeof ActionName.CROP; args: ActionCrop }
  | {
      name: typeof ActionName.PRESET_CROP;
      args: ActionCrop;
    }
  | { name: typeof ActionName.FLIP; args: ActionFlip }
  | { name: typeof ActionName.ROTATE; args: ActionRotate }
  | { name: typeof ActionName.FILTERS; args: Record<string, number> };

export type HistoryItem = Sizes & {
  action: Action;
};

export type History = {
  pointer: number;
  items: Array<HistoryItem>;
};

export type FuncSaveArgs = (payload: Blob | string) => Promise<void> | void;

export type Theme = "light" | "dark";

export type PresetOptions = {
  value: string;
  label: string;
  w: number;
  h: number;
  rightLabel?: string;
};

export type Preset = {
  value: string;
  label: string;
  options: Array<PresetOptions>;
};

export type ProcessedImage = {
  newBlob: Blob;
  previewBlob: Blob;
  mimeType: string;
  width: number;
  height: number;
  isAlpha: boolean;
};

export type Settings = {
  tools?: Tools[];
  infobar?: boolean;
  quality?: number;
  saveAsWEBP?: boolean;
  exportAs?: "blob" | "base64";
};
