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
  } = useFilters();

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

  return (
    <SurfaceTool className={styles.tools}>
      {!isUrl && selectedFilterItem && (
        <div className={styles.row1}>
          <div className={styles.min}>
            {selectedFilterItem.min}
            {selectedFilterItem.unit}
          </div>
          <Slider
            className={styles.slider}
            min={selectedFilterItem.min}
            max={selectedFilterItem.max}
            step={selectedFilterItem.step}
            value={sliderValue}
            isTooltip
            unit={selectedFilterItem.unit}
            onInput={handleSliderInput}
            onChange={handleSliderChange}
          />
          <div className={styles.max}>
            {selectedFilterItem.max}
            {selectedFilterItem.unit}
          </div>
        </div>
      )}
      <div className={styles.row2}>
        <Tooltip position="top">
          <Button
            variant="outline"
            aria-label="Compare"
            data-tooltip="Compare"
            onClick={handleToggleCompare}
            className={showCompare ? styles.active : ""}
          >
            <Compare />
          </Button>
        </Tooltip>
        <Tooltip position="top">
          <Button
            variant="outline"
            aria-label={isUrl ? "Filters" : "Predefined Filters"}
            data-tooltip={isUrl ? "Filters" : "Predefined Filters"}
            onClick={toggleIsUrl}
          >
            {isUrl ? <Filters /> : <PredefinedFilters />}
          </Button>
        </Tooltip>
        <Select
          items={isUrl ? filterUrlsData : filters}
          value={isUrl ? selectedUrl : selectedFilter}
          placeholder="Select filter"
          className={styles.select}
          renderOption={isUrl ? getFilterOptionWhenUrl : undefined}
          onChange={isUrl ? handleChangeWhenUrl : handleChange}
        />
        <SaveCloseGroup onSave={handleSave} onClose={handleClose} />
      </div>
    </SurfaceTool>
  );
};
