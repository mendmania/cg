// src/components/composites/Badge/Badge.tsx
import React from "react";

export interface BadgeProps {
  text: string;
}

export const Badge: React.FC<BadgeProps> = ({ text }) => (
  <span
    style={{
      display: "inline-block",
      backgroundColor: "#0055ff",
      color: "white",
      padding: "2px 8px",
      borderRadius: "12px",
      fontSize: "0.75rem",
    }}
  >
    {text}
  </span>
);
