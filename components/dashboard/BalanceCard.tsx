"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Eye, EyeOff, Flame, Sparkles, TrendingDown, TrendingUp, Wallet } from "lucide-react";
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
    <div className="space-y-3">
      <div className="rounded-[28px] border border-line bg-surface p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-28 rounded bg-surface-2" />
          <div className="h-10 w-52 rounded bg-surface-2" />
          <div className="h-4 w-36 rounded bg-surface-2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 rounded-[22px] border border-line bg-surface animate-pulse" />
        <div className="h-24 rounded-[22px] border border-line bg-surface animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Kartu saldo FinTrack:
 * - Hero Card: Saldo bersih dengan toggle sembunyikan saldo
 * - Side-by-side Quick Stats: Pemasukan & Pengeluaran dengan circular indicator
 * - Burn Rate Banner: Rata-rata pengeluaran harian
 */
export function BalanceCard({ summary, range, periodLabel }: BalanceCardProps) {
  const [hideBalance, setHideBalance] = useState(false);
  const positive = (summary?.net ?? 0) >= 0;

  const rangeCaption = useMemo(() => {
    const from = range.from.slice(0, 10);
    const to = range.to.slice(0, 10);
    if (from === to) return formatDateShort(range.from);
    return `${formatDateShort(range.from)} – ${formatDateShort(range.to)}`;
  }, [range.from, range.to]);

  if (!summary) return <CardSkeleton />;

  return (
    <div className="space-y-3">
      {/* Hero Card - Forest Green FinTrack Aesthetic */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="hero-shadow relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0c382e] via-[#0a3128] to-[#07241d] p-5.5 text-white"
        aria-label="Ringkasan saldo"
      >
        {/* Subtle decorative glow element */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-white/10 text-emerald-300">
                <Wallet size={13} strokeWidth={2.2} />
              </span>
              <p className="text-[12px] font-medium tracking-wide text-emerald-200/80">
                Total Saldo Bersih
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setHideBalance(!hideBalance)}
                className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-emerald-100 transition hover:bg-white/20 active:scale-95"
                title={hideBalance ? "Tampilkan saldo" : "Sembunyikan saldo"}
                aria-label={hideBalance ? "Tampilkan saldo" : "Sembunyikan saldo"}
              >
                {hideBalance ? <EyeOff size={14} strokeWidth={2} /> : <Eye size={14} strokeWidth={2} />}
              </button>
              <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-100">
                {periodLabel}
              </span>
            </div>
          </div>

          <div className="mt-3">
            {hideBalance ? (
              <p className="text-[32px] sm:text-[36px] font-bold tracking-tight text-white">
                Rp ••••••••
              </p>
            ) : (
              <p className="truncate text-[32px] sm:text-[36px] font-extrabold leading-tight tracking-tight text-white tabular-nums">
                <AnimatedNumber value={summary.net} />
              </p>
            )}
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11.5px] text-emerald-200/75">
            <span>{rangeCaption}</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                positive
                  ? "bg-emerald-400/20 text-emerald-300"
                  : "bg-[#e09484]/20 text-[#eeb4a7]"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${positive ? "bg-emerald-400" : "bg-[#e09484]"}`} />
              {positive ? "Surplus periode" : "Defisit periode"}
            </span>
          </div>
        </div>
      </motion.section>

      {/* Side-by-side Quick Stats Cards: Pemasukan & Pengeluaran */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pemasukan Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="card-shadow flex flex-col justify-between rounded-[24px] border border-line/80 bg-surface p-4 transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight size={18} strokeWidth={2.4} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              Masuk
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[11.5px] font-medium text-text-muted">Pemasukan</p>
            <p className="mt-0.5 truncate text-[16px] sm:text-[18px] font-bold text-text tabular-nums">
              {hideBalance ? "••••••" : <AnimatedNumber value={summary.income} format={formatIDR} />}
            </p>
          </div>
        </motion.div>

        {/* Pengeluaran Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="card-shadow flex flex-col justify-between rounded-[24px] border border-line/80 bg-surface p-4 transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-expense/10 text-expense">
              <ArrowDownRight size={18} strokeWidth={2.4} />
            </span>
            <span className="rounded-full bg-expense/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-expense">
              Keluar
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[11.5px] font-medium text-text-muted">Pengeluaran</p>
            <p className="mt-0.5 truncate text-[16px] sm:text-[18px] font-bold text-text tabular-nums">
              {hideBalance ? "••••••" : <AnimatedNumber value={summary.expense} format={formatIDR} />}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Burn Rate / Rata-rata Pengeluaran Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="card-shadow flex items-center justify-between rounded-[20px] border border-line/70 bg-surface px-4 py-2.5"
      >
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <Flame size={15} strokeWidth={2.2} />
          </span>
          <div>
            <p className="text-[11px] font-medium text-text-muted">Rata-rata Pengeluaran</p>
            <p className="text-[12.5px] font-bold text-text tabular-nums">
              {hideBalance ? "••••••" : `${formatIDR(Math.round(summary.burnRate))} / hari`}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10.5px] font-semibold text-text-muted">
          Burn rate
        </span>
      </motion.div>
    </div>
  );
}
