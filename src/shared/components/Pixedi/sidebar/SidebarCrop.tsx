import { Crop, Image, Square } from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import type { ActionCrop } from "../types";
import { ButtonCrop } from "../ui";
import styles from "./sidebar.module.css";

export const SidebarCrop = () => {
  const { currentAction, setCurrentAction, getLastHistoryItem, setSidebar } =
    usePixediContext();
  const { name, args } = currentAction || {};
  const currentValue = name === "crop" ? (args?.id as string) : "";
  const { width, height } = getLastHistoryItem();
  const originRatio = width / height;

  const handleClick = (value: string) => {
    if (value === currentValue) {
      return;
    }

    setCurrentAction({
      name: "crop",
      args: {
        id: value,
        ratio: value === "1:1" ? 1 : originRatio,
        isFree: value === "freeform",
      },
    });
    setSidebar(false);
  };

  return (
    <div className={styles.sidebarCrop}>
      <h4>Crop</h4>
      <div className={styles.sidebarCropRatios}>
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
