import { Select, SaveCloseGroup, SurfaceTool } from "../ui";
import { usePreset } from "./usePreset";
import styles from "./Preset.module.css";

export const PresetTools = () => {
  const {
    currentValue,
    presetsData,
    handleChange,
    handleSave,
    handleClose,
    isSaving,
  } = usePreset();

  return (
    <SurfaceTool className={styles.tools}>
      <Select
        value={currentValue}
        placeholder="Select preset"
        onChange={handleChange}
        items={presetsData}
        className={styles.select}
      />
      <SaveCloseGroup
        onSave={handleSave}
        onClose={handleClose}
        saving={isSaving}
      />
    </SurfaceTool>
  );
};
