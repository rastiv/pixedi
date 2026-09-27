import { Tooltip } from "../ui";
import { usePixediContext } from "../provider/usePixediContext";
import { useSidebar, getToolIcon } from "./useSidebar";
import styles from "./Sidebar.module.css";

type SidebarProps = {
  isMobile: boolean;
};

export const Sidebar = ({ isMobile }: SidebarProps) => {
  const {
    settings,
    sidebar: isSidebarOpen,
    i18n,
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
      <Tooltip position="right" className={styles.tooltip}>
        {tools.map((tool) => {
          const label = i18n(tool);
          return (
            <div
              key={tool}
              className={`${styles.item} ${actionName === tool ? styles.selected : ""}`}
              onClick={() => click(tool)}
              data-tooltip={label}
              aria-label={label}
            >
              {getToolIcon(tool)}
            </div>
          );
        })}
      </Tooltip>
    </nav>
  );
};
