import { CropButtonGroup } from "./CropButtonGroup";
import { SaveCloseGroup } from "../ui";
import { useCrop } from "./useCrop";
import styles from "./Crop.module.css";

export const CropTools = () => {
  const { currentValue, handleChange, handleSave, handleClose } = useCrop();

  return (
    <div className={styles.tools}>
      <CropButtonGroup value={currentValue} onChange={handleChange} />
      <SaveCloseGroup onSave={handleSave} onClose={handleClose} />
    </div>
  );
};
