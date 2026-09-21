import { Select, SaveCloseGroup, SurfaceTool } from "../ui";
import { usePreset } from "./usePreset";
import styles from "./PresetTools.module.css";

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
    <SurfaceTool>
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
