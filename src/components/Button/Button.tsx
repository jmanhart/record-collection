import { forwardRef, type ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "ghost" | "success";
  size?: "sm" | "md";
  icon?: boolean;
}

const variantClass = {
  primary: styles.primary,
  danger: styles.danger,
  ghost: styles.ghost,
  success: styles.success,
} as const;

const sizeClass = {
  sm: styles.sm,
  md: styles.md,
} as const;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", icon = false, className, children, ...rest },
  ref
) {
  const classes = [
    styles.button,
    variantClass[variant],
    icon ? styles.icon : sizeClass[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button ref={ref} className={classes} {...rest}>
      {children}
    </button>
  );
});
