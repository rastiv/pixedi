import { useRef } from "react";
import { Lock } from "../assets/icons";
import { SaveCloseGroup, InputPixel, SurfaceTool, Slider } from "../ui";
import { useResize } from "./useResize";
import styles from "./Resize.module.css";

export const ResizeTools = () => {
  const valueRef = useRef<HTMLDivElement>(null);
  const {
    resizeRef,
    MIN_SCALE,
    MAX_SCALE,
    width,
    height,
    scale,
    currentWidth,
    currentHeight,
    setWidth,
    setHeight,
    handleWidthBlur,
    handleHeightBlur,
    handleSliderInput,
    handleSliderChange,
    save,
    close,
    isSaving,
  } = useResize(valueRef);

  const sliderContent = (
    <div className={styles.sliderCintainer}>
      <Slider
        className={styles.slider}
        min={MIN_SCALE}
        max={MAX_SCALE}
        step={1}
        value={scale}
        unit="%"
        onInput={handleSliderInput}
        onChange={handleSliderChange}
      />
      <div className={styles.value}>
        <div ref={valueRef}>100</div>
        <div>%</div>
      </div>
    </div>
  );

  return (
    <SurfaceTool
      ref={resizeRef}
      className={styles.tools}
      additional={sliderContent}
    >
      <div className={styles.toolsContainer}>
        <InputPixel
          value={width}
          name="width"
          label="Width"
          style={{ width: "88px" }}
          onChange={(event) => setWidth(Number(event.target.value))}
          onBlur={handleWidthBlur}
        />
        <Lock className={styles.toolsLock} />
        <InputPixel
          value={height}
          name="height"
          label="Height"
          style={{ width: "88px" }}
          onChange={(event) => setHeight(Number(event.target.value))}
          onBlur={handleHeightBlur}
        />
      </div>
      <SaveCloseGroup
        onSave={save}
        onClose={close}
        saving={isSaving}
        disabled={width === currentWidth && height === currentHeight}
      />
    </SurfaceTool>
  );
};
