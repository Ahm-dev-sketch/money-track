"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { inkFor, toneFor } from "@/components/lib/constants";
import type { Category, TxType } from "@/types";

interface CategoryPickerProps {
  categories: Category[];
  /** Transfer tidak memerlukan kategori. */
  type: Exclude<TxType, "transfer">;
  value: string | null;
  onChange: (id: string) => void;
}

export function CategoryPicker({ categories, type, value, onChange }: CategoryPickerProps) {
  const items = categories.filter((c) => c.type === type).sort((a, b) => a.order - b.order);

  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-2">
        {items.length === 0 && (
          <p className="py-3 text-[13px] text-text-muted">Belum ada kategori {type === "expense" ? "pengeluaran" : "pemasukan"}.</p>
        )}
        {items.map((c) => {
          const active = c.id === value;
          const tone = toneFor(c.id);
          return (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => onChange(c.id)}
              aria-pressed={active}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className="flex w-[76px] shrink-0 flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 transition-colors"
              style={{
                borderColor: active ? `${tone}66` : "var(--line)",
                background: active ? `${tone}12` : "var(--surface)",
              }}
            >
              <span
                className="grid h-10 w-10 place-items-center rounded-full transition-colors"
                style={{
                  background: active ? tone : `${tone}14`,
                  color: active ? inkFor(tone) : tone,
                }}
              >
                <Icon name={c.icon} size={18} strokeWidth={2} />
              </span>
              <span
                className={`line-clamp-2 text-center text-[10.5px] leading-tight ${
                  active ? "font-semibold text-text" : "font-medium text-text-muted"
                }`}
              >
                {c.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
