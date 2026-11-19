"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  /** 0..1 */
  value: number;
  color?: string;
  className?: string;
  height?: number;
  /** Tampilkan shimmer halus saat loading. */
  loading?: boolean;
}

export function ProgressBar({ value, color = "var(--primary)", className = "", height = 6, loading }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0)) * 100;
  return (
    <div
      className={`relative w-full overflow-hidden rounded-full bg-surface-2 ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
      <motion.div
        className={`h-full rounded-full ${loading ? "animate-pulse" : ""}`}
        style={{ background: color }}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
    </div>
  );
}
