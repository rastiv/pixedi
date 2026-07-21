import { useImageEditorContext } from "../provider/useImageEditorContext";
import { presetsData } from "../constants";
import type { ActionCrop } from "../types";
import { Select } from "../ui";

const presetOptions = presetsData.map((p) => p.options).flat();

export const SidebarPresets = () => {
  const { setCurrentAction, currentAction, setSidebar } =
    useImageEditorContext();
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
      preset: { w: option.w, h: option.h },
    };

    setCurrentAction({ name: "crop", args });
    setSidebar(false);
  };

  return (
    <div className="sidebar-preset">
      <h4>Presets</h4>
      <div className="relative">
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
