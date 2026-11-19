"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { History, House, PieChart, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const LEFT: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Beranda", icon: House },
  { href: "/analytics", label: "Analitik", icon: PieChart },
];

const RIGHT: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/history", label: "Riwayat", icon: History },
  { href: "/wallets", label: "Dompet", icon: Wallet },
];

export function BottomNav() {
  const pathname = usePathname();

  const renderTab = (tab: (typeof LEFT)[number]) => {
    const active = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(`${tab.href}/`));
    const IconCmp = tab.icon;
    return (
      <Link
        key={tab.href}
        href={tab.href}
        aria-current={active ? "page" : undefined}
        className={`relative flex h-[52px] flex-col items-center justify-center gap-1 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          active ? "text-primary" : "text-text-muted hover:text-text"
        }`}
      >
        {active && (
          <motion.span
            layoutId="nav-active-indicator"
            className="absolute inset-x-1 top-0.5 bottom-0.5 rounded-xl bg-primary/[0.07]"
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          />
        )}
        <motion.span
          animate={active ? { y: -0.5 } : { y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          className="relative z-10"
        >
          <IconCmp size={19} strokeWidth={2} />
        </motion.span>
        <span className={`relative z-10 text-[10px] ${active ? "font-semibold" : "font-medium"}`}>{tab.label}</span>
      </Link>
    );
  };

  return (
    <nav aria-label="Navigasi utama" className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
      <div className="w-full max-w-md px-3 pb-[max(10px,env(safe-area-inset-bottom))] md:max-w-3xl">
        <div
          className="pointer-events-auto grid items-center rounded-[26px] border border-line/80 bg-surface/95 px-2 py-1.5 shadow-[0_4px_20px_-4px_rgba(12,56,46,0.12)] backdrop-blur-xl"
          style={{ gridTemplateColumns: "1fr 1fr 68px 1fr 1fr" }}
        >
          {LEFT.map(renderTab)}
          <span aria-hidden className="h-[52px]" />
          {RIGHT.map(renderTab)}
        </div>
      </div>
    </nav>
  );
}
