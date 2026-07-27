import styles from "./button-crop.module.css";
import rootStyles from "../../index.module.css";

interface ButtonCropProps extends React.ComponentPropsWithRef<"button"> {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
}

export const ButtonCrop = ({
  className = "",
  active = false,
  icon,
  label,
  ref,
  ...props
}: ButtonCropProps) => {
  const combinedClasses = `${styles.button} ${className}`.trim();

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={active}
      className={combinedClasses}
      {...props}
    >
      {icon}
      <span className={rootStyles.semibold}>{label}</span>
    </button>
  );
};
