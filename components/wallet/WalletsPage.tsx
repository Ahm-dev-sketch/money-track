"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, Plus, Wallet as WalletIcon } from "lucide-react";
import { useWalletBalances, useWallets } from "@/lib/hooks/useData";
import { countTransactionsByWallet, deleteWallet } from "@/lib/db/repository";
import { PageContainer, PageHeader } from "@/components/ui/PageHeader";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { WalletCard } from "./WalletCard";
import { TransferSheet } from "./TransferSheet";
import { WalletFormSheet } from "./WalletFormSheet";
import type { Wallet } from "@/types";

export function WalletsPage() {
  const wallets = useWallets();
  const balances = useWalletBalances(wallets);

  const [transferOpen, setTransferOpen] = useState(false);
  const [transferFrom, setTransferFrom] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState<Wallet | "new" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ wallet: Wallet; count: number } | null>(null);

  const total = balances?.reduce((a, b) => a + b.balance, 0) ?? 0;

  const openTransfer = (fromId?: string) => {
    setTransferFrom(fromId);
    setTransferOpen(true);
  };

  // Hitung pemakaian dompet dulu supaya peringatan di dialog bisa menyebut angkanya.
  const requestDelete = async (wallet: Wallet) => {
    setEditing(null);
    const count = await countTransactionsByWallet(wallet.id);
    setPendingDelete({ wallet, count });
  };

  return (
    <PageContainer className="space-y-5">
      <PageHeader
        title="Dompet"
        subtitle="Kelola sumber dana & saldomu"
        action={
          <Button size="sm" variant="secondary" leftIcon={<Plus size={14} strokeWidth={2} />} onClick={() => setEditing("new")}>
            Tambah
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="hero-shadow relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0c382e] via-[#0a3128] to-[#07241d] p-5.5 text-white"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10">
          <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-emerald-200/80">
            <WalletIcon size={14} strokeWidth={2.2} /> Total semua dompet
          </p>
          <p className="mt-2.5 text-[32px] sm:text-[36px] font-extrabold leading-tight tracking-tight tabular-nums text-white">
            <AnimatedNumber value={total} />
          </p>
          <div className="mt-5 flex gap-2.5 border-t border-white/15 pt-4">
            <button
              type="button"
              onClick={() => openTransfer()}
              disabled={!wallets || wallets.length < 2}
              className="flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-bold text-[#0c382e] shadow-sm transition-transform active:scale-95 disabled:opacity-40"
            >
              <ArrowLeftRight size={15} strokeWidth={2.4} /> Transfer
            </button>
            <button
              type="button"
              onClick={() => setEditing("new")}
              className="flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-[13px] font-bold text-white transition-transform hover:bg-white/15 active:scale-95"
            >
              <Plus size={15} strokeWidth={2.4} /> Dompet baru
            </button>
          </div>
        </div>
      </motion.div>

      {!balances ? (
        <div className="grid gap-2 md:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[74px] animate-pulse rounded-2xl border border-line bg-surface" />
          ))}
        </div>
      ) : balances.length === 0 ? (
        <Card>
          <EmptyState
            icon={<WalletIcon size={22} strokeWidth={2} />}
            title="Belum ada dompet"
            description="Tambahkan dompet pertama (tunai, rekening, atau e-wallet)."
            action={
              <Button size="sm" onClick={() => setEditing("new")} leftIcon={<Plus size={14} strokeWidth={2} />}>
                Tambah dompet
              </Button>
            }
          />
        </Card>
      ) : (
        <section>
          <SectionTitle
            icon={WalletIcon}
            right={<span className="text-[11px] font-medium text-text-muted">{balances.length} dompet</span>}
          >
            Semua dompet
          </SectionTitle>
          <div className="grid gap-2 md:grid-cols-2">
            {balances.map((b, i) => (
              <WalletCard key={b.wallet.id} data={b} index={i} onEdit={(w) => setEditing(w)} />
            ))}
          </div>
          <p className="mt-2 px-1 text-[11px] text-text-muted">Ketuk kartu dompet untuk mengubah atau menghapus.</p>
        </section>
      )}

      <TransferSheet
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        wallets={wallets ?? []}
        fromWalletId={transferFrom}
      />

      <WalletFormSheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        wallet={editing === "new" ? null : editing}
        onRequestDelete={(w) => void requestDelete(w)}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Hapus "${pendingDelete?.wallet.name ?? ""}"?`}
        description={
          pendingDelete && pendingDelete.count > 0
            ? `${pendingDelete.count} transaksi masih memakai dompet ini. Dompet akan dihapus dan transaksi tersebut menjadi tanpa dompet.`
            : "Dompet akan dihapus. Saldo dan riwayatnya tidak lagi terhubung."
        }
        onConfirm={() => {
          if (pendingDelete) void deleteWallet(pendingDelete.wallet.id);
          setPendingDelete(null);
        }}
        onClose={() => setPendingDelete(null)}
      />
    </PageContainer>
  );
}
