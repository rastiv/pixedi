import { Fullscreen } from "../assets/icons";
import { useImageEditorContext } from "../provider/useImageEditorContext";
import { Button } from "../ui";
import styles from "./sidebar.module.css";

export const SidebarResize = () => {
  const { getLastHistoryItem, setCurrentAction, setSidebar } =
    useImageEditorContext();
  const { width, height } = getLastHistoryItem() ?? { width: 0, height: 0 };

  const handleClick = () => {
    setCurrentAction({ name: "resize", args: { width, height } });
    setSidebar(false);
  };

  return (
    <Button
      variant="outline"
      className={styles.sidebarResize}
      onClick={handleClick}
    >
      <div className={styles.sidebarResizeIcon}>
        <Fullscreen />
        Resize
      </div>
      <div className={styles.sidebarResizeSize}>
        {width} x {height}
      </div>
    </Button>
  );
};
