import { Lock } from "../assets/icons";
import { SaveCloseGroup, InputPixel } from "../ui";
import { useResize } from "./useResize";
import styles from "./Resize.module.css";

export const ResizeTools = () => {
  const {
    resizeRef,
    width,
    height,
    scale,
    currentWidth,
    currentHeight,
    setWidth,
    setHeight,
    handleWidthBlur,
    handleHeightBlur,
    save,
    close,
  } = useResize();

  return (
    <div ref={resizeRef} className={styles.resize}>
      <div className={styles.indicatorWrapper}>
        <div className={styles.indicator} style={{ width: `${scale / 2}%` }} />
      </div>
      <InputPixel
        value={width}
        name="width"
        label="Width"
        style={{ width: "88px" }}
        onChange={(event) => setWidth(Number(event.target.value))}
        onBlur={handleWidthBlur}
      />
      <Lock className={styles.toolsLock} />
      <InputPixel
        value={height}
        name="height"
        label="Height"
        style={{ width: "88px" }}
        onChange={(event) => setHeight(Number(event.target.value))}
        onBlur={handleHeightBlur}
      />
      <SaveCloseGroup
        onSave={save}
        onClose={close}
        disabled={width === currentWidth && height === currentHeight}
      />
    </div>
  );
};
