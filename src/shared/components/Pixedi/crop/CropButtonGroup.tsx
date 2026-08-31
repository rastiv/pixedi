import {
  Crop,
  Image,
  Rectangle16x9,
  Rectangle4x3,
  Square,
} from "../assets/icons";
import { Button } from "../ui";
import styles from "./Crop.module.css";

type CropButtonGroupProps = {
  value: string;
  onChange: (value: string) => void;
};

export const CropButtonGroup = ({ value, onChange }: CropButtonGroupProps) => {
  return (
    <div className={styles.group}>
      <Button
        variant="outline"
        className={`${styles.groupBtn} ${value === "freeform" ? styles.active : ""}`}
        onClick={() => onChange("freeform")}
      >
        <Crop />
      </Button>
      <Button
        variant="outline"
        className={`${styles.groupBtn} ${value === "origin" ? styles.active : ""}`}
        onClick={() => onChange("origin")}
      >
        <Image />
      </Button>
      <Button
        variant="outline"
        className={`${styles.groupBtn} ${value === "1:1" ? styles.active : ""}`}
        onClick={() => onChange("1:1")}
      >
        <Square />
      </Button>
      <Button
        variant="outline"
        className={`${styles.groupBtn} ${value === "4:3" ? styles.active : ""}`}
        onClick={() => onChange("4:3")}
      >
        <Rectangle4x3 />
      </Button>
      <Button
        variant="outline"
        className={`${styles.groupBtn} ${value === "16:9" ? styles.active : ""}`}
        onClick={() => onChange("16:9")}
      >
        <Rectangle16x9 />
      </Button>
    </div>
  );
};
