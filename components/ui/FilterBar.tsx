"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { toneFor } from "@/components/lib/constants";

/**
 * Grid/tab-bar untuk filter katalog (kategori & dompet).
 * Semua opsi tampil sekaligus dalam baris horizontal scroll.
 */

interface CategoryFilterGridProps {
  categories: CategoryOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  layoutId: string;
  allLabel?: string;
  allIcon?: LucideIcon;
}

export interface CategoryOption {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export function CategoryFilterGrid({
  categories,
  value,
  onChange,
  layoutId,
  allLabel = "Semua",
  allIcon,
}: CategoryFilterGridProps) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max items-stretch gap-1.5">
        <FilterPill
          active={value === null}
          layoutId={layoutId}
          onClick={() => onChange(null)}
          label={allLabel}
          icon={
            allIcon ? (
              (() => {
                const AllIcon = allIcon;
                return <AllIcon size={15} strokeWidth={2} />;
              })()
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-text-muted" />
            )
          }
        />
        {categories.map((c) => {
          const tone = toneFor(c.id);
          return (
            <FilterPill
              key={c.id}
              active={value === c.id}
              layoutId={layoutId}
              onClick={() => onChange(value === c.id ? null : c.id)}
              label={c.name}
              color={tone}
              icon={
                <span
                  className="grid h-5 w-5 place-items-center rounded-full"
                  style={{ background: `${tone}1A`, color: tone }}
                >
                  <Icon name={c.icon} size={12} strokeWidth={2} />
                </span>
              }
            />
          );
        })}
      </div>
    </div>
  );
}

export function WalletFilterGrid({
  wallets,
  value,
  onChange,
  layoutId,
  allIcon,
}: {
  wallets: CategoryOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  layoutId: string;
  allIcon?: LucideIcon;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <FilterPill
        active={value === null}
        layoutId={layoutId}
        onClick={() => onChange(null)}
        label="Semua dompet"
        icon={
          allIcon ? (
            (() => {
              const AllIcon = allIcon;
              return <AllIcon size={15} strokeWidth={2} />;
            })()
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-text-muted" />
          )
        }
      />
      {wallets.map((c) => {
        const tone = toneFor(c.id);
        return (
          <FilterPill
            key={c.id}
            active={value === c.id}
            layoutId={layoutId}
            onClick={() => onChange(value === c.id ? null : c.id)}
            label={c.name}
            color={tone}
            icon={<Icon name={c.icon} size={14} strokeWidth={2} />}
          />
        );
      })}
    </div>
  );
}

function FilterPill({
  active,
  layoutId,
  onClick,
  label,
  icon,
  color,
}: {
  active: boolean;
  layoutId: string;
  onClick: () => void;
  label: string;
  icon: ReactNode;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[12.5px] font-medium transition-colors duration-150 ${
        active ? "border-transparent text-text" : "border-line bg-surface text-text-muted hover:text-text"
      }`}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-full"
          style={{
            background: color ? `${color}14` : "var(--surface-2)",
            border: `1px solid ${color ? `${color}4D` : "var(--line)"}`,
          }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5" style={active && color ? { color } : undefined}>
        {icon}
        <span className="max-w-[10rem] truncate">{label}</span>
      </span>
    </button>
  );
}

/** Input pencarian dengan ikon. */
export function SearchField({
  value,
  onChange,
  placeholder = "Cari catatan…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="relative flex h-11 items-center">
      <Search size={16} className="pointer-events-none absolute left-3.5 text-text-muted" strokeWidth={2} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Cari transaksi"
        className="h-11 w-full rounded-full border border-line bg-surface pl-10 pr-3.5 text-sm text-text placeholder:text-text-muted focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 [&::-webkit-search-cancel-button]:hidden"
      />
    </label>
  );
}

/** Panel filter lanjutan yang bisa dibuka-tutup. */
export function FilterPanel({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="space-y-3 pt-2">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function FilterToggle({ open, onClick, count }: { open: boolean; onClick: () => void; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className="relative flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-[13px] font-medium text-text transition-colors hover:bg-surface-2 active:scale-95"
    >
      Filter
      {count > 0 && (
        <span className="grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary">
          {count}
        </span>
      )}
      <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
        <ChevronDown size={15} strokeWidth={2} />
      </motion.span>
    </button>
  );
}
