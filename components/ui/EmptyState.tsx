"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, className = "", compact }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center text-center ${compact ? "gap-2 py-6" : "gap-3 py-10"} ${className}`}
    >
      <div
        className={`grid place-items-center rounded-2xl border border-line bg-surface-2 text-text-muted ${
          compact ? "h-11 w-11" : "h-14 w-14"
        }`}
      >
        {icon}
      </div>
      <div className="space-y-1">
        <p className={`font-semibold text-text ${compact ? "text-[13px]" : "text-[14.5px]"}`}>{title}</p>
        {description && <p className="mx-auto max-w-[26ch] text-[12.5px] leading-relaxed text-text-muted">{description}</p>}
      </div>
      {action}
    </motion.div>
  );
}
