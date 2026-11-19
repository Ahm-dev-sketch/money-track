"use client";

import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";
import { formatDateShort } from "@/lib/utils/date";
import { formatIDR } from "@/lib/utils/format";
import { Icon } from "@/components/ui/Icon";
import { toneFor, TRANSFER_COLOR, TRANSFER_ICON } from "@/components/lib/constants";
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

export function TransactionItem({ transaction: t, category, wallet, toWallet, onEdit, onDelete, showMeta = true }: TransactionItemProps) {
  const isTransfer = t.type === "transfer";
  const isIncome = t.type === "income";
  const color = isTransfer
    ? TRANSFER_COLOR
    : category
      ? toneFor(category.id)
      : isIncome
        ? "var(--income)"
        : "var(--expense)";
  const tint = category ? `${color}14` : `color-mix(in srgb, ${color} 12%, transparent)`;
  const iconName = isTransfer ? TRANSFER_ICON : category?.icon ?? "MoreHorizontal";
  const title = isTransfer
    ? `Transfer ke ${toWallet?.name ?? "dompet"}`
    : t.note.trim() || category?.name || "Tanpa kategori";

  const amountColor = isIncome ? "text-income" : isTransfer ? "text-text-muted" : "text-expense";
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
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-surface-2/70 active:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
        style={{ background: tint, color }}
      >
        <Icon name={iconName} size={17} strokeWidth={2} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-medium text-text">{title}</span>
        <span className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-text-muted">
          {isTransfer && <ArrowLeftRight size={11} strokeWidth={2} className="shrink-0" />}
          {metaParts.join(" · ")}
        </span>
      </span>

      <span className="flex shrink-0 flex-col items-end">
        <span className={`text-[13.5px] font-semibold tabular-nums ${amountColor}`}>
          {sign}
          {formatIDR(t.amount)}
        </span>
        <span className="mt-0.5 flex items-center gap-0.5 text-[10px] font-medium text-text-muted">
          {isIncome ? <ArrowDownLeft size={10} strokeWidth={2} /> : isTransfer ? null : <ArrowUpRight size={10} strokeWidth={2} />}
          {isTransfer ? "transfer" : isIncome ? "masuk" : "keluar"}
        </span>
      </span>
    </button>
  );

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0 }}
      transition={{ duration: 0.22 }}
      className="list-none"
    >
      {content}
    </motion.li>
  );
}
