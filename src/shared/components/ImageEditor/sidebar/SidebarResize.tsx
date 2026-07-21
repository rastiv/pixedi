import { Fullscreen } from "../assets/icons";
import { useImageEditorContext } from "../provider/useImageEditorContext";
import { Button } from "../ui";

export const SidebarResize = () => {
  const { getLastHistoryItem, setCurrentAction, setSidebar } =
    useImageEditorContext();
  const { width, height } = getLastHistoryItem() ?? { width: 0, height: 0 };

  const handleClick = () => {
    setCurrentAction({ name: "resize", args: { width, height } });
    setSidebar(false);
  };

  return (
    <Button variant="outline" className="sidebar-resize" onClick={handleClick}>
      <div className="sidebar-resize-icon">
        <Fullscreen />
        Resize
      </div>
      <div className="sidebar-resize-size">
        {width} x {height}
      </div>
    </Button>
  );
};
