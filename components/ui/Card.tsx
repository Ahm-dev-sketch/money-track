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
      className={`rounded-2xl border border-line bg-surface card-shadow ${padded ? "p-4" : ""} ${className}`}
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
    <div className={`mb-3 flex items-center justify-between gap-3 px-1 ${className}`}>
      <h2 className="flex items-center gap-2 text-[13px] font-semibold tracking-[-0.005em] text-text">
        {IconCmp && (
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-surface-2 text-primary">
            <IconCmp size={13} strokeWidth={2} />
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
      className={`inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-muted ${className}`}
    >
      {children}
    </span>
  );
}
