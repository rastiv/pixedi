import { Rotate } from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import { Button } from "../ui";
import styles from "./sidebar.module.css";

const SidebarRotate = () => {
  const { setCurrentAction, setSidebar } = usePixediContext();

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
