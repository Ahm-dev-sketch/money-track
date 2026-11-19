"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarRange } from "lucide-react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { getPeriodRange, todayDateKey } from "@/lib/utils/date";
import type { DateRange, PeriodKey } from "@/types";

interface PeriodFilterProps {
  period: PeriodKey;
  range: DateRange;
  onChange: (period: PeriodKey, range: DateRange) => void;
  /** Samakan layoutId antar instance (segmented indicator). */
  idPrefix?: string;
}

const OPTIONS = [
  { value: "today" as PeriodKey, label: "Hari Ini" },
  { value: "week" as PeriodKey, label: "Minggu Ini" },
  { value: "month" as PeriodKey, label: "Bulan Ini" },
  { value: "custom" as PeriodKey, label: "Kustom" },
];

/** Rentang default mode custom: awal bulan berjalan → hari ini. */
export function defaultCustomRange(): DateRange {
  const month = getPeriodRange("month");
  return { from: month.from.slice(0, 10), to: todayDateKey() };
}

export function PeriodFilter({ period, range, onChange, idPrefix = "period" }: PeriodFilterProps) {
  const pick = (next: PeriodKey) => {
    if (next !== "custom") {
      onChange(next, getPeriodRange(next));
      return;
    }
    const from = range.from.slice(0, 10);
    const to = range.to.slice(0, 10);
    const safe = from > to ? defaultCustomRange() : { from, to };
    onChange("custom", { from: `${safe.from}T00:00:00`, to: `${safe.to}T23:59:59` });
  };

  return (
    <div className="space-y-2">
      <SegmentedControl options={OPTIONS} value={period} onChange={pick} layoutId={`${idPrefix}-indicator`} compact />

      <AnimatePresence initial={false}>
        {period === "custom" && (
          <motion.div
            key="custom"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {/* Form tanggal di-mount ulang saat rentang berubah dari luar. */}
            <CustomRangeInputs
              key={range.from + range.to}
              initialFrom={range.from.slice(0, 10)}
              initialTo={range.to.slice(0, 10)}
              onApply={(from, to) => onChange("custom", { from: `${from}T00:00:00`, to: `${to}T23:59:59` })}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomRangeInputs({
  initialFrom,
  initialTo,
  onApply,
}: {
  initialFrom: string;
  initialTo: string;
  onApply: (from: string, to: string) => void;
}) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const invalid = from > to;

  const apply = (nextFrom: string, nextTo: string) => {
    setFrom(nextFrom);
    setTo(nextTo);
    if (nextFrom && nextTo && nextFrom <= nextTo) onApply(nextFrom, nextTo);
  };

  return (
    <div className="pt-2">
      <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-2">
        <CalendarRange size={16} strokeWidth={2} className="ml-1 shrink-0 text-text-muted" />
        <input
          type="date"
          aria-label="Tanggal mulai"
          value={from}
          max={to || undefined}
          onChange={(e) => apply(e.target.value, to)}
          className="h-9 min-w-0 flex-1 rounded-lg bg-surface-2 px-2 text-[12.5px] font-medium text-text focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
        <span className="text-[12px] text-text-muted">—</span>
        <input
          type="date"
          aria-label="Tanggal akhir"
          value={to}
          min={from || undefined}
          max={todayDateKey()}
          onChange={(e) => apply(from, e.target.value)}
          className="h-9 min-w-0 flex-1 rounded-lg bg-surface-2 px-2 text-[12.5px] font-medium text-text focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
      </div>
      {invalid && (
        <p className="mt-1.5 px-1 text-[11.5px] font-medium text-expense">
          Tanggal mulai harus sebelum tanggal akhir.
        </p>
      )}
    </div>
  );
}
