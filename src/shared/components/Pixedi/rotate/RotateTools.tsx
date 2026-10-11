import { useState } from "react";
import { OrbitalSelector, SaveCloseGroup } from "../ui";
import styles from "./Rotate.module.css";

export const RotateTools = () => {
  const [value, setValue] = useState(0);

  return (
    <div className={styles.rotate}>
      <OrbitalSelector
        value={value}
        onChange={setValue}
        className={styles.selector}
        angles={[0, 45, 90, 135, 180, 225, 270, 315]}
      >
        <div className={styles.tools}>
          <div className={styles.additional}>{value}</div>
          <div className={styles.content}>
            <SaveCloseGroup
              disabled={false}
              saving={false}
              onSave={() => {}}
              onClose={() => {}}
            />
          </div>
        </div>
      </OrbitalSelector>
    </div>
  );
};
