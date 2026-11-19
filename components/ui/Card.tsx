"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type CardMotionProps = Omit<HTMLMotionProps<"div">, "children">;

interface CardProps extends CardMotionProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

export function Card({ children, className = "", padded = true, ...rest }: CardProps) {
  return (
    <motion.div
      className={`rounded-[24px] border border-line/80 bg-surface card-shadow transition-shadow ${padded ? "p-4.5 sm:p-5" : ""} ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({
  icon: IconCmp,
  children,
  right,
  className = "",
}: {
  icon?: LucideIcon;
  children: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-3 flex items-center justify-between gap-3 px-0.5 ${className}`}>
      <h2 className="flex items-center gap-2 text-[14px] font-bold tracking-tight text-text">
        {IconCmp && (
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-surface-2 text-primary dark:text-emerald-400">
            <IconCmp size={14} strokeWidth={2.2} />
          </span>
        )}
        {children}
      </h2>
      {right}
    </div>
  );
}

export function Chip({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-line bg-surface-2/80 px-2.5 py-0.5 text-[11px] font-semibold text-text-muted ${className}`}
    >
      {children}
    </span>
  );
}
