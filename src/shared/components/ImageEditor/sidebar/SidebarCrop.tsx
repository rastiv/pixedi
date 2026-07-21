import { Crop, Image, Square } from "../assets/icons";
import { useImageEditorContext } from "../provider/useImageEditorContext";
import type { ActionCrop } from "../types";
import { ButtonCrop } from "../ui";

export const SidebarCrop = () => {
  const { currentAction, setCurrentAction, getLastHistoryItem, setSidebar } =
    useImageEditorContext();
  const { name, args } = currentAction || {};
  const currentValue = name === "crop" ? (args?.id as string) : "";
  const { width, height } = getLastHistoryItem();
  const originRatio = width / height;

  const handleClick = (value: string) => {
    if (value === currentValue) {
      return;
    }

    const ratio = value === "1:1" ? 1 : originRatio;

    const args: ActionCrop = {
      id: value,
      ratio,
      isFree: value === "freeform",
      preset: null,
    };

    setCurrentAction({ name: "crop", args });
    setSidebar(false);
  };

  return (
    <div className="sidebar-crop">
      <h4>Crop</h4>
      <div className="sidebar-crop-ratios">
        <ButtonCrop
          label="Freeform"
          icon={<Crop />}
          active={currentValue === "freeform"}
          onClick={() => handleClick("freeform")}
        />
        <ButtonCrop
          label="Original"
          icon={<Image />}
          active={currentValue === "original"}
          onClick={() => handleClick("original")}
        />
        <ButtonCrop
          label="1:1"
          icon={<Square />}
          active={currentValue === "1:1"}
          onClick={() => handleClick("1:1")}
        />
      </div>
    </div>
  );
};
