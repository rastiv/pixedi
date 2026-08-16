import { Rotate } from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import { Button } from "../ui";
import styles from "./Sidebar.module.css";

const SidebarRotate = () => {
  const { getLastRotation, setCurrentAction, setSidebar } = usePixediContext();

  const handleClick = () => {
    setCurrentAction({ name: "rotate", args: { degrees: getLastRotation() } });
    setSidebar(false);
  };

  return (
    <Button variant="outline" className={styles.resize} onClick={handleClick}>
      <div className={styles.resizeIcon}>
        <Rotate />
        Rotate
      </div>
    </Button>
  );
};

export default SidebarRotate;
