import type { ReactNode } from "react";
import {
  Crop,
  Image,
  Rectangle16x9,
  Rectangle4x3,
  Square,
} from "../assets/icons";
import { Button, Tooltip } from "../ui";
import styles from "./Crop.module.css";

const cropTools: Array<{ id: string; icon: ReactNode; label: string }> = [
  { id: "freeform", icon: <Crop />, label: "Freeform" },
  { id: "origin", icon: <Image />, label: "Original" },
  { id: "1:1", icon: <Square />, label: "1 : 1" },
  { id: "4:3", icon: <Rectangle4x3 />, label: "4 : 3" },
  { id: "16:9", icon: <Rectangle16x9 />, label: "16 : 9" },
];

type CropButtonGroupProps = {
  value: string;
  onChange: (value: string) => void;
};

export const CropButtonGroup = ({ value, onChange }: CropButtonGroupProps) => {
  return (
    <div className={styles.group}>
      <Tooltip
        orientation="horizontal"
        className={styles.tooltip}
        classNameTitle={styles.tooltipTitle}
      >
        {cropTools.map((tool) => (
          <Button
            key={tool.id}
            variant="outline"
            className={`${styles.groupBtn} ${value === tool.id ? styles.active : ""}`}
            onClick={() => onChange(tool.id)}
            aria-label={tool.label}
            data-tooltip={tool.label}
          >
            {tool.icon}
          </Button>
        ))}
      </Tooltip>
    </div>
  );
};
