"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { addWallet, updateWallet } from "@/lib/db/repository";
import { formatAmountInput, inputToAmountInt } from "@/lib/utils/format";
import { toneFor, WALLET_COLOR_CHOICES, WALLET_ICON_CHOICES } from "@/components/lib/constants";
import type { Wallet } from "@/types";

interface WalletFormSheetProps {
  open: boolean;
  onClose: () => void;
  /** null = dompet baru. */
  wallet: Wallet | null;
  /** Dipanggil dengan id dompet setelah tersimpan. */
  onSaved?: (id: string) => void;
  onRequestDelete?: (wallet: Wallet) => void;
  subtitle?: string;
}

/**
 * Form dompet (nama, saldo awal, ikon, warna). Dipakai halaman Dompet maupun
 * pintasan "Dompet baru" di pencatat transaksi.
 */
export function WalletFormSheet({
  open,
  onClose,
  wallet,
  onSaved,
  onRequestDelete,
  subtitle = "Nama, ikon, dan warna membantu membedakan sumber dana.",
}: WalletFormSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={wallet ? "Ubah dompet" : "Dompet baru"} subtitle={subtitle}>
      {open && (
        <WalletFormContent
          key={wallet?.id ?? "new"}
          wallet={wallet}
          onClose={onClose}
          onSaved={onSaved}
          onRequestDelete={onRequestDelete}
        />
      )}
    </BottomSheet>
  );
}

function WalletFormContent({
  wallet,
  onClose,
  onSaved,
  onRequestDelete,
}: {
  wallet: Wallet | null;
  onClose: () => void;
  onSaved?: (id: string) => void;
  onRequestDelete?: (wallet: Wallet) => void;
}) {
  const [name, setName] = useState(wallet?.name ?? "");
  const [icon, setIcon] = useState<string>(wallet?.icon ?? WALLET_ICON_CHOICES[0]);
  // Dompet lama menyimpan warna di luar palet; tampilkan nada palet terdekat agar pilihan tetap konsisten.
  const initialColor = wallet
    ? (WALLET_COLOR_CHOICES as readonly string[]).includes(wallet.color)
      ? wallet.color
      : toneFor(wallet.id)
    : WALLET_COLOR_CHOICES[0];
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
        onSaved?.(wallet.id);
      } else {
        const id = await addWallet({ name: trimmed, icon, color, initialBalance });
        onSaved?.(id);
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
        // Sheet ini bisa hidup di dalam <form> pencatat transaksi (via portal React):
        // hentikan bubbling supaya transaksi tidak ikut tersimpan.
        e.stopPropagation();
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

      {wallet && onRequestDelete && (
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
