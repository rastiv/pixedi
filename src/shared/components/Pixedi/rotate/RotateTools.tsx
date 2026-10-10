import {
  Button,
  SaveCloseGroup,
  SurfaceTool,
  Tooltip,
  OrbitalSelector,
} from "../ui";
import { Rotate, RotateCCW } from "../assets/icons";
import { useRotate } from "./useRotate";
import styles from "./Rotate.module.css";
import { useState } from "react";

export const RotateTools = () => {
  const { handleRotate, handleSave, handleClose, isSaving } = useRotate();
  const [value, setValue] = useState(0);

  return (
    <div className={styles.rotate}>
      <OrbitalSelector
        value={value}
        onChange={setValue}
        className={styles.selector}
        angles={[0, 45, 90, 135, 180, 225, 270, 315]}
      ></OrbitalSelector>
    </div>
    // <SurfaceTool className={styles.tools}>
    //   <Tooltip position="top">
    //     <Button
    //       variant="outline"
    //       className={styles.btnCW}
    //       onClick={() => handleRotate(90)}
    //       aria-label="+90°"
    //       data-tooltip="+90°"
    //     >
    //       <Rotate />
    //     </Button>
    //     <Button
    //       variant="outline"
    //       className={styles.btnCCW}
    //       onClick={() => handleRotate(-90)}
    //       aria-label="-90°"
    //       data-tooltip="-90°"
    //     >
    //       <RotateCCW />
    //     </Button>
    //   </Tooltip>
    //   <SaveCloseGroup
    //     onSave={handleSave}
    //     onClose={handleClose}
    //     saving={isSaving}
    //   />
    // </SurfaceTool>
  );
};
