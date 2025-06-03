// src/components/fundamentals/Button/Button.tsx
import React from "react";
import styles from "./Button.module.css";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  ...rest
}) => (
  <button className={`${styles.button} ${styles[variant]}`} {...rest}>
    {children}
  </button>
);
