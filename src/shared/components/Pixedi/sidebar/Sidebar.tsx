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
  const { width, height } = getLastHistoryItem();

  const handleClick = (tool: Tools) => {
    if (tools.includes(tool) && actionName === tool) {
      setCurrentAction(null);
      return;
    }

    switch (tool) {
      case ActionName.RESIZE:
        setCurrentAction({ name: ActionName.RESIZE, args: { width, height } });
        break;
      case ActionName.CROP:
        setCurrentAction({
          name: ActionName.CROP,
          args: { id: "freeform", ratio: width / height, isFree: true },
        });
        break;
      case ActionName.PRESET_CROP:
        setCurrentAction({
          name: ActionName.PRESET_CROP,
          args: {
            id: "facebook-post",
            ratio: 1200 / 630,
            isFree: false,
            preset: { width: 1200, height: 630 },
          },
        });
        break;
      case ActionName.FLIP:
        setCurrentAction({
          name: ActionName.FLIP,
          args: { horizontal: false, vertical: false },
        });
        break;
      case ActionName.ROTATE:
        setCurrentAction({
          name: ActionName.ROTATE,
          args: { degrees: getLastRotation() },
        });
        break;
    }

    setSidebar(false);
  };

  return (
    <nav
      className={styles.sidebar}
      style={{
        transform: isBellowSm
          ? isSidebarOpen
            ? "translateX(0%)"
            : "translateX(-110%)"
          : undefined,
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
