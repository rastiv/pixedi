import { useBellow } from "../hooks";
import { Settings, X } from "../assets/icons";
import { Button, Separator } from "../ui";
import { SidebarResize } from "./SidebarResize";
import { SidebarCrop } from "./SidebarCrop";
import { SidebarPresets } from "./SidebarPresets";
import { useImageEditorContext } from "../provider/useImageEditorContext";
import "./sidebar.css";

export const Sidebar = () => {
  const { getSidebar, setSidebar } = useImageEditorContext();
  const isSidebarOpen = getSidebar();
  const isBellowMd = useBellow("md");

  return (
    <>
      <Button
        variant="outline"
        className="sidebar-settings"
        onClick={() => setSidebar(true)}
      >
        <Settings />
      </Button>
      <div
        className="sidebar"
        style={{
          transform:
            isBellowMd && isSidebarOpen
              ? "translateX(-320px)"
              : "translateX(0%)",
        }}
      >
        <div className="sidebar-container">
          <div className="sidebar-content">
            {isBellowMd && (
              <Button
                variant="ghost"
                className="sidebar-close-btn btn-rect"
                onClick={() => setSidebar(false)}
              >
                <X />
              </Button>
            )}
            <SidebarResize />
            <Separator className="sidebar-separator" />
            <SidebarCrop />
            <Separator className="sidebar-separator" />
            <SidebarPresets />
          </div>
        </div>
      </div>
    </>
  );
};
