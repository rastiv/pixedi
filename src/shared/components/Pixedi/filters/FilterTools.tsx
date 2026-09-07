import { useState } from "react";
import { filters } from "../constants";
import { ActionName } from "../types";
import { Compare, Filters, PredefinedFilters } from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import { Button, SaveCloseGroup, Select, SurfaceTool, Tooltip } from "../ui";
import styles from "./FilterTools.module.css";

export const FilterTools = () => {
  const [selected, setSelected] = useState<string>("saturate");
  const { currentAction, setCurrentAction } = usePixediContext();

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

  const handleSave = () => {
    return null;
  };

  const handleClose = () => {
    return null;
  };

  return (
    <SurfaceTool>
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
      <Tooltip position="top">
        <Button
          variant="outline"
          aria-label="Compare"
          data-tooltip="Compare"
          onClick={toggleCompare}
          className={compare ? styles.compareActive : ""}
        >
          <Compare />
        </Button>
      </Tooltip>
      <Select
        value={selected}
        placeholder="Select filter"
        onChange={(value) => setSelected(value)}
        items={filters}
        className={styles.select}
      />
      <SaveCloseGroup onSave={handleSave} onClose={handleClose} />
    </SurfaceTool>
  );
};
