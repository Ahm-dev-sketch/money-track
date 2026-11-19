"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ChevronRight } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Chip } from "@/components/ui/Card";
import { formatIDR } from "@/lib/utils/format";
import { walletTone } from "@/components/lib/constants";
import type { Wallet, WalletBalance } from "@/types";

interface WalletCardProps {
  data: WalletBalance;
  onEdit?: (w: Wallet) => void;
  index?: number;
}

export function WalletCard({ data, onEdit, index = 0 }: WalletCardProps) {
  const { wallet, balance } = data;
  const negative = balance < 0;
  const tone = walletTone(wallet);

  return (
    <motion.button
      type="button"
      onClick={() => onEdit?.(wallet)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.985 }}
      className="card-shadow w-full rounded-2xl border border-line bg-surface p-4 text-left transition-colors hover:border-line/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="flex items-center gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={{ background: `${tone}14`, color: tone }}
        >
          <Icon name={wallet.icon} size={19} strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-medium text-text-muted">{wallet.name}</p>
          <p
            className={`mt-0.5 truncate text-[17px] font-semibold tabular-nums tracking-[-0.02em] ${
              negative ? "text-expense" : "text-text"
            }`}
          >
            {formatIDR(balance)}
          </p>
        </div>
        {negative ? (
          <Chip className="border-expense/25 bg-expense/10 text-expense">
            <ArrowDownRight size={11} strokeWidth={2} /> minus
          </Chip>
        ) : (
          <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-text-muted/70" />
        )}
      </div>
    </motion.button>
  );
}
