import styles from "./Button.module.css";

type ButtonProps = React.ComponentPropsWithRef<"button"> & {
  variant?: "default" | "outline" | "ghost";
  className?: string;
  children?: React.ReactNode;
};

export const Button = ({
  className = "",
  variant = "default",
  children,
  ref,
  ...props
}: ButtonProps) => {
  const combinedClasses =
    `${styles.button} ${styles[variant]} ${className}`.trim();

  return (
    <button ref={ref} className={combinedClasses} {...props}>
      {children}
    </button>
  );
};
