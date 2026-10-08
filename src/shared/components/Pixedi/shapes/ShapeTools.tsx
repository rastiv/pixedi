import { useRef } from "react";
import {
  Button,
  SelectIcon,
  Tooltip,
  SaveCloseGroup,
  SurfaceTool,
  Slider,
} from "../ui";
import { shapes } from "../constants";
import { Dashed, Stripes } from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import { useShape } from "./useShape";
import styles from "./Shape.module.css";

const selectItems = Object.entries(shapes).map(([key, value]) => ({
  value: key,
  label: value,
}));

export const ShapeTools = () => {
  const { i18n } = usePixediContext();
  const valueRef = useRef<HTMLDivElement>(null);
  const {
    shape,
    outlined,
    sliderValue,
    handleSliderInput,
    handleSliderChange,
    handleChangeShape,
    handleToggleOutlined,
    handleSave,
    handleClose,
    isSaving,
    MIN_OUTLINE,
    MAX_OUTLINE,
  } = useShape(valueRef);
  const outlineLabel = outlined ? i18n("fullfield") : i18n("outlined");

  const sliderContent = outlined && (
    <div className={styles.sliderContainer}>
      <Slider
        className={styles.slider}
        min={MIN_OUTLINE}
        max={MAX_OUTLINE}
        step={0.5}
        value={7.5}
        unit="%"
        onInput={handleSliderInput}
        onChange={handleSliderChange}
      />
      <div className={styles.value}>
        <div ref={valueRef}>{sliderValue.toFixed(1)}</div>
        <div>%</div>
      </div>
    </div>
  );

  return (
    <SurfaceTool className={styles.tools} additional={sliderContent}>
      <div className={styles.toolsContainer}>
        <div className={styles.toolsGroup}>
          <Tooltip position="top">
            <Button
              variant="outline"
              aria-label={outlineLabel}
              data-tooltip={outlineLabel}
              onClick={handleToggleOutlined}
            >
              {outlined ? <Stripes /> : <Dashed />}
            </Button>
          </Tooltip>
          <SelectIcon
            items={selectItems}
            value={shape}
            onChange={handleChangeShape}
            className={styles.selector}
          />
          {outlined && <div className={styles.spacer} />}
        </div>
        <SaveCloseGroup
          onSave={handleSave}
          onClose={handleClose}
          saving={isSaving}
        />
      </div>
    </SurfaceTool>
  );
};
