import { FlipH } from "../assets/icons";
import { useImageEditorContext } from "../provider/useImageEditorContext";
import { Button } from "../ui";
import styles from "./sidebar.module.css";

export const SidebarFlip = () => {
  const { setCurrentAction, setSidebar } = useImageEditorContext();

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
