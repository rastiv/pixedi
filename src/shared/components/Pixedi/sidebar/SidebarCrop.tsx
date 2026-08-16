import { Crop, Image, Square } from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import { ButtonCrop } from "../ui";
import styles from "./Sidebar.module.css";

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
    <div className={styles.crop}>
      <h4>Crop</h4>
      <div className={styles.ratio}>
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
