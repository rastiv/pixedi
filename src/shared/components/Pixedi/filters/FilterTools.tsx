import { useEffect, useState } from "react";
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
import { emitFilterUpdate } from "../eventBus";
import styles from "./FilterTools.module.css";

export const FilterTools = () => {
  const {
    showCompare,
    previewUrl,
    getLastFilter,
    getLastHistoryItem,
    setCurrentAction,
    setSidebar,
    toggleCompare,
    addToHistory,
    eventBus,
  } = usePixediContext();
  const { width, height } = getLastHistoryItem();
  const { action } = getLastFilter() || {};
  const args = (action?.args || {}) as Record<string, string | number>;
  const prevUrl = args?.url as string;
  const prevFilters = filtersData.map((filter) => ({
    ...filter,
    sliderValue: (args[filter.value] ?? filter.sliderValue) as number,
    rightLabel: `${args[filter.value] ?? filter.sliderValue}${filter.unit}`,
  }));
  const prevSaturation = prevFilters.find(
    (filter) => filter.value === "saturate",
  )?.sliderValue;

  const [selectedFilter, setSelectedFilter] = useState<string>("saturate");
  const [selectedUrl, setSelectedUrl] = useState<string>(prevUrl ?? "vintage");
  const [filters, setFilters] = useState<FilterData[]>(prevFilters);
  const [sliderValue, setSliderValue] = useState<number>(prevSaturation ?? 0);
  const [isUrl, setIsUrl] = useState<boolean>(Boolean(prevUrl));

  const filtersObject = Object.fromEntries(
    filters.map((filter) => [filter.value, filter.sliderValue]),
  );

  const handleSliderInput = (value: number) => {
    emitFilterUpdate(eventBus, {
      ...filtersObject,
      [selectedFilter]: value,
    });
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
    emitFilterUpdate(eventBus, { url: value });
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

  useEffect(() => {
    if (isUrl) {
      emitFilterUpdate(eventBus, { url: selectedUrl });
    } else {
      emitFilterUpdate(eventBus, {
        ...filtersObject,
        [selectedFilter]: sliderValue,
      });
    }
  }, [
    isUrl,
    selectedUrl,
    sliderValue,
    filtersObject,
    selectedFilter,
    eventBus,
  ]);

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
