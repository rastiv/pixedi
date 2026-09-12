import { useState } from "react";
import { filtersData, filterUrlsData } from "../constants";
import { ActionName, type FilterData } from "../types";
import { Compare, Filters, PredefinedFilters } from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import {
  Button,
  SaveCloseGroup,
  Select,
  SurfaceTool,
  Tooltip,
  Slider,
} from "../ui";
import type { SelectOption } from "../ui/select/Select";
import { SvgFilters } from "./SvgFilters";
import styles from "./FilterTools.module.css";

export const FilterTools = () => {
  const {
    showCompare,
    previewUrl,
    getLastHistoryItem,
    getLastFilter,
    setCurrentAction,
    setSidebar,
    toggleCompare,
    addToHistory,
  } = usePixediContext();

  const { width, height } = getLastHistoryItem();
  const lastFilter = getLastFilter();
  // console.log("lastFilter", lastFilter);

  const [selectedFilter, setSelectedFilter] = useState<string>("saturate");
  const [selectedUrl, setSelectedUrl] = useState<string>("vintage");
  const [filters, setFilters] = useState<FilterData[]>(filtersData);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [isUrl, setIsUrl] = useState<boolean>(false);

  const handleSliderInput = (value: number) => {
    // console.log("slider-value", value);
  };

  const selectedFilterItem = filters.find(
    (filter) => filter.value === selectedFilter,
  );

  const handleChange = (value: string) => {
    setSelectedFilter(value);
    setSliderValue(
      filters.find((filter) => filter.value === value)?.sliderValue || 0,
    );
  };

  const handleChangeWhenUrl = (value: string) => {
    setSelectedUrl(value);
  };

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    setFilters((prev) =>
      prev.map((filter) =>
        filter.value === selectedFilter
          ? {
              ...filter,
              sliderValue: value,
              rightLabel: `${value}${filter.unit}`,
            }
          : filter,
      ),
    );
  };

  const handleSave = () => {
    addToHistory({
      width,
      height,
      action: {
        name: ActionName.FILTERS,
        args: {
          ...(isUrl
            ? { url: selectedUrl }
            : Object.fromEntries(
                filters.map((filter) => [filter.value, filter.sliderValue]),
              )),
        },
      },
    });
    setSidebar(true);
  };

  const handleClose = () => {
    setCurrentAction(null);
    setSidebar(true);
  };

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
      <SvgFilters />
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
            onClick={toggleCompare}
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
            onClick={() => setIsUrl(!isUrl)}
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
