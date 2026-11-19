"use client";

import { createElement } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Banknote,
  Bitcoin,
  Briefcase,
  Car,
  Coins,
  CreditCard,
  Gamepad2,
  Gift,
  Landmark,
  Laptop,
  MoreHorizontal,
  PiggyBank,
  Receipt,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  Utensils,
  Wallet,
} from "lucide-react";

export type { LucideIcon };

const FALLBACK_ICON_NAME = "MoreHorizontal";

/**
 * Map nama ikon (string dari DB) -> komponen Lucide, pakai NAMED import (bukan
 * `import *`) supaya tree-shaking membuang ~1000 ikon lucide yang tak terpakai
 * dari bundle. Set nama dibatasi oleh seed kategori/dompet + pilihan dompet;
 * nama di luar map (mis. dari backup lama) jatuh ke fallback.
 */
const ICONS: Record<string, LucideIcon> = {
  ArrowLeftRight,
  Banknote,
  Bitcoin,
  Briefcase,
  Car,
  Coins,
  CreditCard,
  Gamepad2,
  Gift,
  Landmark,
  Laptop,
  MoreHorizontal,
  PiggyBank,
  Receipt,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  Utensils,
  Wallet,
};

export function getIcon(name: string | null | undefined): LucideIcon {
  if (!name) return ICONS[FALLBACK_ICON_NAME];
  const direct = ICONS[name];
  if (direct) return direct;
  // "utensils-crossed" / "more_horizontal" -> "UtensilsCrossed" / "MoreHorizontal"
  const pascal = name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("");
  return ICONS[pascal] ?? ICONS[FALLBACK_ICON_NAME];
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
