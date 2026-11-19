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
        className="w-full rounded-2xl border border-line bg-surface-2/60 px-4 py-4 text-right text-[30px] font-semibold tabular-nums tracking-[-0.03em] placeholder:font-medium placeholder:text-text-muted/60 focus:border-primary/50 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/15"
        style={{ color: empty ? undefined : accent }}
      />
    </div>
  );
}
