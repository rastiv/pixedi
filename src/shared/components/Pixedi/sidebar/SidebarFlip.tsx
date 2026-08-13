import { FlipH } from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import { Button } from "../ui";
import { ActionName } from "../types";
import styles from "./sidebar.module.css";

export const SidebarFlip = () => {
  const { setCurrentAction, setSidebar } = usePixediContext();

  const handleClick = () => {
    setCurrentAction({
      name: ActionName.FLIP,
      args: { horizontal: false, vertical: false },
    });
    setSidebar(false);
  };

  return (
    <Button
      variant="outline"
      className={styles.sidebarResize}
      onClick={handleClick}
    >
      <div className={styles.sidebarResizeIcon}>
        <FlipH />
        Flip
      </div>
    </Button>
  );
};
