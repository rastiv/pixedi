import { CropButtonGroup } from "./CropButtonGroup";
import { SaveCloseGroup, SurfaceTool } from "../ui";
import { useCrop } from "./useCrop";

export const CropTools = () => {
  const { currentValue, handleChange, handleSave, handleClose, isSaving } =
    useCrop();

  return (
    <SurfaceTool>
      <CropButtonGroup value={currentValue} onChange={handleChange} />
      <SaveCloseGroup
        onSave={handleSave}
        onClose={handleClose}
        saving={isSaving}
      />
    </SurfaceTool>
  );
};
