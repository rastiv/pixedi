import { useEffect, useMemo, useState } from "react";
import { filtersData } from "../constants";
import { ActionName, type ActionFilter, type FilterData } from "../types";
import { usePixediContext } from "../provider/usePixediContext";
import { emitFilterUpdate } from "../eventBus";

export const useFilters = () => {
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

  const filtersObject = useMemo(
    () => Object.fromEntries(filters.map((f) => [f.value, f.sliderValue])),
    [filters],
  );

  const handleSliderInput = (value: number) => {
    emitFilterUpdate(eventBus, {
      ...filtersObject,
      [selectedFilter]: value,
    } as ActionFilter);
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
        } as ActionFilter,
      },
    });
    setSidebar(true);
  };

  const handleClose = () => {
    setCurrentAction(null);
    setSidebar(true);
  };

  const toggleIsUrl = () => setIsUrl(!isUrl);

  useEffect(() => {
    if (isUrl) {
      emitFilterUpdate(eventBus, { url: selectedUrl });
    } else {
      emitFilterUpdate(eventBus, {
        ...filtersObject,
        [selectedFilter]: sliderValue,
      } as ActionFilter);
    }
  }, [
    isUrl,
    selectedUrl,
    sliderValue,
    filtersObject,
    selectedFilter,
    eventBus,
  ]);

  return {
    showCompare,
    previewUrl,
    toggleCompare,
    isUrl,
    toggleIsUrl,
    filters,
    selectedFilter,
    selectedFilterItem,
    selectedUrl,
    sliderValue,
    handleSliderInput,
    handleSliderChange,
    handleChange,
    handleChangeWhenUrl,
    handleSave,
    handleClose,
  };
};
