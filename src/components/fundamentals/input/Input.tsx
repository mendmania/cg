// src/components/fundamentals/Input/Input.tsx
import React from "react";
import styles from "./Input.module.css";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, ...rest }) => (
  <div className={styles.wrapper}>
    {label && <label htmlFor={id}>{label}</label>}
    <input id={id} className={styles.input} {...rest} />
  </div>
);
