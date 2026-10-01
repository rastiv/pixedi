import { usePixediContext } from "../provider/usePixediContext";
import { ResizeTools } from "../resize";
import { CropTools, CropInteractBox } from "../crop";
import { PresetTools } from "../preset";
import { FlipTools } from "../flip";
import { RotateTools } from "../rotate";
import { FilterTools, FilterInteractBox } from "../filters";
import { ShapeTools, ShapeInteractBox } from "../shapes";
import { Preview } from "../preview";
import { ActionName } from "../types";
import styles from "./Frame.module.css";

export const Frame = () => {
  const { settings, currentAction } = usePixediContext();

  const isResize = currentAction?.name === ActionName.RESIZE;
  const isCrop = currentAction?.name === ActionName.CROP;
  const isPreset = currentAction?.name === ActionName.PRESET_CROP;
  const isFlip = currentAction?.name === ActionName.FLIP;
  const isRotate = currentAction?.name === ActionName.ROTATE;
  const isFilters = currentAction?.name === ActionName.FILTERS;
  const isShapes = currentAction?.name === ActionName.SHAPES;
  const isFade = isCrop || isPreset || isShapes;

  const frameClassName = `
    ${styles.frame} 
    ${settings?.background ? styles[`bg-${settings.background}`] : ""}
  `;

  return (
    <div className={frameClassName}>
      <Preview faded={isFade} />
      {isResize && <ResizeTools />}
      {isCrop && <CropTools />}
      {isPreset && <PresetTools />}
      {isFlip && <FlipTools />}
      {isRotate && <RotateTools />}
      {isFilters && <FilterTools />}
      {isShapes && <ShapeTools />}

      {(isCrop || isPreset) && (
        <CropInteractBox key={currentAction?.args?.id} />
      )}
      {isFilters && <FilterInteractBox />}
      {isShapes && <ShapeInteractBox />}
    </div>
  );
};
