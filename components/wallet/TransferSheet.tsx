"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftRight, ArrowRight, LoaderCircle } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { WalletPicker } from "@/components/transaction/WalletPicker";
import { AmountInput } from "@/components/transaction/AmountInput";
import { addTransaction } from "@/lib/db/repository";
import { inputToAmountInt } from "@/lib/utils/format";
import { nowLocalISO, todayDateKey } from "@/lib/utils/date";
import { dateKeyToISO, walletTone, TRANSFER_COLOR } from "@/components/lib/constants";
import type { Wallet } from "@/types";

interface TransferSheetProps {
  open: boolean;
  onClose: () => void;
  wallets: Wallet[];
  /** Dompet asal terpilih saat dibuka. */
  fromWalletId?: string;
}

export function TransferSheet({ open, onClose, wallets, fromWalletId }: TransferSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Transfer antar dompet"
      subtitle="Pindahkan saldo tanpa tercatat sebagai pengeluaran."
    >
      {open && (
        <TransferForm
          key={fromWalletId ?? "default"}
          wallets={wallets}
          fromWalletId={fromWalletId}
          onDone={onClose}
        />
      )}
    </BottomSheet>
  );
}

function TransferForm({
  wallets,
  fromWalletId,
  onDone,
}: {
  wallets: Wallet[];
  fromWalletId?: string;
  onDone: () => void;
}) {
  const initialFrom =
    fromWalletId && wallets.some((w) => w.id === fromWalletId) ? fromWalletId : wallets[0]?.id ?? "";

  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(wallets.find((w) => w.id !== initialFrom)?.id ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [dateKey, setDateKey] = useState(todayDateKey());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fromWallet = useMemo(() => wallets.find((w) => w.id === from), [wallets, from]);
  const toWallet = useMemo(() => wallets.find((w) => w.id === to), [wallets, to]);

  // Ganti asal → pastikan tujuan tidak sama.
  const changeFrom = (id: string) => {
    setFrom(id);
    if (id === to) setTo(wallets.find((w) => w.id !== id)?.id ?? "");
    setError(null);
  };

  const swap = () => {
    if (!to) return;
    setFrom(to);
    setTo(from);
  };

  const submit = async () => {
    const value = inputToAmountInt(amount);
    if (value <= 0) return setError("Nominal harus lebih dari Rp 0.");
    if (!from) return setError("Pilih dompet asal.");
    if (!to) return setError("Pilih dompet tujuan.");
    if (from === to) return setError("Dompet asal dan tujuan tidak boleh sama.");

    setSaving(true);
    setError(null);
    try {
      await addTransaction({
        type: "transfer",
        amount: value,
        categoryId: null,
        walletId: from,
        toWalletId: to,
        note,
        date: dateKey === todayDateKey() ? nowLocalISO() : dateKeyToISO(dateKey),
      });
      onDone();
    } catch {
      setError("Gagal menyimpan transfer. Coba lagi.");
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
      <AmountInput value={amount} onChange={setAmount} accent={TRANSFER_COLOR} autoFocus />

      <div className="space-y-3 rounded-2xl border border-line bg-surface-2/40 p-3">
        <WalletPicker label="Dari" wallets={wallets} value={from} onChange={changeFrom} layoutId="transfer-from" />
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={swap}
            aria-label="Tukar dompet"
            className="grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-text-muted transition-transform hover:text-text active:rotate-180"
          >
            <ArrowLeftRight size={14} strokeWidth={2} />
          </button>
        </div>
        <WalletPicker label="Ke" wallets={wallets} value={to} onChange={setTo} excludeId={from} layoutId="transfer-to" />
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <label className="block">
          <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">
            Catatan
          </span>
          <input
            type="text"
            value={note}
            maxLength={120}
            onChange={(e) => setNote(e.target.value)}
            placeholder="opsional"
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-text placeholder:text-text-muted/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">
            Tanggal
          </span>
          <input
            type="date"
            value={dateKey}
            max={todayDateKey()}
            onChange={(e) => setDateKey(e.target.value || todayDateKey())}
            className="h-11 w-[9.5rem] rounded-xl border border-line bg-surface px-2 text-[13px] font-medium text-text focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </label>
      </div>

      {fromWallet && toWallet && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface-2/50 px-3 py-2 text-[12px] font-medium text-text-muted">
          <span className="flex min-w-0 items-center gap-1.5">
            <Icon name={fromWallet.icon} size={13} strokeWidth={2} color={walletTone(fromWallet)} />
            <span className="truncate">{fromWallet.name}</span>
          </span>
          <ArrowRight size={13} strokeWidth={2} className="shrink-0" />
          <span className="flex min-w-0 items-center gap-1.5">
            <Icon name={toWallet.icon} size={13} strokeWidth={2} color={walletTone(toWallet)} />
            <span className="truncate">{toWallet.name}</span>
          </span>
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            role="alert"
            className="rounded-xl border border-expense/25 bg-expense/10 px-3 py-2 text-[12.5px] font-medium text-expense"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={saving || wallets.length < 2}
        leftIcon={saving ? <LoaderCircle size={17} className="animate-spin" /> : <ArrowLeftRight size={17} strokeWidth={2} />}
      >
        {saving ? "Memproses…" : "Transfer"}
      </Button>
      {wallets.length < 2 && (
        <p className="text-center text-[12px] text-text-muted">Butuh minimal dua dompet untuk transfer.</p>
      )}
    </form>
  );
}
