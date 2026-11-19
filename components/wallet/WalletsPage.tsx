"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, Check, Plus, Trash2, Wallet as WalletIcon } from "lucide-react";
import { useWalletBalances, useWallets } from "@/lib/hooks/useData";
import { addWallet, deleteWallet, updateWallet } from "@/lib/db/repository";
import { PageContainer, PageHeader } from "@/components/ui/PageHeader";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Icon } from "@/components/ui/Icon";
import { WalletCard } from "./WalletCard";
import { TransferSheet } from "./TransferSheet";
import { formatAmountInput, inputToAmountInt } from "@/lib/utils/format";
import { toneFor, WALLET_COLOR_CHOICES, WALLET_ICON_CHOICES } from "@/components/lib/constants";
import type { Wallet } from "@/types";

export function WalletsPage() {
  const wallets = useWallets();
  const balances = useWalletBalances(wallets);

  const [transferOpen, setTransferOpen] = useState(false);
  const [transferFrom, setTransferFrom] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState<Wallet | "new" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Wallet | null>(null);

  const total = balances?.reduce((a, b) => a + b.balance, 0) ?? 0;

  const openTransfer = (fromId?: string) => {
    setTransferFrom(fromId);
    setTransferOpen(true);
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
        onRequestDelete={(w) => {
          setEditing(null);
          setPendingDelete(w);
        }}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Hapus "${pendingDelete?.name ?? ""}"?`}
        description="Dompet akan dihapus. Transaksi lama yang memakai dompet ini menjadi tanpa dompet."
        onConfirm={() => {
          if (pendingDelete) void deleteWallet(pendingDelete.id);
          setPendingDelete(null);
        }}
        onClose={() => setPendingDelete(null)}
      />
    </PageContainer>
  );
}

function WalletFormSheet({
  open,
  onClose,
  wallet,
  onRequestDelete,
}: {
  open: boolean;
  onClose: () => void;
  wallet: Wallet | null;
  onRequestDelete: (w: Wallet) => void;
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={wallet ? "Ubah dompet" : "Dompet baru"}
      subtitle="Nama, ikon, dan warna membantu membedakan sumber dana."
    >
      {open && (
        <WalletFormContent
          key={wallet?.id ?? "new"}
          wallet={wallet}
          onClose={onClose}
          onRequestDelete={onRequestDelete}
        />
      )}
    </BottomSheet>
  );
}

function WalletFormContent({
  wallet,
  onClose,
  onRequestDelete,
}: {
  wallet: Wallet | null;
  onClose: () => void;
  onRequestDelete: (w: Wallet) => void;
}) {
  const [name, setName] = useState(wallet?.name ?? "");
  const [icon, setIcon] = useState<string>(wallet?.icon ?? WALLET_ICON_CHOICES[0]);
  // Dompet lama menyimpan warna di luar palet; tampilkan nada palet terdekat agar pilihan tetap konsisten.
  const initialColor = wallet ? (WALLET_COLOR_CHOICES as readonly string[]).includes(wallet.color) ? wallet.color : toneFor(wallet.id) : WALLET_COLOR_CHOICES[0];
  const [color, setColor] = useState<string>(initialColor);
  const [initial, setInitial] = useState(wallet ? String(wallet.initialBalance) : "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return setError("Nama dompet wajib diisi.");
    setSaving(true);
    setError(null);
    try {
      const initialBalance = inputToAmountInt(initial);
      if (wallet) {
        await updateWallet(wallet.id, {
          name: trimmed,
          icon,
          color,
          initialBalance: initialBalance > 0 || initial === "" ? initialBalance : wallet.initialBalance,
        });
      } else {
        await addWallet({ name: trimmed, icon, color, initialBalance });
      }
      onClose();
    } catch {
      setError("Gagal menyimpan dompet.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="space-y-4 pt-1"
    >
      <div className="flex items-center gap-3.5 rounded-[20px] border border-line/80 bg-surface-2/60 p-3.5">
        <span className="grid h-11 w-11 place-items-center rounded-[14px]" style={{ background: `${color}1E`, color }}>
          <Icon name={icon} size={20} strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-text">{name.trim() || "Nama dompet"}</p>
          <p className="text-[12px] text-text-muted">{formatAmountInput(initial) || "Rp 0"} saldo awal</p>
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">Nama</span>
        <input
          type="text"
          value={name}
          maxLength={32}
          onChange={(e) => setName(e.target.value)}
          placeholder="mis. Rekening BCA"
          autoFocus
          className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-text placeholder:text-text-muted/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">Saldo awal</span>
        <input
          type="text"
          inputMode="numeric"
          value={formatAmountInput(initial)}
          onChange={(e) => setInitial(e.target.value.replace(/\D/g, "").slice(0, 15))}
          placeholder="Rp 0"
          className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-right text-sm font-semibold tabular-nums text-text placeholder:text-text-muted/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
      </label>

      <div>
        <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">Ikon</span>
        <div className="grid grid-cols-8 gap-1.5">
          {WALLET_ICON_CHOICES.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              aria-pressed={icon === ic}
              aria-label={ic}
              className="grid aspect-square place-items-center rounded-lg border transition-colors"
              style={{
                borderColor: icon === ic ? `${color}80` : "var(--line)",
                background: icon === ic ? `${color}12` : "transparent",
                color: icon === ic ? color : "var(--text-muted)",
              }}
            >
              <Icon name={ic} size={17} strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">Warna</span>
        <div className="flex flex-wrap gap-2">
          {WALLET_COLOR_CHOICES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-pressed={color === c}
              aria-label={`Warna ${c}`}
              className="grid h-8 w-8 place-items-center rounded-full transition-transform active:scale-90"
              style={{ background: c, boxShadow: color === c ? `0 0 0 2px var(--surface), 0 0 0 4px ${c}` : undefined }}
            >
              {color === c && <Check size={14} strokeWidth={2.5} className="text-white" />}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-expense/25 bg-expense/10 px-3 py-2 text-[12.5px] font-medium text-expense">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth disabled={saving}>
        {saving ? "Menyimpan…" : wallet ? "Simpan perubahan" : "Tambah dompet"}
      </Button>

      {wallet && (
        <button
          type="button"
          onClick={() => onRequestDelete(wallet)}
          className="mx-auto flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-expense transition-colors hover:bg-expense/10 active:scale-95"
        >
          <Trash2 size={15} strokeWidth={2} /> Hapus dompet
        </button>
      )}
    </form>
  );
}
