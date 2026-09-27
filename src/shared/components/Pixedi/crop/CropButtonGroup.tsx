import type { ReactNode } from "react";
import {
  Crop,
  Image,
  Rectangle16x9,
  Rectangle4x3,
  Square,
} from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import { Button, Tooltip } from "../ui";
import styles from "./Crop.module.css";

const cropTools: Array<{ id: string; icon: ReactNode; label?: string }> = [
  { id: "freeform", icon: <Crop /> },
  { id: "origin", icon: <Image /> },
  { id: "1:1", icon: <Square />, label: "1 : 1" },
  { id: "4:3", icon: <Rectangle4x3 />, label: "4 : 3" },
  { id: "16:9", icon: <Rectangle16x9 />, label: "16 : 9" },
];

type CropButtonGroupProps = {
  value: string;
  onChange: (value: string) => void;
};

export const CropButtonGroup = ({ value, onChange }: CropButtonGroupProps) => {
  const { i18n } = usePixediContext();

  return (
    <div className={styles.group}>
      <Tooltip position="top">
        {cropTools.map((tool) => {
          const label = tool.label ? tool.label : i18n(tool.id);
          return (
            <Button
              key={tool.id}
              variant="outline"
              className={`${styles.groupBtn} ${value === tool.id ? styles.active : ""}`}
              onClick={() => onChange(tool.id)}
              aria-label={label}
              data-tooltip={label}
            >
              {tool.icon}
            </Button>
          );
        })}
      </Tooltip>
    </div>
  );
};
