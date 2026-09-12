import styles from "./InputPixel.module.css";
import { Input } from "..";

type InputPixelProps = React.ComponentPropsWithRef<"input"> & {
  label: string;
  className?: string;
};

export const InputPixel = ({
  label,
  className = "",
  style,
  ref,
  ...props
}: InputPixelProps) => {
  return (
    <div className={`${styles.container} ${className}`.trim()} style={style}>
      <span className={styles.legend}>{label}</span>
      <Input ref={ref} type="number" {...props} />
      <span className={styles.suffix}>px</span>
    </div>
  );
};
