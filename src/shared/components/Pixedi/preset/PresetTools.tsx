import { Select, SaveCloseGroup } from "../ui";
import { usePreset } from "./usePreset";
import styles from "./PresetTools.module.css";

export const PresetTools = () => {
  const { currentValue, presetsData, handleChange, handleSave, handleClose } =
    usePreset();

  return (
    <div className={styles.preset}>
      <Select
        value={currentValue}
        placeholder="Select a preset"
        onChange={handleChange}
        items={presetsData}
        className={styles.select}
      />
      <SaveCloseGroup onSave={handleSave} onClose={handleClose} />
    </div>
  );
};
