import { useState } from "react";
import { useBellow } from "../hooks";
import { Settings, X } from "../assets/icons";
import { Button, Separator } from "../ui";
import { SidebarResize } from "./SidebarResize";
import { SidebarCrop } from "./SidebarCrop";
import { SidebarPresets } from "./SidebarPresets";
import { SidebarFlip } from "./SidebarFlip";
import { useImageEditorContext } from "../provider/useImageEditorContext";
import styles from "./sidebar.module.css";
import buttonStyles from "../ui/button/button.module.css";
import { Slider } from "../ui";

export const Sidebar = () => {
  const { getSidebar, setSidebar } = useImageEditorContext();
  const isSidebarOpen = getSidebar();
  const isBellowMd = useBellow("md");
  const [sliderValue, setSliderValue] = useState(50);

  return (
    <>
      <Button
        variant="outline"
        className={styles.sidebarSettings}
        onClick={() => setSidebar(true)}
      >
        <Settings />
      </Button>
      <div
        className={styles.sidebar}
        style={{
          transform:
            isBellowMd && isSidebarOpen
              ? "translateX(-320px)"
              : "translateX(0%)",
        }}
      >
        <div className={styles.sidebarContainer}>
          <div className={styles.sidebarContent}>
            {isBellowMd && (
              <Button
                variant="ghost"
                className={`${styles.sidebarCloseBtn} ${buttonStyles.rect}`}
                onClick={() => setSidebar(false)}
              >
                <X />
              </Button>
            )}
            <SidebarResize />
            <Separator className={styles.sidebarSeparator} />
            <SidebarCrop />
            <Separator className={styles.sidebarSeparator} />
            <SidebarPresets />
            <Separator className={styles.sidebarSeparator} />
            <SidebarFlip />
            <Separator className={styles.sidebarSeparator} />
            <Slider
              min={0}
              max={100}
              value={sliderValue}
              disabled={false}
              onChange={(value) => setSliderValue(value)}
            />
          </div>
        </div>
      </div>
    </>
  );
};
