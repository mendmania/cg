// src/components/fundamentals/Icon/icons.tsx
import React from "react";

export const icons = {
  close: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  check: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
};
