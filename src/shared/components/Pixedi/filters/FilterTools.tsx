import { useRef } from "react";
import { filterUrlsData } from "../constants";
import { Compare, Filters, PredefinedFilters } from "../assets/icons";
import {
  Button,
  SaveCloseGroup,
  Select,
  SurfaceTool,
  Tooltip,
  Slider,
} from "../ui";
import type { SelectOption } from "../ui/select/Select";
import { useFilters } from "./useFilters";
import styles from "./FilterTools.module.css";

export const FilterTools = () => {
  const valueRef = useRef<HTMLDivElement>(null);
  const {
    showCompare,
    previewUrl,
    isUrl,
    toggleIsUrl,
    filters,
    selectedFilter,
    selectedFilterItem,
    selectedUrl,
    sliderValue,
    handleToggleCompare,
    handleSliderInput,
    handleSliderChange,
    handleChange,
    handleChangeWhenUrl,
    handleSave,
    handleClose,
    isSaving,
    i18n,
  } = useFilters(valueRef);

  const getFilterOptionWhenUrl = (option: SelectOption) => {
    return (
      <div className={styles.option}>
        <img
          src={previewUrl}
          alt={option.label}
          style={{ filter: `url(#${option.value})` }}
        />
      </div>
    );
  };

  const sliderContent = selectedFilterItem && !isUrl && (
    <div className={styles.sliderCintainer}>
      <Slider
        className={styles.slider}
        min={selectedFilterItem.min}
        max={selectedFilterItem.max}
        step={selectedFilterItem.step}
        value={sliderValue}
        unit={selectedFilterItem.unit}
        onInput={handleSliderInput}
        onChange={handleSliderChange}
      />
      <div className={styles.value}>
        <div ref={valueRef}>{selectedFilterItem.sliderValue}</div>
        <div>{selectedFilterItem.unit}</div>
      </div>
    </div>
  );

  return (
    <SurfaceTool className={styles.tools} additional={sliderContent}>
      <div className={styles.toolsContainer}>
        <Tooltip position="top">
          <Button
            variant="outline"
            aria-label={i18n("compare")}
            data-tooltip={i18n("compare")}
            onClick={handleToggleCompare}
            className={showCompare ? styles.active : ""}
          >
            <Compare />
          </Button>
        </Tooltip>
        <Tooltip position="top">
          <Button
            variant="outline"
            aria-label={isUrl ? i18n("filters") : i18n("predefinedFilters")}
            data-tooltip={isUrl ? i18n("filters") : i18n("predefinedFilters")}
            onClick={toggleIsUrl}
          >
            {isUrl ? <Filters /> : <PredefinedFilters />}
          </Button>
        </Tooltip>
        <Select
          items={isUrl ? filterUrlsData : filters}
          value={isUrl ? selectedUrl : selectedFilter}
          placeholder=""
          className={styles.select}
          renderOption={isUrl ? getFilterOptionWhenUrl : undefined}
          onChange={isUrl ? handleChangeWhenUrl : handleChange}
        />
        <SaveCloseGroup
          onSave={handleSave}
          onClose={handleClose}
          saving={isSaving}
        />
      </div>
    </SurfaceTool>
  );
};
