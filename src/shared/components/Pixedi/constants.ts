import type { Option, FilterData, Preset } from "./types";

export const PREVIEW_MAX_DIMENSION = 1920;
export const PREVIEW_QUALITY = 0.85;

export const presetsData: Preset[] = [
  {
    label: "Facebook",
    value: "facebook",
    options: [
      {
        value: "facebook-post",
        label: "Post",
        w: 1200,
        h: 630,
        rightLabel: "1200 x 630",
      },
      {
        value: "facebook-cover",
        label: "Cover",
        w: 851,
        h: 315,
        rightLabel: "851 x 315",
      },
      {
        value: "facebook-profile",
        label: "Profile",
        w: 170,
        h: 170,
        rightLabel: "170 x 170",
      },
      {
        value: "facebook-story",
        label: "Story",
        w: 1080,
        h: 1920,
        rightLabel: "1080 x 1920",
      },
    ],
  },
  {
    label: "Instagram",
    value: "instagram",
    options: [
      {
        value: "instagram-landscape",
        label: "Landscape",
        w: 1080,
        h: 566,
        rightLabel: "1080 x 566",
      },
      {
        value: "instagram-portait",
        label: "Portait",
        w: 1080,
        h: 1350,
        rightLabel: "1080 x 1350",
      },
      {
        value: "instagram-square",
        label: "Square",
        w: 1080,
        h: 1080,
        rightLabel: "1080 x 1080",
      },
      {
        value: "instagram-story",
        label: "Story",
        w: 1080,
        h: 1920,
        rightLabel: "1080 x 1920",
      },
      {
        value: "instagram-thumbnail",
        label: "Thumbnail",
        w: 161,
        h: 161,
        rightLabel: "161 x 161",
      },
    ],
  },
  {
    label: "LinkedIn",
    value: "linkedin",
    options: [
      {
        value: "linkedin-blog-post",
        label: "Blog Post",
        w: 1200,
        h: 627,
        rightLabel: "1200 x 627",
      },
      {
        value: "linkedin-cover",
        label: "Cover",
        w: 1128,
        h: 191,
        rightLabel: "1128 x 191",
      },
      {
        value: "linkedin-profile",
        label: "Profile",
        w: 400,
        h: 400,
        rightLabel: "400 x 400",
      },
    ],
  },
];

export const filtersData: FilterData[] = [
  {
    value: "saturate",
    label: "Saturate",
    min: 0,
    max: 200,
    step: 1,
    unit: "%",
    sliderValue: 100,
    rightLabel: "100%",
  },
  {
    value: "grayscale",
    label: "Grayscale",
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    sliderValue: 0,
    rightLabel: "0%",
  },
  {
    value: "sepia",
    label: "Sepia",
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    sliderValue: 0,
    rightLabel: "0%",
  },
  {
    value: "invert",
    label: "Invert",
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    sliderValue: 0,
    rightLabel: "0%",
  },
  {
    value: "hueRotate",
    label: "Hue Rotate",
    min: 0,
    max: 360,
    step: 1,
    unit: "°",
    sliderValue: 0,
    rightLabel: "0°",
  },

  {
    value: "brightness",
    label: "Brightness",
    min: 0,
    max: 200,
    step: 1,
    unit: "%",
    sliderValue: 100,
    rightLabel: "100%",
  },
  {
    value: "contrast",
    label: "Contrast",
    min: 0,
    max: 200,
    step: 1,
    unit: "%",
    sliderValue: 100,
    rightLabel: "100%",
  },
];

export const filterUrlsData: Option[] = [
  { value: "vintage", label: "Vintage" },
  { value: "olive-army", label: "Olive Army" },
  { value: "warm-sunset", label: "Warm Sunset" },
  { value: "sin-city-red", label: "Sin City Red" },
  { value: "plastic-wrap", label: "Plastic Wrap" },
  { value: "cross-process", label: "Cross-Processing" },
  { value: "crt-lines", label: "CRT Monitor" },
  { value: "grain", label: "Grain / Noise" },
  { value: "emboss", label: "Emboss Effect" },
  { value: "x-ray", label: "X-Ray" },
];
