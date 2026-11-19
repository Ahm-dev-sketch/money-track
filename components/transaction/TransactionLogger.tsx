"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, CalendarDays, Check, LoaderCircle, Trash2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AmountInput } from "./AmountInput";
import { CategoryPicker } from "./CategoryPicker";
import { WalletPicker } from "./WalletPicker";
import { addTransaction, deleteTransaction, setSetting, updateTransaction } from "@/lib/db/repository";
import { nowLocalISO, todayDateKey } from "@/lib/utils/date";
import { inputToAmountInt } from "@/lib/utils/format";
import { useCategories } from "@/lib/hooks/useData";
import { dateKeyToISO, defaultWalletId, EXPENSE_COLOR, INCOME_COLOR, TRANSFER_COLOR } from "@/components/lib/constants";
import type { Transaction, TxType, Wallet } from "@/types";

interface TransactionLoggerProps {
  open: boolean;
  onClose: () => void;
  wallets: Wallet[];
  defaultWalletId?: string;
  /** Transaksi yang sedang diedit (null = mode tambah). */
  editing?: Transaction | null;
}

const TYPE_OPTIONS = [
  { value: "expense" as TxType, label: "Pengeluaran", color: EXPENSE_COLOR },
  { value: "income" as TxType, label: "Pemasukan", color: INCOME_COLOR },
  { value: "transfer" as TxType, label: "Transfer", color: TRANSFER_COLOR },
];

export function TransactionLogger({ open, onClose, wallets, defaultWalletId: preferredWallet, editing }: TransactionLoggerProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isEdit = !!editing;

  const remove = async () => {
    if (!editing) return;
    await deleteTransaction(editing.id);
    onClose();
  };

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        title={isEdit ? "Edit transaksi" : "Catat transaksi"}
        subtitle={isEdit ? "Perbarui detail lalu simpan." : "Catat dalam 3 ketukan."}
        action={
          isEdit ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              aria-label="Hapus transaksi"
              className="grid h-9 w-9 place-items-center rounded-full text-expense transition-colors hover:bg-expense/10 active:scale-95"
            >
              <Trash2 size={17} strokeWidth={2} />
            </button>
          ) : undefined
        }
      >
        {/* Form di-mount ulang tiap kali sheet dibuka atau target edit berubah. */}
        {open && (
          <LoggerForm
            key={editing?.id ?? "new"}
            wallets={wallets}
            preferredWallet={preferredWallet}
            editing={editing ?? null}
            onDone={onClose}
            onRequestDelete={() => setConfirmDelete(true)}
          />
        )}
      </BottomSheet>

      <ConfirmDialog
        open={confirmDelete}
        title="Hapus transaksi?"
        description="Tindakan ini tidak bisa dibatalkan. Saldo dompet akan ikut menyesuaikan."
        confirmLabel="Hapus"
        onConfirm={() => void remove()}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}

interface LoggerFormProps {
  wallets: Wallet[];
  preferredWallet?: string;
  editing: Transaction | null;
  onDone: () => void;
  onRequestDelete: () => void;
}

