"use client";

import { createElement } from "react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type { LucideIcon };

const FALLBACK_ICON_NAME = "MoreHorizontal";

/** Map nama ikon (string dari DB) -> komponen Lucide, dengan fallback aman. */
export function getIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Icons.MoreHorizontal;
  const direct = (Icons as unknown as Record<string, LucideIcon | undefined>)[name];
  if (direct) return direct;
  // "utensils-crossed" / "more_horizontal" -> "UtensilsCrossed" / "MoreHorizontal"
  const pascal = name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("");
  return (Icons as unknown as Record<string, LucideIcon | undefined>)[pascal] ?? Icons.MoreHorizontal;
}

interface IconProps {
  name: string | null | undefined;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
}

export function Icon({ name, size = 20, strokeWidth = 2, className, color }: IconProps) {
  return createElement(getIcon(name), {
    size,
    strokeWidth,
    className,
    color,
    "aria-hidden": true,
    focusable: false,
  });
}

export { FALLBACK_ICON_NAME };
