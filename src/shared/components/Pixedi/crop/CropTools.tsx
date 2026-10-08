import { CropButtonGroup } from "./CropButtonGroup";
import { SaveCloseGroup, SurfaceTool } from "../ui";
import { useCrop } from "./useCrop";
import styles from "./Crop.module.css";

export const CropTools = () => {
  const { currentValue, handleChange, handleSave, handleClose, isSaving } =
    useCrop();

  return (
    <SurfaceTool className={styles.tools}>
      <CropButtonGroup value={currentValue} onChange={handleChange} />
      <SaveCloseGroup
        onSave={handleSave}
        onClose={handleClose}
        saving={isSaving}
      />
    </SurfaceTool>
  );
};
