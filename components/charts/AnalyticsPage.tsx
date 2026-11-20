"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChartColumn, Lightbulb, PieChart, Sparkles, TrendingUp, Trophy } from "lucide-react";
import { useCashflow, useCategorySpending, useSummary } from "@/lib/hooks/useData";
import { usePeriod } from "@/components/lib/usePeriod";
import { PageContainer, PageHeader, rise, stagger } from "@/components/ui/PageHeader";
import { Card, SectionTitle } from "@/components/ui/Card";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { CategoryDonut, CashflowChart } from "@/components/charts/LazyCharts";
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

  const topCategory = useMemo(() => {
    if (!spending || spending.length === 0) return null;
    return [...spending].sort((a, b) => b.total - a.total)[0];
  }, [spending]);

  const topPercent = useMemo(() => {
    if (!topCategory || !summary || summary.expense <= 0) return 0;
    return Math.round((topCategory.total / summary.expense) * 100);
  }, [topCategory, summary]);

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

      {/* FinTrack Expense Insights Card (Screen 4 Reference) */}
      {summary && summary.expense > 0 && (
        <Card className="space-y-3">
          <SectionTitle icon={Lightbulb}>Insight Pengeluaran</SectionTitle>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 rounded-[16px] bg-emerald-50/70 dark:bg-emerald-950/30 p-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
                <TrendingUp size={16} strokeWidth={2.2} />
              </span>
              <p className="text-[12.5px] font-medium text-text">
                {ratio != null
                  ? `Pengeluaran mencakup ${Math.round(ratio * 100)}% dari total pemasukan periode ini.`
                  : `Rata-rata pengeluaran harianmu adalah ${formatIDR(Math.round(summary.burnRate))} per hari.`}
              </p>
            </div>

            {topCategory && (
              <div className="flex items-center gap-3 rounded-[16px] bg-purple-50/70 dark:bg-purple-950/30 p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400">
                  <Sparkles size={16} strokeWidth={2.2} />
                </span>
                <p className="text-[12.5px] font-medium text-text">
                  Kategori <span className="font-bold">{topCategory.name}</span> adalah pengeluaran terbesarmu ({topPercent}%).
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

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
    <div className="card-shadow rounded-[22px] border border-line/80 bg-surface p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{label}</p>
      <p
        className={`mt-1.5 truncate text-[18px] sm:text-[20px] font-extrabold tabular-nums tracking-tight ${
          tone === "expense" ? "text-expense" : "text-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
