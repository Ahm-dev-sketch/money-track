"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { formatCompactIDR, formatIDR } from "@/lib/utils/format";
import { formatDateShort } from "@/lib/utils/date";
import type { DateRange, Summary } from "@/types";

interface BalanceCardProps {
  summary: Summary | undefined;
  range: DateRange;
  periodLabel: string;
}

function CardSkeleton() {
  return (
    <div className="rounded-[20px] border border-line bg-surface p-5">
      <div className="animate-pulse space-y-3">
        <div className="h-3 w-24 rounded bg-surface-2" />
        <div className="h-9 w-44 rounded bg-surface-2" />
        <div className="grid grid-cols-3 gap-2 pt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-surface-2" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Kartu saldo utama:
 * - Saldo bersih = pemasukan − pengeluaran periode
 * - Pemasukan, pengeluaran, dan rata-rata pengeluaran harian
 */
export function BalanceCard({ summary, range, periodLabel }: BalanceCardProps) {
  const positive = (summary?.net ?? 0) >= 0;

  const rangeCaption = useMemo(() => {
    const from = range.from.slice(0, 10);
    const to = range.to.slice(0, 10);
    if (from === to) return formatDateShort(range.from);
    return `${formatDateShort(range.from)} – ${formatDateShort(range.to)}`;
  }, [range.from, range.to]);

  if (!summary) return <CardSkeleton />;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="hero-shadow rounded-[20px] bg-[var(--hero)] text-[var(--hero-text)]"
      aria-label="Ringkasan periode"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow flex items-center gap-1.5 text-[var(--hero-muted)]">
              <Wallet size={12} strokeWidth={2} /> Saldo bersih
            </p>
            <p className="mt-2 truncate text-[31px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
              <AnimatedNumber value={summary.net} />
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-[var(--hero-line)] px-2.5 py-1 text-[10.5px] font-medium text-[var(--hero-muted)]">
            {periodLabel}
          </span>
        </div>

        <p className="mt-2 text-[11.5px] text-[var(--hero-muted)]">
          {rangeCaption} ·{" "}
          <span className="font-semibold" style={{ color: positive ? "#7FD6BE" : "#F0A88F" }}>
            {positive ? "surplus" : "defisit"}
          </span>
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[var(--hero-line)] pt-4">
          <Stat
            label="Pemasukan"
            value={summary.income}
            icon={<TrendingUp size={12} strokeWidth={2} />}
            color="#7FD6BE"
          />
          <Stat
            label="Pengeluaran"
            value={summary.expense}
            icon={<TrendingDown size={12} strokeWidth={2} />}
            color="#F0A88F"
          />
          <Stat
            label="Rata-rata/hari"
            value={Math.round(summary.burnRate)}
            icon={<Flame size={12} strokeWidth={2} />}
            color="#E8D4AE"
            compactHint
            title={`Pengeluaran ${formatIDR(Math.round(summary.burnRate))} per hari`}
          />
        </div>
      </div>
    </motion.section>
  );
}

function Stat({
  label,
  value,
  icon,
  color,
  compactHint,
  title,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  compactHint?: boolean;
  title?: string;
}) {
  return (
    <div className="min-w-0" title={title}>
      <p className="flex items-center gap-1 text-[10px] font-medium text-[var(--hero-muted)]">
        <span className="grid h-4 w-4 shrink-0 place-items-center" style={{ color }}>
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </p>
      <p className="mt-1 truncate text-[13px] font-semibold tabular-nums" style={{ color }}>
        <AnimatedNumber value={value} format={compactHint ? formatCompactIDR : formatIDR} />
      </p>
    </div>
  );
}
