"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { CategoryFormSheet } from "@/components/category/CategoryFormSheet";
import { categoryTone, inkFor } from "@/components/lib/constants";
import type { Category, TxType } from "@/types";

interface CategoryPickerProps {
  categories: Category[];
  /** Transfer tidak memerlukan kategori. */
  type: Exclude<TxType, "transfer">;
  value: string | null;
  onChange: (id: string) => void;
}

export function CategoryPicker({ categories, type, value, onChange }: CategoryPickerProps) {
  const [creating, setCreating] = useState(false);
  const items = categories.filter((c) => c.type === type).sort((a, b) => a.order - b.order);

  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-2">
        {items.length === 0 && (
          <p className="py-3 text-[13px] text-text-muted">Belum ada kategori {type === "expense" ? "pengeluaran" : "pemasukan"}.</p>
        )}
        {items.map((c) => {
          const active = c.id === value;
          const tone = categoryTone(c);
          return (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => onChange(c.id)}
              aria-pressed={active}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className="flex w-[82px] shrink-0 flex-col items-center gap-2 rounded-[20px] border px-1.5 py-3 transition-all"
              style={{
                borderColor: active ? `${tone}80` : "var(--line)",
                background: active ? `${tone}16` : "var(--surface)",
                boxShadow: active ? `0 2px 8px -2px ${tone}40` : undefined,
              }}
            >
              <span
                className="grid h-11 w-11 place-items-center rounded-[14px] transition-transform"
                style={{
                  background: active ? tone : `${tone}1A`,
                  color: active ? inkFor(tone) : tone,
                }}
              >
                <Icon name={c.icon} size={20} strokeWidth={2.2} />
              </span>
              <span
                className={`line-clamp-2 text-center text-[11px] leading-tight ${
                  active ? "font-bold text-text" : "font-medium text-text-muted"
                }`}
              >
                {c.name}
              </span>
            </motion.button>
          );
        })}

        <motion.button
          type="button"
          onClick={() => setCreating(true)}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          className="flex w-[82px] shrink-0 flex-col items-center gap-2 rounded-[20px] border border-dashed border-line px-1.5 py-3 text-text-muted transition-colors hover:border-primary/40 hover:text-primary"
        >
          <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-surface-2/80">
            <Plus size={19} strokeWidth={2.2} />
          </span>
          <span className="text-center text-[11px] font-semibold leading-tight">Baru</span>
        </motion.button>
      </div>

      <CategoryFormSheet
        open={creating}
        onClose={() => setCreating(false)}
        category={null}
        defaultType={type}
        subtitle="Kategori baru langsung terpilih untuk transaksi ini."
        onSaved={(id) => onChange(id)}
      />
    </div>
  );
}
