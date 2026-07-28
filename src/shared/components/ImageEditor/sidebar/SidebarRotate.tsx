import { Rotate } from "../assets/icons";
import { useImageEditorContext } from "../provider/useImageEditorContext";
import { Button } from "../ui";
import styles from "./sidebar.module.css";
import { useImageProcessor } from "../hooks";

const SidebarRotate = () => {
  const { setCurrentAction, setSidebar, getLastHistoryItem, addToHistory } =
    useImageEditorContext();
  const { rotate } = useImageProcessor();
  const { base64, width, height } = getLastHistoryItem();

  const handleClick = async () => {
    // setCurrentAction({ name: "rotate", args: null });
    // setSidebar(false);

    const processedBase64 = await rotate(base64, 90);
    addToHistory({
      name: "Rotate",
      base64: processedBase64,
      height,
      width,
    });
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
