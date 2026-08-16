import { Fullscreen } from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import { Button } from "../ui";
import { ActionName } from "../types";
import styles from "./Sidebar.module.css";

export const SidebarResize = () => {
  const { getLastHistoryItem, setCurrentAction, setSidebar } =
    usePixediContext();
  const { width, height } = getLastHistoryItem() ?? { width: 0, height: 0 };

  const handleClick = () => {
    setCurrentAction({ name: ActionName.RESIZE, args: { width, height } });
    setSidebar(false);
  };

  return (
    <Button variant="outline" className={styles.resize} onClick={handleClick}>
      <div className={styles.resizeIcon}>
        <Fullscreen />
        Resize
      </div>
      <div className={styles.resizeSize}>
        {width} x {height}
      </div>
    </Button>
  );
};
