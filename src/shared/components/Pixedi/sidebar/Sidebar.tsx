import { useBellow } from "../hooks";
import { Settings, X } from "../assets/icons";
import { Button, Separator } from "../ui";
import { SidebarResize } from "./SidebarResize";
import { SidebarCrop } from "./SidebarCrop";
import { SidebarPresets } from "./SidebarPresets";
import { SidebarFlip } from "./SidebarFlip";
import SidebarRotate from "./SidebarRotate";
import { usePixediContext } from "../provider/usePixediContext";
import buttonStyles from "../ui/button/button.module.css";
import styles from "./Sidebar.module.css";

export const Sidebar = () => {
  const { sidebar: isSidebarOpen, setSidebar } = usePixediContext();
  const isBellowMd = useBellow("md");

  return (
    <>
      <Button
        variant="outline"
        className={styles.settings}
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
        <div className={styles.container}>
          <div className={styles.content}>
            {isBellowMd && (
              <Button
                variant="ghost"
                className={`${styles.closeBtn} ${buttonStyles.rect}`}
                onClick={() => setSidebar(false)}
              >
                <X />
              </Button>
            )}
            <SidebarResize />
            <Separator className={styles.separator} />
            <SidebarCrop />
            <Separator className={styles.separator} />
            <SidebarPresets />
            <Separator className={styles.separator} />
            <div className={styles.flipRotate}>
              <SidebarFlip />
              <SidebarRotate />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
