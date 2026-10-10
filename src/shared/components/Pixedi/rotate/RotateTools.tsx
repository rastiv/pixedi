import { OrbitalSelector } from "../ui";
import styles from "./Rotate.module.css";
import { useState } from "react";

export const RotateTools = () => {
  const [value, setValue] = useState(0);

  return (
    <div className={styles.rotate}>
      <OrbitalSelector
        value={value}
        onChange={setValue}
        className={styles.selector}
        angles={[0, 45, 90, 135, 180, 225, 270, 315]}
      ></OrbitalSelector>
    </div>
  );
};
