import { useState } from "react";
import { filters, filterUrls } from "../constants";
import { ActionName } from "../types";
import { Compare, Filters, PredefinedFilters } from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import { Button, SaveCloseGroup, Select, SurfaceTool, Tooltip } from "../ui";
import type { SelectOption } from "../ui/select/Select";
import { SvgFilters } from "./SvgFilters";
import styles from "./FilterTools.module.css";

export const FilterTools = () => {
  const [selected, setSelected] = useState<string>("saturate");
  const { previewUrl, currentAction, setCurrentAction, setSidebar } =
    usePixediContext();

  const url =
    currentAction?.name === ActionName.FILTERS ? currentAction.url : "";
  const compare =
    currentAction?.name === ActionName.FILTERS ? currentAction.compare : false;

  const handleChangeMode = () => {
    if (currentAction?.name !== ActionName.FILTERS) return;
    setCurrentAction({
      ...currentAction,
      url: url ? "" : "vintage",
    });
  };

  const toggleCompare = () => {
    if (currentAction?.name !== ActionName.FILTERS) return;
    setCurrentAction({
      ...currentAction,
      compare: !compare,
    });
  };

  const handleChange = (value: string) => {
    setSelected(value);
  };

  const handleChangeWhenUrl = (value: string) => {
    if (currentAction?.name !== ActionName.FILTERS) return;
    setCurrentAction({
      ...currentAction,
      url: value,
    });
  };

  const handleSave = () => {
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
      {!url && <div className={styles.row1}>Slider</div>}
      <div className={styles.row2}>
        <Tooltip position="top">
          <Button
            variant="outline"
            aria-label="Compare"
            data-tooltip="Compare"
            onClick={toggleCompare}
            className={compare ? styles.active : ""}
          >
            <Compare />
          </Button>
        </Tooltip>
        <Tooltip position="top">
          <Button
            variant="outline"
            aria-label={url ? "Filters" : "Predefined Filters"}
            data-tooltip={url ? "Filters" : "Predefined Filters"}
            onClick={handleChangeMode}
          >
            {url ? <Filters /> : <PredefinedFilters />}
          </Button>
        </Tooltip>

        <Select
          items={url ? filterUrls : filters}
          value={url || selected}
          placeholder="Select filter"
          className={styles.select}
          renderOption={url ? getFilterOptionWhenUrl : undefined}
          onChange={url ? handleChangeWhenUrl : handleChange}
        />
        <SaveCloseGroup onSave={handleSave} onClose={handleClose} />
      </div>
    </SurfaceTool>
  );
};
