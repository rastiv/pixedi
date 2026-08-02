import { FlipH } from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import { Button } from "../ui";
import styles from "./sidebar.module.css";

export const SidebarFlip = () => {
  const { setCurrentAction, setSidebar } = usePixediContext();

  const handleClick = () => {
    setCurrentAction({ name: "flip", args: null });
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
