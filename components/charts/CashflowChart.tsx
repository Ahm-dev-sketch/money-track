"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipContentProps } from "recharts";
import { ChartColumn } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCompactIDR, formatIDR } from "@/lib/utils/format";
import { EXPENSE_COLOR, INCOME_COLOR } from "@/components/lib/constants";
import type { CashflowPoint } from "@/types";

interface CashflowChartProps {
  data: CashflowPoint[] | undefined;
  height?: number;
  className?: string;
}

type SeriesKey = "income" | "expense";

const SERIES: { key: SeriesKey; label: string; color: string }[] = [
  { key: "income", label: "Pemasukan", color: INCOME_COLOR },
  { key: "expense", label: "Pengeluaran", color: EXPENSE_COLOR },
];

export function CashflowChart({ data, height = 240, className = "" }: CashflowChartProps) {
  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>({ income: true, expense: true });

  const hasValue = useMemo(
    () => (data ?? []).some((p) => p.income > 0 || p.expense > 0),
    [data]
  );

  if (!data) {
    return (
      <div className={`flex items-end justify-center gap-1.5 ${className}`} style={{ height }}>
        {[40, 70, 55, 85, 60, 75, 50].map((h, i) => (
          <div key={i} className="w-3.5 animate-pulse rounded-t-sm bg-surface-2" style={{ height: `${h}%` }} />
        ))}
      </div>
    );
  }

  if (!hasValue) {
    return (
      <EmptyState
        icon={<ChartColumn size={22} strokeWidth={2} />}
        title="Belum ada arus kas"
        description="Tren pemasukan vs pengeluaran akan tampil di sini."
        compact
      />
    );
  }

  const toggle = (key: SeriesKey) => {
    // Minimal satu seri tetap aktif.
    setVisible((v) => {
      const next = { ...v, [key]: !v[key] };
      if (!next.income && !next.expense) return v;
      return next;
    });
  };

  const dense = data.length > 14;

  return (
    <div className={className}>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -16 }} barGap={2}>
            <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="2 4" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={dense ? "preserveStartEnd" : 0}
              minTickGap={12}
              tick={{ fill: "var(--text-muted)", fontSize: 10, fontWeight: 500 }}
              dy={4}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={60}
              tickFormatter={(v: number) => formatCompactIDR(v)}
              tick={{ fill: "var(--text-muted)", fontSize: 9.5, fontWeight: 500 }}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-2)", opacity: 0.5 }}
              content={(props) => <CashflowTooltip {...(props as TooltipContentProps<number, string>)} />}
            />
            <Bar
              dataKey="income"
              name="Pemasukan"
              fill={INCOME_COLOR}
              radius={[6, 6, 0, 0]}
              maxBarSize={18}
              hide={!visible.income}
              animationDuration={550}
            />
            <Bar
              dataKey="expense"
              name="Pengeluaran"
              fill={EXPENSE_COLOR}
              radius={[6, 6, 0, 0]}
              maxBarSize={18}
              hide={!visible.expense}
              animationDuration={550}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2.5 flex items-center justify-center gap-2">
        {SERIES.map((s) => {
          const on = visible[s.key];
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggle(s.key)}
              aria-pressed={on}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-semibold transition-all active:scale-95 ${
                on ? "border-line bg-surface-2 text-text shadow-xs" : "border-transparent bg-transparent text-text-muted opacity-50"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full transition-opacity"
                style={{ background: s.color, opacity: on ? 1 : 0.35 }}
              />
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CashflowTooltip({ active, payload, label }: TooltipContentProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-[16px] border border-emerald-900/30 bg-[#0c382e] px-3.5 py-2.5 text-white shadow-xl">
      <p className="mb-1 text-[11px] font-semibold text-emerald-200/80">{label}</p>
      {payload.map((p) => {
        const key = String(p.dataKey);
        const color = key === "income" ? "#34d399" : "#fb7185";
        return (
          <p key={key} className="flex items-center justify-between gap-4 text-[12px]">
            <span className="flex items-center gap-1.5 text-emerald-100/70 font-medium">
              <span className="h-2 w-2 rounded-full" style={{ background: color }} />
              {key === "income" ? "Masuk" : "Keluar"}
            </span>
            <span className="font-bold tabular-nums text-white">{formatIDR(Number(p.value ?? 0))}</span>
          </p>
        );
      })}
    </div>
  );
}
