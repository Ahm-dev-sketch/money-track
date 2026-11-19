"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className = "" }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-start justify-between gap-3 px-1 ${className}`}
    >
      <div className="min-w-0">
        <h1 className="text-[25px] font-semibold leading-tight tracking-[-0.025em] text-text">{title}</h1>
        {subtitle && <p className="mt-1 text-[12.5px] text-text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 pt-1">{action}</div>}
    </motion.div>
  );
}

export function PageContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-md px-4 md:max-w-3xl ${className}`}>{children}</div>;
}

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.02 } },
};

export const rise = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};
