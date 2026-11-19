"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Filter, ReceiptText, X } from "lucide-react";
import { useCategories, useTransactions, useWallets } from "@/lib/hooks/useData";
import { deleteTransaction } from "@/lib/db/repository";
import { PageContainer, PageHeader } from "@/components/ui/PageHeader";
import { SectionTitle } from "@/components/ui/Card";
import { TransactionItem } from "@/components/transaction/TransactionItem";
import { TransactionLogger } from "@/components/transaction/TransactionLogger";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  CategoryFilterGrid,
  FilterPanel,
  FilterToggle,
  SearchField,
  WalletFilterGrid,
} from "@/components/ui/FilterBar";
import { openLogger } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { formatDateLabel } from "@/lib/utils/date";
import { formatIDR } from "@/lib/utils/format";
import type { Transaction, TxType } from "@/types";

type TypeFilter = "all" | TxType;

const TYPE_OPTIONS = [
  { value: "all" as TypeFilter, label: "Semua" },
  { value: "expense" as TypeFilter, label: "Keluar" },
  { value: "income" as TypeFilter, label: "Masuk" },
  { value: "transfer" as TypeFilter, label: "Transfer" },
];

export function HistoryPage() {
  const router = useRouter();
  const wallets = useWallets();
  const categories = useCategories();

  const [search, setSearch] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [walletId, setWalletId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const focusId = useMemo(
    () => (typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("focus")),
    []
  );

  const transactions = useTransactions({
    type: type === "all" ? undefined : type,
    walletId: walletId ?? undefined,
    categoryId: categoryId ?? undefined,
    search: search.trim() || undefined,
  });

  const catMap = useMemo(() => new Map((categories ?? []).map((c) => [c.id, c])), [categories]);
  const walletMap = useMemo(() => new Map((wallets ?? []).map((w) => [w.id, w])), [wallets]);

  // Buka transaksi yang dituju dari dashboard (sekali saja).
  const openedFocus = useRef(false);
  useEffect(() => {
    if (!focusId || !transactions || openedFocus.current) return;
    openedFocus.current = true;
    const target = transactions.find((t) => t.id === focusId);
    const t = window.setTimeout(() => {
      if (target) setEditing(target);
      router.replace("/history");
    }, 0);
    return () => window.clearTimeout(t);
  }, [focusId, transactions, router]);

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of transactions ?? []) {
      const key = t.date.slice(0, 10);
      const arr = map.get(key);
      if (arr) arr.push(t);
      else map.set(key, [t]);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [transactions]);

  const activeFilterCount = [type !== "all", walletId !== null, categoryId !== null].filter(Boolean).length;
  const filtering = activeFilterCount > 0 || search.trim().length > 0;

  const resetFilters = () => {
    setType("all");
    setWalletId(null);
    setCategoryId(null);
    setSearch("");
  };

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    await deleteTransaction(pendingDelete.id);
    setPendingDelete(null);
  }, [pendingDelete]);

  return (
    <PageContainer className="space-y-4">
      <PageHeader
        title="Riwayat"
        subtitle={transactions ? `${transactions.length} transaksi${filtering ? " (terfilter)" : ""}` : "Memuat…"}
        action={
          filtering ? (
            <button
              type="button"
              onClick={resetFilters}
              className="flex h-9 items-center gap-1 rounded-full border border-line bg-surface px-3.5 text-[12px] font-medium text-text-muted transition-colors hover:text-text active:scale-95"
            >
              <X size={13} strokeWidth={2} /> Reset
            </button>
          ) : undefined
        }
      />

      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <SearchField value={search} onChange={setSearch} />
        </div>
        <FilterToggle open={filtersOpen} onClick={() => setFiltersOpen((v) => !v)} count={activeFilterCount} />
      </div>

      <FilterPanel open={filtersOpen}>
        <SegmentedControl options={TYPE_OPTIONS} value={type} onChange={setType} layoutId="history-type" compact />
        {wallets && wallets.length > 0 && (
          <div className="space-y-1.5">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">Dompet</p>
            <WalletFilterGrid wallets={wallets} value={walletId} onChange={setWalletId} layoutId="history-wallet" />
          </div>
        )}
        {categories && categories.length > 0 && (
          <div className="space-y-1.5">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">Kategori</p>
            <CategoryFilterGrid
              categories={categories}
              value={categoryId}
              onChange={setCategoryId}
              layoutId="history-category"
              allIcon={ReceiptText}
            />
          </div>
        )}
      </FilterPanel>

      {!transactions ? (
        <div className="space-y-2 pt-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-1 py-2">
              <div className="h-9 w-9 animate-pulse rounded-full bg-surface-2" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
                <div className="h-2.5 w-1/3 animate-pulse rounded bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<Filter size={22} strokeWidth={2} />}
          title={filtering ? "Tidak ada hasil" : "Belum ada transaksi"}
          description={filtering ? "Coba ubah kata kunci atau filter." : "Transaksi yang kamu catat akan muncul di sini."}
          action={
            filtering ? (
              <Button size="sm" variant="secondary" onClick={resetFilters}>
                Hapus filter
              </Button>
            ) : (
              <Button size="sm" onClick={openLogger}>
                Catat transaksi
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-5">
          {groups.map(([day, items]) => {
            const net = items.reduce(
              (acc, t) => acc + (t.type === "income" ? t.amount : t.type === "expense" ? -t.amount : 0),
              0
            );
            return (
              <section key={day}>
                <div className="mb-1.5 flex items-center justify-between gap-3 px-1">
                  <h2 className="text-[11.5px] font-semibold text-text-muted">{formatDateLabel(day)}</h2>
                  <span className={`text-[11.5px] font-semibold tabular-nums ${net >= 0 ? "text-income" : "text-expense"}`}>
                    {net >= 0 ? "+" : "−"}
                    {formatIDR(Math.abs(net))}
                  </span>
                </div>
                <ul className="card-shadow overflow-hidden rounded-2xl border border-line bg-surface p-1.5">
                  <AnimatePresence initial={false}>
                    {items.map((t) => (
                      <TransactionItem
                        key={t.id}
                        transaction={t}
                        category={t.categoryId ? catMap.get(t.categoryId) : undefined}
                        wallet={walletMap.get(t.walletId)}
                        toWallet={t.toWalletId ? walletMap.get(t.toWalletId) : undefined}
                        onEdit={setEditing}
                        onDelete={setPendingDelete}
                        showMeta={false}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              </section>
            );
          })}

          <p className="pt-1 text-center text-[11px] text-text-muted">Ketuk untuk mengedit, tahan untuk menghapus</p>
        </div>
      )}

      <TransactionLogger
        open={!!editing}
        onClose={() => setEditing(null)}
        wallets={wallets ?? []}
        editing={editing}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Hapus transaksi?"
        description={
          pendingDelete ? `${formatIDR(pendingDelete.amount)} · ${formatDateLabel(pendingDelete.date)}` : undefined
        }
        onConfirm={() => void confirmDelete()}
        onClose={() => setPendingDelete(null)}
      />
    </PageContainer>
  );
}
