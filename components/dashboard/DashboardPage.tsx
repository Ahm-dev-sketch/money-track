"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, Moon, PieChart, ReceiptText, Sun, SunMedium, Sunset } from "lucide-react";
import { useCashflow, useCategories, useCategorySpending, useSummary, useTransactions, useWallets } from "@/lib/hooks/useData";
import { usePeriod } from "@/components/lib/usePeriod";
import { PageContainer, stagger, rise } from "@/components/ui/PageHeader";
import { Card, SectionTitle } from "@/components/ui/Card";
import { BalanceCard } from "./BalanceCard";
import { PeriodFilter } from "./PeriodFilter";
import { EmptyDashboard } from "./EmptyDashboard";
import { CategoryDonut } from "@/components/charts/CategoryDonut";
import { CashflowChart } from "@/components/charts/CashflowChart";
import { TopSpending } from "@/components/charts/TopSpending";
import { TransactionItem } from "@/components/transaction/TransactionItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { LoadingScreen, openLogger } from "@/components/layout/AppShell";

const PERIOD_LABEL: Record<string, string> = {
  today: "Hari ini",
  week: "Minggu ini",
  month: "Bulan ini",
  custom: "Kustom",
};

function getGreeting(): { text: string; icon: typeof Sun } {
  const h = new Date().getHours();
  if (h >= 4 && h < 11) return { text: "Selamat Pagi", icon: Sun };
  if (h >= 11 && h < 15) return { text: "Selamat Siang", icon: SunMedium };
  if (h >= 15 && h < 19) return { text: "Selamat Sore", icon: Sunset };
  return { text: "Selamat Malam", icon: Moon };
}

export function DashboardPage() {
  const router = useRouter();
  const { period, range, setPeriod } = usePeriod();
  const greeting = useMemo(() => getGreeting(), []);
  const GreetingIcon = greeting.icon;

  const wallets = useWallets();
  const categories = useCategories();
  const summary = useSummary(range);
  const spending = useCategorySpending(range);
  const cashflow = useCashflow(range, "day");
  // Semua transaksi (tanpa filter periode) untuk mendeteksi akun yang masih kosong.
  const all = useTransactions();
  const recent = useTransactions({ from: range.from, to: range.to });

  const catMap = useMemo(() => new Map((categories ?? []).map((c) => [c.id, c])), [categories]);
  const walletMap = useMemo(() => new Map((wallets ?? []).map((w) => [w.id, w])), [wallets]);

  const recentPreview = recent?.slice(0, 5);
  const coldStart = all !== undefined && all.length === 0;

  return (
    <PageContainer className="space-y-6">
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        {/* FinTrack Top Greeting & Editorial Headline */}
        <motion.div variants={rise} className="flex items-start justify-between gap-3 px-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">
              <GreetingIcon size={14} strokeWidth={2.2} className="text-amber-500" />
              <span>{greeting.text}</span>
            </div>
            <h1 className="mt-1 text-[21px] sm:text-[23px] font-extrabold leading-snug tracking-tight text-text">
              Kelola uangmu untuk hari esok yang lebih tertata.
            </h1>
          </div>
          <button
            type="button"
            onClick={() => router.push("/history")}
            className="card-shadow flex h-9 shrink-0 items-center gap-1 rounded-full border border-line/80 bg-surface px-3 text-[12px] font-semibold text-text-muted transition-colors hover:text-text active:scale-95"
          >
            Riwayat <ChevronRight size={13} strokeWidth={2.2} />
          </button>
        </motion.div>

        <motion.div variants={rise}>
          <BalanceCard summary={summary} range={range} periodLabel={PERIOD_LABEL[period] ?? "Bulan ini"} />
        </motion.div>

        <motion.div variants={rise}>
          <PeriodFilter period={period} range={range} onChange={(p, r) => setPeriod(p, r)} idPrefix="dash" />
        </motion.div>
      </motion.div>

      {all === undefined ? (
        <LoadingScreen />
      ) : coldStart ? (
        <EmptyDashboard wallet={wallets?.[0]} onStart={openLogger} />
      ) : (
        <>
          {/* Bento grid: tumpuk di mobile, 6 kolom di desktop */}
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4 }}
              className="col-span-2 md:col-span-6"
            >
              <Card>
                <SectionTitle
                  icon={PieChart}
                  right={
                    <button
                      type="button"
                      onClick={() => router.push("/analytics")}
                      className="flex items-center gap-1 text-[12px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      Detail <ChevronRight size={13} strokeWidth={2.4} />
                    </button>
                  }
                >
                  Arus kas harian
                </SectionTitle>
                <CashflowChart data={cashflow} height={200} />
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: 0.06 }}
              className="col-span-2 md:col-span-3"
            >
              <Card className="h-full">
                <SectionTitle
                  icon={PieChart}
                  right={<span className="text-[11px] font-semibold text-text-muted">Pengeluaran</span>}
                >
                  Kategori
                </SectionTitle>
                <CategoryDonut data={spending} height={176} />
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="col-span-2 md:col-span-3"
            >
              <Card className="h-full">
                <SectionTitle icon={ReceiptText}>Paling boros</SectionTitle>
                <TopSpending data={spending} limit={4} />
              </Card>
            </motion.div>
          </div>

          <section className="space-y-2">
            <SectionTitle
              right={
                <button
                  type="button"
                  onClick={() => router.push("/history")}
                  className="flex items-center gap-0.5 text-[11.5px] font-semibold text-primary"
                >
                  Semua <ChevronRight size={12} strokeWidth={2} />
                </button>
              }
            >
              Transaksi terakhir
            </SectionTitle>

            {!recentPreview ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-1 py-2">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-surface-2" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
                      <div className="h-2.5 w-1/3 animate-pulse rounded bg-surface-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentPreview.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<ReceiptText size={22} strokeWidth={2} />}
                  title="Tidak ada transaksi di periode ini"
                  description="Coba pilih periode lain, atau catat transaksi baru."
                  action={
                    <Button size="sm" variant="secondary" onClick={openLogger}>
                      Catat transaksi
                    </Button>
                  }
                />
              </Card>
            ) : (
              <Card padded={false} className="rounded-[24px] p-2">
                <ul className="divide-y divide-line/40">
                  {recentPreview.map((t) => (
                    <TransactionItem
                      key={t.id}
                      transaction={t}
                      category={t.categoryId ? catMap.get(t.categoryId) : undefined}
                      wallet={walletMap.get(t.walletId)}
                      toWallet={t.toWalletId ? walletMap.get(t.toWalletId) : undefined}
                      onEdit={(tx) => router.push(`/history?focus=${tx.id}`)}
                    />
                  ))}
                </ul>
              </Card>
            )}

            {recentPreview && recentPreview.length > 0 && (
              <Button variant="ghost" fullWidth onClick={() => router.push("/history")} className="text-[12.5px]">
                Lihat semua transaksi
              </Button>
            )}
          </section>
        </>
      )}
    </PageContainer>
  );
}
