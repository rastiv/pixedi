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
import { ActionName, type ShapeType } from "../types";
import styles from "./Shape.module.css";

const selectItems = Object.entries(shapes).map(([key, value]) => ({
  value: key,
  label: value,
}));

export const ShapeTools = () => {
  const { setCurrentAction, currentAction, i18n } = usePixediContext();
  const isShapes = currentAction?.name === ActionName.SHAPES;
  const shape = (isShapes && currentAction?.args?.shape) || "heart";
  const outlined = (isShapes && currentAction?.args?.outlined) || false;
  const border = (isShapes && currentAction?.args?.border) || 5;

  const handleChangeShape = (value: string) => {
    console.log("shape", value);
    setCurrentAction({
      name: ActionName.SHAPES,
      args: {
        outlined,
        border,
        shape: value as ShapeType,
      },
    });
  };

  const handleClose = () => {
    setCurrentAction(null);
  };

  const handleSave = () => {
    // TODO: Implement save logic
  };

  const handleToggleOutlined = () => {
    setCurrentAction({
      name: ActionName.SHAPES,
      args: {
        outlined: !outlined,
        border,
        shape,
      },
    });
  };

  const isSaving = false;

  return (
    <SurfaceTool>
      <div className={styles.buttons}>
        <Tooltip position="top">
          <Button
            variant="outline"
            aria-label={outlined ? i18n("fullfield") : i18n("outlined")}
            data-tooltip={outlined ? i18n("fullfield") : i18n("outlined")}
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
