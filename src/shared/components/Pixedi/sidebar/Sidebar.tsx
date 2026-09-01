import { useBellow } from "../hooks";
import { Crop, FlipH, Fullscreen, Presets, Rotate } from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import { ActionName, type Tools } from "../types";
import styles from "./Sidebar.module.css";

type MappedTool = {
  icon: React.ReactNode;
  label: string;
};

const mapTools = (tool: Tools): MappedTool | null => {
  switch (tool) {
    case ActionName.RESIZE:
      return {
        icon: <Fullscreen />,
        label: "Resize",
      };
    case ActionName.CROP:
      return {
        icon: <Crop />,
        label: "Crop",
      };
    case ActionName.PRESET_CROP:
      return {
        icon: <Presets />,
        label: "Presets",
      };
    case ActionName.FLIP:
      return {
        icon: <FlipH />,
        label: "Flip",
      };
    case ActionName.ROTATE:
      return {
        icon: <Rotate />,
        label: "Rotate",
      };
    default:
      return null;
  }
};

export const Sidebar = () => {
  const {
    settings,
    sidebar: isSidebarOpen,
    currentAction,
    getLastRotation,
    getLastHistoryItem,
    setCurrentAction,
    setSidebar,
  } = usePixediContext();
  const isBellowSm = useBellow("sm");
  const tools = settings?.tools || [];
  const actionName = currentAction?.name;
  const { width, height } = getLastHistoryItem() ?? { width: 0, height: 0 };

  const handleClick = (tool: Tools) => {
    if (tools.includes(tool) && actionName === tool) {
      setCurrentAction(null);
      return;
    }

    switch (tool) {
      case ActionName.RESIZE:
        setCurrentAction({ name: "resize", args: { width, height } });
        break;
      case ActionName.CROP:
        setCurrentAction({
          name: "crop",
          args: { id: "freeform", ratio: width / height, isFree: true },
        });
        break;
      case ActionName.PRESET_CROP:
        setCurrentAction({
          name: "presetCrop",
          args: { id: "", ratio: 1, isFree: true },
        });
        break;
      case ActionName.FLIP:
        setCurrentAction({
          name: "flip",
          args: { horizontal: false, vertical: false },
        });
        break;
      case ActionName.ROTATE:
        setCurrentAction({
          name: "rotate",
          args: { degrees: getLastRotation() },
        });
        break;
    }

    setSidebar(true);
  };

  return (
    <nav
      className={styles.sidebar}
      style={{
        transform:
          isBellowSm && isSidebarOpen ? "translateX(-100%)" : "translateX(0%)",
      }}
    >
      {tools.map((tool) => {
        const mappedTool = mapTools(tool);
        if (!mappedTool) return null;
        const { icon, label } = mappedTool;
        return (
          <div
            key={tool}
            className={`${styles.item} ${actionName === tool ? styles.selected : ""}`}
            onClick={() => handleClick(tool)}
            title={label}
          >
            {icon}
          </div>
        );
      })}
    </nav>
  );
};
