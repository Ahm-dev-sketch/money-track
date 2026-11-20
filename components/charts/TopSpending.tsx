"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { formatIDR } from "@/lib/utils/format";
import { categoryTone } from "@/components/lib/constants";
import type { CategorySpending } from "@/types";

interface TopSpendingProps {
  data: CategorySpending[] | undefined;
  limit?: number;
  className?: string;
}

/** Peringkat kategori terboros; lebar bar relatif terhadap kategori terbesar. */
export function TopSpending({ data, limit = 5, className = "" }: TopSpendingProps) {
  const rows = useMemo(() => {
    if (!data) return undefined;
    return [...data].sort((a, b) => b.total - a.total).slice(0, limit);
  }, [data, limit]);

  if (!rows) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 w-1/2 animate-pulse rounded bg-surface-2" />
            <div className="h-1.5 w-full animate-pulse rounded bg-surface-2" />
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<Trophy size={22} strokeWidth={2} />}
        title="Belum ada data"
        description="Kategori terboros akan muncul setelah ada pengeluaran."
        compact
      />
    );
  }

  const max = Math.max(...rows.map((r) => r.total), 1);

  return (
    <ol className={`space-y-3.5 ${className}`}>
      {rows.map((r, i) => {
        const tone = categoryTone({ id: r.categoryId, color: r.color });
        return (
          <motion.li
            key={r.categoryId}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="rounded-[16px] p-1.5 transition-colors hover:bg-surface-2/60"
          >
            <div className="mb-2 flex items-center gap-2.5">
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl"
                style={{ background: `${tone}1E`, color: tone }}
              >
                <Icon name={r.icon} size={15} strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-text">{r.name}</p>
                <p className="text-[12.5px] font-bold tabular-nums text-text">{formatIDR(r.total)}</p>
              </div>
              <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-text-muted">
                {Math.round(r.percent * 100)}%
              </span>
            </div>
            <ProgressBar value={r.total / max} color={tone} height={5} className="rounded-full" />
          </motion.li>
        );
      })}
    </ol>
  );
}
