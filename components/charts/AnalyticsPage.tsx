"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChartColumn, PieChart, Trophy } from "lucide-react";
import { useCashflow, useCategorySpending, useSummary } from "@/lib/hooks/useData";
import { usePeriod } from "@/components/lib/usePeriod";
import { PageContainer, PageHeader, rise, stagger } from "@/components/ui/PageHeader";
import { Card, SectionTitle } from "@/components/ui/Card";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { CategoryDonut } from "@/components/charts/CategoryDonut";
import { CashflowChart } from "@/components/charts/CashflowChart";
import { TopSpending } from "@/components/charts/TopSpending";
import { formatIDR } from "@/lib/utils/format";
import { daysBetween } from "@/lib/utils/date";

export function AnalyticsPage() {
  const { period, range, setPeriod } = usePeriod();
  const summary = useSummary(range);
  const spending = useCategorySpending(range);

  // Bucket otomatis: harian untuk rentang ≤31 hari, bulanan untuk lebih panjang.
  const bucket: "day" | "month" = useMemo(
    () => (daysBetween(new Date(range.from), new Date(range.to)) > 31 ? "month" : "day"),
    [range.from, range.to]
  );
  const cashflow = useCashflow(range, bucket);

  const ratio =
    summary && summary.income > 0 ? Math.min(1, summary.expense / summary.income) : null;

  return (
    <PageContainer className="space-y-5">
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={rise}>
          <PageHeader title="Analitik" subtitle="Pola pengeluaran & arus kas" />
        </motion.div>
        <motion.div variants={rise}>
          <PeriodFilter period={period} range={range} onChange={setPeriod} idPrefix="analytics" />
        </motion.div>
      </motion.div>

      {/* Insight singkat */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-2 gap-3">
          <MiniStat label="Total pengeluaran" value={summary ? formatIDR(summary.expense) : "…"} tone="expense" />
          <MiniStat
            label={summary && summary.income > 0 ? "Porsi dari pemasukan" : "Rata-rata / hari"}
            value={
              ratio != null
                ? `${Math.round(ratio * 100)}%`
                : summary
                  ? formatIDR(Math.round(summary.burnRate))
                  : "…"
            }
            tone="muted"
          />
        </div>
      </motion.div>

      <Card>
        <SectionTitle icon={PieChart} right={<span className="text-[11px] font-medium text-text-muted">Kategori &lt; 3% digabung</span>}>
          Breakdown pengeluaran
        </SectionTitle>
        <CategoryDonut data={spending} height={196} />
      </Card>

      <Card>
        <SectionTitle
          icon={ChartColumn}
          right={
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10.5px] font-medium text-text-muted">
              {bucket === "day" ? "Harian" : "Bulanan"}
            </span>
          }
        >
          Arus kas
        </SectionTitle>
        <CashflowChart data={cashflow} height={240} />
      </Card>

      <Card>
        <SectionTitle icon={Trophy}>Top pengeluaran</SectionTitle>
        <TopSpending data={spending} limit={6} />
      </Card>
    </PageContainer>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: "expense" | "muted" }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-text-muted">{label}</p>
      <p
        className={`mt-1.5 truncate text-[17px] font-semibold tabular-nums tracking-[-0.02em] ${
          tone === "expense" ? "text-expense" : "text-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
