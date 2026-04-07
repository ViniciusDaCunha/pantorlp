import React, { useCallback } from "react";
import styles from "./Button.module.css";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading = false, leftIcon, rightIcon, children, className = "", disabled, ...props }, ref) => {
    const intersectionRef = useIntersectionObserver('visible');
    const mergedRef = useCallback((el: HTMLButtonElement | null) => {
      if (ref) {
        if (typeof ref === 'function') ref(el);
        else ref.current = el;
      }
      intersectionRef.current = el;
    }, [ref]);
    const classNames = [styles.button, styles[variant], styles[size], isLoading ? styles.loading : "", className]
      .filter(Boolean).join(" ");

    return (
      <button ref={mergedRef} className={classNames} disabled={disabled || isLoading} aria-busy={isLoading} {...props}>
        {isLoading && <span className={styles.spinnerWrapper} aria-hidden="true"><span className={styles.spinner} /></span>}
        {leftIcon && !isLoading && <span className={styles.iconLeft} aria-hidden="true">{leftIcon}</span>}
        <span className={styles.label}>{children}</span>
        {rightIcon && !isLoading && <span className={styles.iconRight} aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = "Button";
