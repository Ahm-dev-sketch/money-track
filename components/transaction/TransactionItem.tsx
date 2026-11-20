"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";
import { formatDateShort } from "@/lib/utils/date";
import { formatIDR } from "@/lib/utils/format";
import { Icon } from "@/components/ui/Icon";
import { categoryTone, TRANSFER_COLOR, TRANSFER_ICON } from "@/components/lib/constants";
import type { Category, Transaction, Wallet } from "@/types";

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  wallet?: Wallet;
  toWallet?: Wallet;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
  /** Tampilkan nama dompet & tanggal sebagai subtitle. */
  showMeta?: boolean;
}

export function TransactionItemImpl({ transaction: t, category, wallet, toWallet, onEdit, onDelete, showMeta = true }: TransactionItemProps) {
  const isTransfer = t.type === "transfer";
  const isIncome = t.type === "income";
  const color = isTransfer
    ? TRANSFER_COLOR
    : category
      ? categoryTone(category)
      : isIncome
        ? "var(--income)"
        : "var(--expense)";
  const tint = category ? `${color}1A` : `color-mix(in srgb, ${color} 15%, transparent)`;
  const iconName = isTransfer ? TRANSFER_ICON : category?.icon ?? "MoreHorizontal";
  const title = isTransfer
    ? `Transfer ke ${toWallet?.name ?? "dompet"}`
    : t.note.trim() || category?.name || "Tanpa kategori";

  const amountColor = isIncome
    ? "text-emerald-600 dark:text-emerald-400"
    : isTransfer
      ? "text-text-muted"
      : "text-text";
  const sign = isIncome ? "+" : isTransfer ? "" : "−";
  const time = t.date.slice(11, 16);

  const metaParts = [wallet?.name, showMeta ? formatDateShort(t.date) : null, time].filter(Boolean);

  const content = (
    <button
      type="button"
      onClick={() => onEdit?.(t)}
      onContextMenu={(e) => {
        if (!onDelete) return;
        e.preventDefault();
        onDelete(t);
      }}
      className="group flex w-full items-center gap-3.5 rounded-[18px] px-2.5 py-2.5 text-left transition-all hover:bg-surface-2/80 active:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] transition-transform group-hover:scale-105"
        style={{ background: tint, color }}
      >
        <Icon name={iconName} size={19} strokeWidth={2.2} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold text-text">{title}</span>
        <span className="mt-0.5 flex items-center gap-1.5 truncate text-[11.5px] font-medium text-text-muted">
          {isTransfer && <ArrowLeftRight size={11} strokeWidth={2.2} className="shrink-0 text-emerald-600" />}
          {metaParts.join(" · ")}
        </span>
      </span>

      <span className="flex shrink-0 flex-col items-end">
        <span className={`text-[14px] font-bold tabular-nums tracking-tight ${amountColor}`}>
          {sign} {formatIDR(t.amount)}
        </span>
        <span className="mt-0.5 flex items-center gap-0.5 text-[10.5px] font-medium text-text-muted">
          {isIncome ? (
            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
              <ArrowDownLeft size={10} strokeWidth={2.4} className="mr-0.5" /> Masuk
            </span>
          ) : isTransfer ? (
            <span>Transfer</span>
          ) : (
            <span className="inline-flex items-center text-expense font-medium">
              <ArrowUpRight size={10} strokeWidth={2.4} className="mr-0.5" /> Keluar
            </span>
          )}
        </span>
      </span>
    </button>
  );

  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="list-none"
    >
      {content}
    </motion.li>
  );
}

/** Item riwayat di-memo agar ribuan baris tidak ikut re-render saat state lain berubah. */
export const TransactionItem = memo(TransactionItemImpl);
