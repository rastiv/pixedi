import { Tooltip } from "@/shared/components/Pixedi/ui";
import { usePixediContext } from "../provider/usePixediContext";
import { useSidebar, getToolData } from "./useSidebar";
import styles from "./Sidebar.module.css";

type SidebarProps = {
  isMobile: boolean;
};

export const Sidebar = ({ isMobile }: SidebarProps) => {
  const {
    settings,
    sidebar: isSidebarOpen,
    currentAction,
  } = usePixediContext();
  const tools = settings?.tools || [];
  const actionName = currentAction?.name;

  const { click } = useSidebar();

  return (
    <nav
      className={`${styles.sidebar} ${isMobile ? styles.mobile : ""} ${
        isMobile && isSidebarOpen ? styles.open : ""
      }`}
    >
      <Tooltip orientation="vertical" className={styles.tooltip}>
        {tools.map((tool) => {
          const toolData = getToolData(tool);
          if (!toolData) return null;
          const { icon, label } = toolData;
          return (
            <div
              key={tool}
              className={`${styles.item} ${actionName === tool ? styles.selected : ""}`}
              onClick={() => click(tool)}
              data-tooltip={label}
              aria-label={label}
            >
              {icon}
            </div>
          );
        })}
      </Tooltip>
    </nav>
  );
};
