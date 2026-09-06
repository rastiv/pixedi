import { Button, SaveCloseGroup, Select, SurfaceTool, Tooltip } from "../ui";
import { filters } from "../constants";
import styles from "./FilterTools.module.css";
import { PredefinedFilters } from "@/shared/components/Pixedi/assets/icons";

export const FilterTools = () => {
  const handleSave = () => {
    return null;
  };

  const handleClose = () => {
    return null;
  };

  const currentValue = "";

  const handleChange = () => {
    return null;
  };

  return (
    <SurfaceTool>
      <Tooltip position="top">
        <Button
          variant="outline"
          aria-label="Predefined Filters"
          data-tooltip="Predefined Filters"
        >
          <PredefinedFilters />
        </Button>
      </Tooltip>
      <Select
        value={currentValue}
        placeholder="Select filter"
        onChange={handleChange}
        items={filters}
        className={styles.select}
      />
      <SaveCloseGroup onSave={handleSave} onClose={handleClose} />
    </SurfaceTool>
  );
};
