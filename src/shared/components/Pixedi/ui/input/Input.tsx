import styles from "./Input.module.css";

export type InputProps = React.ComponentPropsWithRef<"input"> & {
  hideArrows?: boolean;
};

export const Input = ({
  className = "",
  type = "text",
  hideArrows = true,
  ref,
  ...props
}: InputProps) => {
  const numberClass = type === "number" && hideArrows ? styles.numberClean : "";
  const combinedClasses = `${styles.input} ${numberClass} ${className}`.trim();

  return <input ref={ref} type={type} className={combinedClasses} {...props} />;
};
