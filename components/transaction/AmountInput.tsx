"use client";

import { useRef } from "react";
import { formatAmountInput, inputToAmountInt } from "@/lib/utils/format";

interface AmountInputProps {
  value: string;
  onChange: (raw: string) => void;
  /** Warna nominal sesuai tipe transaksi. */
  accent?: string;
  autoFocus?: boolean;
  ariaLabel?: string;
}

/**
 * Input nominal besar. Menyimpan string mentah (digit bebas), menampilkan format "Rp 150.000".
 * Kursor selalu di akhir karena angka diformat ulang setiap ketikan.
 */
export function AmountInput({ value, onChange, accent = "var(--text)", autoFocus, ariaLabel = "Nominal transaksi" }: AmountInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const display = formatAmountInput(value);
  const empty = inputToAmountInt(value) === 0 && display === "";

  const handle = (raw: string) => {
    onChange(raw.replace(/\D/g, "").slice(0, 15));
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        enterKeyHint="done"
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        value={display}
        placeholder="Rp 0"
        onChange={(e) => handle(e.target.value)}
        onFocus={() => {
          requestAnimationFrame(() => {
            const el = inputRef.current;
            if (el) el.setSelectionRange(el.value.length, el.value.length);
          });
        }}
        className="w-full rounded-[24px] border border-line/90 bg-surface-2/70 px-5 py-4 text-right text-[32px] sm:text-[36px] font-extrabold tabular-nums tracking-tight placeholder:font-medium placeholder:text-text-muted/50 focus:border-emerald-600/50 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
        style={{ color: empty ? undefined : accent }}
      />
    </div>
  );
}
