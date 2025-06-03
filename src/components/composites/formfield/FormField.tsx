// src/components/composites/FormField/FormField.tsx
import React from "react";
import { Input, InputProps } from "@/components/fundamentals/input/Input";

export interface FormFieldProps extends InputProps {
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  ...rest
}) => (
  <div>
    <Input label={label} {...rest} />
    {error && (
      <div style={{ color: "red", fontSize: "0.75rem" }}>{error}</div>
    )}
  </div>
);
