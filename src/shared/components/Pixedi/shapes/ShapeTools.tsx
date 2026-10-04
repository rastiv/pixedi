import {
  Button,
  SelectIcon,
  Tooltip,
  SaveCloseGroup,
  SurfaceTool,
} from "../ui";
import { shapes } from "../constants";
import { Square, Stripes } from "../assets/icons";
import { usePixediContext } from "../provider/usePixediContext";
import { useShape } from "./useShape";
import styles from "./Shape.module.css";

const selectItems = Object.entries(shapes).map(([key, value]) => ({
  value: key,
  label: value,
}));

export const ShapeTools = () => {
  const { i18n } = usePixediContext();
  const {
    shape,
    outlined,
    handleChangeShape,
    handleToggleOutlined,
    handleSave,
    handleClose,
    isSaving,
  } = useShape();
  const outlineLabel = outlined ? i18n("fullfield") : i18n("outlined");

  return (
    <SurfaceTool>
      <div className={styles.buttons}>
        <Tooltip position="top">
          <Button
            variant="outline"
            aria-label={outlineLabel}
            data-tooltip={outlineLabel}
            onClick={handleToggleOutlined}
          >
            {outlined ? <Stripes /> : <Square />}
          </Button>
        </Tooltip>
        <SelectIcon
          items={selectItems}
          value={shape}
          onChange={handleChangeShape}
          className={styles.selector}
        />
      </div>
      <SaveCloseGroup
        onSave={handleSave}
        onClose={handleClose}
        saving={isSaving}
      />
    </SurfaceTool>
  );
};
