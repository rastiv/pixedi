import { usePixediContext } from "../provider/usePixediContext";
import { presetsData } from "../constants";
import type { ActionCrop } from "../types";
import { Select } from "../ui";
import styles from "./Sidebar.module.css";

const presetOptions = presetsData.map((p) => p.options).flat();

export const SidebarPresets = () => {
  const { setCurrentAction, currentAction, setSidebar } = usePixediContext();
  const currentValue =
    currentAction?.name === "crop" &&
    presetOptions.some((preset) => preset.value === currentAction.args.id)
      ? currentAction.args.id
      : "";

  const handleChange = (value: string | null) => {
    if (!value) {
      return;
    }

    const flattenedData = presetsData.map((p) => p.options).flat();
    const option = flattenedData.find((po) => po.value === value);
    if (!option) {
      return;
    }

    const ratio = option.w / option.h;

    const args: ActionCrop = {
      id: value,
      ratio,
      isFree: false,
      preset: { width: option.w, height: option.h },
    };

    setCurrentAction({ name: "crop", args });
    setSidebar(false);
  };

  return (
    <div className={styles.sidebarPreset}>
      <h4>Presets</h4>
      <div>
        <Select
          value={currentValue}
          placeholder="Select a preset"
          onChange={handleChange}
          items={presetsData}
        />
      </div>
    </div>
  );
};