function LoggerForm({ wallets, preferredWallet, editing, onDone, onRequestDelete }: LoggerFormProps) {
  const categories = useCategories();
  const fallbackWallet = defaultWalletId(wallets, preferredWallet);

  const [type, setType] = useState<TxType>(editing?.type ?? "expense");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [categoryId, setCategoryId] = useState<string | null>(editing?.categoryId ?? null);
  const [walletId, setWalletIdState] = useState(editing?.walletId ?? fallbackWallet);
  const [toWalletId, setToWalletId] = useState(editing?.toWalletId ?? "");
  const [note, setNote] = useState(editing?.note ?? "");
  const [dateKey, setDateKey] = useState(editing?.date.slice(0, 10) ?? todayDateKey());
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Dompet yang dipilih bisa hilang (mis. dihapus) → pakai fallback tanpa mengubah state.
  const effectiveWalletId = wallets.some((w) => w.id === walletId) ? walletId : fallbackWallet;

  const accent = type === "income" ? INCOME_COLOR : type === "transfer" ? TRANSFER_COLOR : EXPENSE_COLOR;

  const changeType = (next: TxType) => {
    if (next === type) return;
    setType(next);
    setError(null);
    setCategoryId(null);
    if (next === "transfer") {
      setToWalletId(wallets.find((w) => w.id !== effectiveWalletId)?.id ?? "");
    } else {
      setToWalletId("");
    }
  };

  const validate = (): string | null => {
    if (inputToAmountInt(amount) <= 0) return "Nominal harus lebih dari Rp 0.";
    if (!effectiveWalletId) return "Pilih dompet terlebih dahulu.";
    if (type === "transfer") {
      if (!toWalletId) return "Pilih dompet tujuan.";
      if (toWalletId === effectiveWalletId) return "Dompet asal dan tujuan tidak boleh sama.";
    } else if (!categoryId) {
      return "Pilih kategori terlebih dahulu.";
    }
    return null;
  };

  const submit = async () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const value = inputToAmountInt(amount);
      const date =
        editing && editing.date.slice(0, 10) === dateKey
          ? editing.date
          : dateKey === todayDateKey()
            ? nowLocalISO()
            : dateKeyToISO(dateKey);

      const payload = {
        type,
        amount: value,
        categoryId: type === "transfer" ? null : categoryId,
        walletId: effectiveWalletId,
        toWalletId: type === "transfer" ? toWalletId : null,
        note,
        date,
      };

      if (editing) await updateTransaction(editing.id, payload);
      else await addTransaction(payload);

      if (effectiveWalletId) void setSetting("lastWalletId", effectiveWalletId);
      onDone();
    } catch {
      setError("Gagal menyimpan transaksi. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const isEdit = !!editing;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="space-y-4 pt-1"
    >
      <Toggle
        options={TYPE_OPTIONS}
        value={type}
        onChange={changeType}
        layoutId={`logger-type-${editing?.id ?? "new"}`}
        ariaLabel="Jenis transaksi"
      />

      <AmountInput value={amount} onChange={setAmount} accent={accent} autoFocus={!isEdit} />

      {type !== "transfer" ? (
        <div>
          <Label>Kategori</Label>
          <CategoryPicker categories={categories ?? []} type={type} value={categoryId} onChange={setCategoryId} />
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl border border-line bg-surface-2/40 p-3">
          <WalletPicker
            label="Dari dompet"
            wallets={wallets}
            value={effectiveWalletId}
            onChange={setWalletIdState}
            layoutId="logger-from"
          />
          <div className="flex justify-center text-text-muted">
            <ArrowLeftRight size={16} strokeWidth={2} />
          </div>
          <WalletPicker
            label="Ke dompet"
            wallets={wallets}
            value={toWalletId}
            onChange={setToWalletId}
            excludeId={effectiveWalletId}
            layoutId="logger-to"
          />
        </div>
      )}

      {type !== "transfer" && (
        <WalletPicker
          label="Sumber dana"
          wallets={wallets}
          value={effectiveWalletId}
          onChange={setWalletIdState}
          layoutId="logger-wallet"
        />
      )}

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <div>
          <Label htmlFor="tx-note">Catatan</Label>
          <input
            id="tx-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={120}
            placeholder={type === "transfer" ? "mis. pindah ke tabungan" : "mis. kopi pagi"}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-text placeholder:text-text-muted/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <div>
          <Label htmlFor="tx-date">Tanggal</Label>
          <label className="relative flex h-11 cursor-pointer items-center">
            <CalendarDays size={15} strokeWidth={2} className="pointer-events-none absolute left-3 text-text-muted" />
            <input
              id="tx-date"
              type="date"
              value={dateKey}
              max={todayDateKey()}
              onChange={(e) => setDateKey(e.target.value || todayDateKey())}
              className="h-11 w-[9.5rem] rounded-xl border border-line bg-surface pl-9 pr-2 text-[13px] font-medium text-text focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </label>
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="rounded-xl border border-expense/25 bg-expense/10 px-3 py-2 text-[12.5px] font-medium text-expense"
        >
          {error}
        </motion.p>
      )}

      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={saving || wallets.length === 0}
        leftIcon={saving ? <LoaderCircle size={17} className="animate-spin" /> : <Check size={18} strokeWidth={2} />}
        style={{ background: accent, color: "#ffffff" }}
      >
        {saving ? "Menyimpan…" : isEdit ? "Simpan perubahan" : "Simpan transaksi"}
      </Button>
      {wallets.length === 0 && (
        <p className="text-center text-[12px] text-text-muted">Tambahkan dompet dulu di halaman Dompet.</p>
      )}

      {isEdit && (
        <button
          type="button"
          onClick={onRequestDelete}
          className="mx-auto flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-expense transition-colors hover:bg-expense/10 active:scale-95"
        >
          <Trash2 size={15} strokeWidth={2} /> Hapus transaksi
        </button>
      )}
    </form>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">
      {children}
    </label>
  );
}
