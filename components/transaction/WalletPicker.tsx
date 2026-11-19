"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { walletTone } from "@/components/lib/constants";
import type { Wallet } from "@/types";

interface WalletPickerProps {
  wallets: Wallet[];
  value: string;
  onChange: (id: string) => void;
  /** Label kecil di atas (misal "Dari" / "Ke"). */
  label?: string;
  excludeId?: string;
  layoutId: string;
}

export function WalletPicker({ wallets, value, onChange, label, excludeId, layoutId }: WalletPickerProps) {
  const items = wallets.filter((w) => w.id !== excludeId);

  return (
    <div>
      {label && (
        <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {items.map((w) => {
          const active = w.id === value;
          const tone = walletTone(w);
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => onChange(w.id)}
              aria-pressed={active}
              className="relative flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium transition-colors"
              style={{
                borderColor: active ? `${tone}66` : "var(--line)",
                color: active ? tone : "var(--text-muted)",
                background: active ? `${tone}12` : "var(--surface)",
              }}
            >
              {active && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-0 rounded-full"
                  style={{ border: `1.5px solid ${tone}80` }}
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <Icon name={w.icon} size={14} strokeWidth={2} />
              <span className="relative z-10 max-w-[9rem] truncate">{w.name}</span>
            </button>
          );
        })}
        {items.length === 0 && <p className="text-[12.5px] text-text-muted">Tidak ada dompet lain.</p>}
      </div>
    </div>
  );
}
