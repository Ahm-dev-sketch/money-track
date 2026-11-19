"use client";

import { motion } from "framer-motion";

export interface ToggleOption<T extends string> {
  value: T;
  label: string;
  /** Warna aktif (berupa warna CSS / hex). */
  color: string;
  icon?: React.ReactNode;
}

interface ToggleProps<T extends string> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (v: T) => void;
  layoutId: string;
  className?: string;
  ariaLabel?: string;
}

/** Pil bertingkat dengan indikator bergeser; warna indikator mengikuti tipe. */
export function Toggle<T extends string>({ options, value, onChange, layoutId, className = "", ariaLabel }: ToggleProps<T>) {
  const active = options.find((o) => o.value === value);
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex w-full gap-1 rounded-full border border-line bg-surface-2/70 p-1 ${className}`}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(opt.value)}
            className="relative flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-[12.5px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full"
                style={{ background: opt.color, boxShadow: "0 1px 2px rgba(16,24,40,0.12)" }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <span
              className="relative z-10 flex items-center gap-1.5 transition-colors"
              style={{ color: isActive ? "#ffffff" : "var(--text-muted)" }}
            >
              {opt.icon}
              {opt.label}
            </span>
          </button>
        );
      })}
      <span className="sr-only" aria-live="polite">
        {active?.label}
      </span>
    </div>
  );
}
