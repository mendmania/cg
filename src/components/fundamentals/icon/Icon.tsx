// src/components/fundamentals/Icon/Icon.tsx
import React from "react";
import { icons } from "./icons";

export type IconName = keyof typeof icons;

export interface IconProps {
  name: IconName;
  size?: number;
  title?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  title,
}) => {
  const Svg = icons[name];
  return <Svg width={size} height={size} aria-label={title} />;
};
