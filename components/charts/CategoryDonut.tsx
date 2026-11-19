"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { TooltipContentProps } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { formatIDR } from "@/lib/utils/format";
import { toneFor } from "@/components/lib/constants";
import type { CategorySpending } from "@/types";

interface CategoryDonutProps {
  data: CategorySpending[] | undefined;
  /** Tampilkan total di tengah donut. */
  className?: string;
  height?: number;
}

interface Slice {
  key: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  percent: number;
}

const OTHER_COLOR = "#8A9490";
const MIN_PERCENT = 0.03;

/** Gabungkan kategori < 3% menjadi satu slice "Lainnya" (tanpa mengubah data sumber). */
function groupSmall(sliceSource: CategorySpending[], total: number): Slice[] {
  if (total <= 0) return [];
  const big: Slice[] = [];
  const small: Slice[] = [];
  for (const d of sliceSource) {
    const s: Slice = {
      key: d.categoryId,
      name: d.name,
      icon: d.icon,
      // Warna tampilan dipetakan ke keluarga palet (data sumber tidak diubah).
      color: toneFor(d.categoryId),
      total: d.total,
      percent: d.total / total,
    };
    if (s.percent < MIN_PERCENT) small.push(s);
    else big.push(s);
  }
  if (small.length === 0) return big.sort((a, b) => b.total - a.total);
  // Sisipkan "Lainnya" di posisi kategori terkecil pertama.
  const otherTotal = small.reduce((a, b) => a + b.total, 0);
  big.push({
    key: "__other__",
    name: "Lainnya",
    icon: "MoreHorizontal",
    color: OTHER_COLOR,
    total: otherTotal,
    percent: otherTotal / total,
  });
  return big.sort((a, b) => b.total - a.total);
}

export function CategoryDonut({ data, className = "", height = 200 }: CategoryDonutProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = useMemo(() => (data ?? []).reduce((a, b) => a + b.total, 0), [data]);
  const slices = useMemo(() => groupSmall(data ?? [], total), [data, total]);

  if (!data) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: height + 120 }}>
        <div className="h-32 w-32 animate-pulse rounded-full border-[16px] border-surface-2" />
      </div>
    );
  }

  if (total <= 0) {
    return (
      <EmptyState
        icon={<PieChartIcon size={22} strokeWidth={2} />}
        title="Belum ada pengeluaran"
        description="Pengeluaran pada periode ini akan muncul di sini."
        compact
      />
    );
  }

  const active = activeIndex != null ? slices[activeIndex] : null;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="relative mx-auto w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <Pie
              data={slices}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="72%"
              outerRadius="94%"
              paddingAngle={2}
              cornerRadius={3}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              animationDuration={650}
            >
              {slices.map((s, i) => (
                <Cell key={s.key} fill={s.color} opacity={activeIndex == null || activeIndex === i ? 1 : 0.3} />
              ))}
            </Pie>
            <Tooltip
              cursor={false}
              content={(props) => <DonutTooltip {...(props as TooltipContentProps<number, string>)} />}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Label tengah (FinTrack stacked format) */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="max-w-[10rem] truncate text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            {active ? active.name : "Total Pengeluaran"}
          </span>
          <span className="mt-0.5 max-w-[11rem] truncate text-[19px] sm:text-[21px] font-extrabold tabular-nums tracking-tight text-text">
            {formatIDR(active ? active.total : total)}
          </span>
          {active ? (
            <span className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: `${active.color}1E`, color: active.color }}>
              {Math.round(active.percent * 100)}%
            </span>
          ) : (
            <span className="text-[10px] text-text-muted font-medium">Periode ini</span>
          )}
        </div>
      </div>

      <ul className="space-y-1">
        <AnimatePresence initial={false}>
          {slices.map((s, i) => (
            <motion.li
              key={s.key}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`flex items-center gap-2.5 rounded-[16px] px-2.5 py-2 transition-all ${
                activeIndex === i ? "bg-surface-2 shadow-xs" : "hover:bg-surface-2/60"
              }`}
            >
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-xl"
                style={{ background: `${s.color}1E`, color: s.color }}
              >
                <Icon name={s.icon} size={14} strokeWidth={2.2} />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-text">{s.name}</span>
              <span className="shrink-0 rounded-full bg-surface-2/80 px-2 py-0.5 text-[11px] font-bold tabular-nums text-text-muted">
                {Math.round(s.percent * 100)}%
              </span>
              <span className="w-[6rem] shrink-0 text-right text-[13px] font-bold tabular-nums text-text">
                {formatIDR(s.total)}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function DonutTooltip({ active, payload }: TooltipContentProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  const p = item.payload as Slice | undefined;
  if (!p) return null;
  return (
    <div className="card-shadow rounded-lg border border-line bg-surface px-2.5 py-1.5">
      <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-text">
        <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
        {p.name}
      </p>
      <p className="text-[12px] font-semibold tabular-nums text-text">{formatIDR(p.total)}</p>
      <p className="text-[10.5px] text-text-muted">{Math.round(p.percent * 100)}% dari pengeluaran</p>
    </div>
  );
}
