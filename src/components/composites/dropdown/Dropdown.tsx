// src/components/composites/Dropdown/Dropdown.tsx
import React from "react";

export interface DropdownProps {
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
}) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
  >
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);
