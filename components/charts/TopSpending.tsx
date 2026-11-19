"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { formatIDR } from "@/lib/utils/format";
import { toneFor } from "@/components/lib/constants";
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
    <ol className={`space-y-3 ${className}`}>
      {rows.map((r, i) => {
        const tone = toneFor(r.categoryId);
        return (
          <motion.li
            key={r.categoryId}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <div className="mb-1.5 flex items-baseline gap-2">
              <span
                className="grid h-6 w-6 shrink-0 self-center place-items-center rounded-md"
                style={{ background: `${tone}1A`, color: tone }}
              >
                <Icon name={r.icon} size={13} strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-text">
                <span className="mr-1 text-[10.5px] font-semibold tabular-nums text-text-muted">{i + 1}.</span>
                {r.name}
              </span>
              <span className="shrink-0 text-[12px] font-semibold tabular-nums text-text">{formatIDR(r.total)}</span>
              <span className="w-8 shrink-0 text-right text-[10.5px] font-medium tabular-nums text-text-muted">
                {Math.round(r.percent * 100)}%
              </span>
            </div>
            <ProgressBar value={r.total / max} color={tone} height={4} />
          </motion.li>
        );
      })}
    </ol>
  );
}
