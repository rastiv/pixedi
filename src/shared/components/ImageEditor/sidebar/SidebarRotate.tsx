import { Rotate } from "../assets/icons";
import { useImageEditorContext } from "../provider/useImageEditorContext";
import { Button } from "../ui";
import styles from "./sidebar.module.css";

const SidebarRotate = () => {
  const { setCurrentAction, setSidebar } = useImageEditorContext();

  const handleClick = () => {
    setCurrentAction({ name: "rotate", args: null });
    setSidebar(false);
  };

  return (
    <Button
      variant="outline"
      className={styles.sidebarResize}
      onClick={handleClick}
    >
      <div className={styles.sidebarResizeIcon}>
        <Rotate />
        Rotate
      </div>
    </Button>
  );
};

export default SidebarRotate;
