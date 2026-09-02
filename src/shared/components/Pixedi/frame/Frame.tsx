import { usePixediContext } from "../provider/usePixediContext";
import { ResizeTools } from "../resize";
import { CropInteractBox, CropTools } from "../crop";
import { PresetTools } from "../preset";
import { FlipTools } from "../flip";
import { RotateTools } from "../rotate";
import { Preview } from "../preview";
import { ActionName } from "../types";
import styles from "./Frame.module.css";
import rootStyles from "../index.module.css";

export const Frame = () => {
  const { currentAction } = usePixediContext();

  const isResize = currentAction?.name === ActionName.RESIZE;
  const isCrop = currentAction?.name === ActionName.CROP;
  const isPreset = currentAction?.name === ActionName.PRESET_CROP;
  const isFlip = currentAction?.name === ActionName.FLIP;
  const isRotate = currentAction?.name === ActionName.ROTATE;
  const isFade = isCrop || isPreset;

  const frameClassName = `${styles.frame} ${isFade ? rootStyles.mask : ""}`;

  return (
    <div className={frameClassName}>
      <Preview style={isFade ? { opacity: 0.4 } : {}} />
      {isResize && <ResizeTools />}
      {(isCrop || isPreset) && (
        <CropInteractBox key={currentAction?.args?.id} />
      )}
      {isCrop && <CropTools />}
      {isPreset && <PresetTools />}
      {isFlip && <FlipTools />}
      {isRotate && <RotateTools />}
    </div>
  );
};
