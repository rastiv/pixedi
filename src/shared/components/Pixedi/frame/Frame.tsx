import { usePixediContext } from "../provider/usePixediContext";
import { ResizeTools } from "../resize";
import { CropInteractBox, CropTools } from "../crop";
import { FlipTools } from "../flip";
import { RotateTools } from "../rotate";
import { Preview } from "../preview";
import { ActionName } from "../types";
import styles from "./Frame.module.css";
import rootStyles from "../index.module.css";

export const Frame = () => {
  const { currentAction } = usePixediContext();

  const isCrop = currentAction?.name === ActionName.CROP;
  const isResize = currentAction?.name === ActionName.RESIZE;
  const isFlip = currentAction?.name === ActionName.FLIP;
  const isRotate = currentAction?.name === ActionName.ROTATE;
  const isFade = isCrop;

  const frameClassName = `${styles.frame} ${isFade ? rootStyles.mask : ""}`;

  return (
    <div className={frameClassName}>
      <Preview style={isCrop ? { opacity: 0.4 } : {}} />
      {isCrop && <CropInteractBox key={currentAction?.args?.id} />}
      {isResize && <ResizeTools />}
      {isCrop && <CropTools />}
      {isFlip && <FlipTools />}
      {isRotate && <RotateTools />}
    </div>
  );
};
