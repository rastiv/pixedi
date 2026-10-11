import { OrbitalSelector, SaveCloseGroup } from "../ui";
import { useRotate } from "./useRotate";
import styles from "./Rotate.module.css";

export const RotateTools = () => {
  const {
    selectorValue,
    isChanged,
    handleRotate,
    handleSave,
    handleClose,
    isSaving,
  } = useRotate();

  return (
    <div className={styles.rotate}>
      <OrbitalSelector
        value={selectorValue}
        onInput={handleRotate}
        onChange={handleRotate}
        className={styles.selector}
        angles={[0, 45, 90, 135, 180, 225, 270, 315]}
      >
        <div className={styles.tools}>
          <div className={styles.additional}>{Math.round(selectorValue)}°</div>
          <div className={styles.content}>
            <SaveCloseGroup
              disabled={!isChanged}
              saving={isSaving}
              onSave={handleSave}
              onClose={handleClose}
            />
          </div>
        </div>
      </OrbitalSelector>
    </div>
  );
};
