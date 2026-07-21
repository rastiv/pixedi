import * as React from "react";

const baseSvgProps: React.ComponentPropsWithoutRef<"svg"> = {
  xmlns: "http://w3.org",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const Check = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg {...baseSvgProps} {...props}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const X = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg {...baseSvgProps} {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const Lock = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg {...baseSvgProps} {...props}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const ArrowLeft = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg {...baseSvgProps} {...props}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

export const ChevronDown = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg {...baseSvgProps} {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const Undo = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg {...baseSvgProps} {...props}>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
);

export const Redo = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg {...baseSvgProps} {...props}>
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
  </svg>
);

export const Settings = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg {...baseSvgProps} {...props}>
    <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const Crop = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg {...baseSvgProps} {...props}>
    <path d="M6 2v14a2 2 0 0 0 2 2h14" />
    <path d="M18 22V8a2 2 0 0 0-2-2H2" />
  </svg>
);

export const Image = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg {...baseSvgProps} {...props}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

export const Square = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg {...baseSvgProps} {...props}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
  </svg>
);

export const Fullscreen = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg {...baseSvgProps} {...props}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <rect width="10" height="8" x="7" y="8" rx="1" />
  </svg>
);

export const Loader = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg {...baseSvgProps} {...props}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56">
      <animateTransform
        attributeType="xml"
        attributeName="transform"
        type="rotate"
        from="0 12 12"
        to="360 12 12"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);
