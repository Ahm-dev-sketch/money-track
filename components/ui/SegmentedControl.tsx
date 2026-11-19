"use client";

import { motion } from "framer-motion";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
  /** Id unik untuk layoutId indikator (wajib beda antar instance). */
  layoutId: string;
  className?: string;
  compact?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  className = "",
  compact,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`flex w-full rounded-full border border-line/80 bg-surface-2/80 p-1 shadow-inner ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`relative flex-1 rounded-full font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 ${
              compact ? "h-8.5 text-[12px]" : "h-9.5 text-[13px]"
            } ${active ? "text-on-primary shadow-xs" : "text-text-muted hover:text-text"}`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-[#0c382e] dark:bg-emerald-600 shadow-[0_2px_8px_rgba(12,56,46,0.25)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10 whitespace-nowrap">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
