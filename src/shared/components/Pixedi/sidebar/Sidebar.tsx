import { useBellow } from "../hooks";
import {
  Crop,
  FlipH,
  Fullscreen,
  Presets,
  Rotate,
  Settings,
  X,
} from "../assets/icons";
import { Button, Separator } from "../ui";
import { SidebarResize } from "./SidebarResize";
import { SidebarCrop } from "./SidebarCrop";
import { SidebarPresets } from "./SidebarPresets";
import { SidebarFlip } from "./SidebarFlip";
import SidebarRotate from "./SidebarRotate";
import { usePixediContext } from "../provider/usePixediContext";
import buttonStyles from "../ui/button/Button.module.css";
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
  const isBellowMd = useBellow("md");
  const tools = settings?.tools || [];
  const actionName = currentAction?.name;
  const { width, height } = getLastHistoryItem() ?? { width: 0, height: 0 };

  const handleClick = (tool: Tools) => {
    switch (tool) {
      case ActionName.RESIZE:
        setCurrentAction({ name: "resize", args: { width, height } });
        break;
      case ActionName.CROP:
        setCurrentAction({
          name: "crop",
          args: { id: "", ratio: 1, isFree: true },
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
  };

  return (
    <nav
      className={styles.sidebar}
      style={{
        transform:
          isBellowMd && isSidebarOpen ? "translateX(-110%)" : "translateX(0%)",
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
          >
            {icon}
          </div>
        );
      })}
    </nav>
    // <>
    //   <Button
    //     variant="outline"
    //     className={styles.settings}
    //     onClick={() => setSidebar(true)}
    //   >
    //     <Settings />
    //   </Button>
    //   <div
    //     className={styles.sidebar}
    //     style={{
    //       transform:
    //         isBellowMd && isSidebarOpen
    //           ? "translateX(-100%)"
    //           : "translateX(0%)",
    //     }}
    //   >
    //     <div className={styles.container}>
    //       <div className={styles.content}>
    //         {isBellowMd && (
    //           <Button
    //             variant="ghost"
    //             className={`${styles.closeBtn} ${buttonStyles.rect}`}
    //             onClick={() => setSidebar(false)}
    //           >
    //             <X />
    //           </Button>
    //         )}
    //         <SidebarResize />
    //         <Separator className={styles.separator} />
    //         <SidebarCrop />
    //         <Separator className={styles.separator} />
    //         <SidebarPresets />
    //         <Separator className={styles.separator} />
    //         <div className={styles.flipRotate}>
    //           <SidebarFlip />
    //           <SidebarRotate />
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </>
  );
};
