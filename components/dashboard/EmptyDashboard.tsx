"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Database, X } from "lucide-react";
import { formatIDR } from "@/lib/utils/format";
import type { Wallet } from "@/types";

const STEPS = [
  { icon: Check, title: "Catat dalam 3 ketukan", body: "Nominal, kategori, selesai. Tanpa login, tanpa menunggu." },
  { icon: Database, title: "Data 100% lokal", body: "Tersimpan di perangkatmu lewat IndexedDB, tetap jalan offline." },
];

/** Layar sambutan singkat saat data masih kosong. */
export function EmptyDashboard({ wallet, onStart }: { wallet?: Wallet; onStart: () => void }) {
  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="hero-shadow relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0c382e] via-[#0a3128] to-[#07241d] p-6 text-white"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10">
          <p className="text-[11.5px] font-semibold uppercase tracking-wider text-emerald-200/80">Mulai dari sini</p>
          <h2 className="mt-2 text-[24px] font-bold leading-tight tracking-tight text-white">
            Catat pengeluaran pertamamu
          </h2>
          <p className="mt-2 max-w-[34ch] text-[13px] leading-relaxed text-emerald-100/75">
            Ringkasan, grafik, dan saldo terisi otomatis setelah transaksi pertama.
          </p>

          <button
            type="button"
            onClick={onStart}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[14px] font-bold text-[#0c382e] shadow-sm transition-transform active:scale-[0.98]"
          >
            Catat transaksi pertama <ArrowRight size={16} strokeWidth={2.4} />
          </button>

          {wallet && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px] text-emerald-200/70">
              Saldo awal {wallet.name}:{" "}
              <span className="font-semibold text-white">{formatIDR(wallet.initialBalance)}</span>
            </p>
          )}
        </div>
      </motion.div>

      <ul className="grid gap-2.5">
        {STEPS.map((s, i) => (
          <motion.li
            key={s.title}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + i * 0.07, duration: 0.35 }}
            className="card-shadow flex items-start gap-3 rounded-[22px] border border-line/80 bg-surface p-4"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
              <s.icon size={16} strokeWidth={2.2} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13.5px] font-semibold text-text">{s.title}</span>
              <span className="mt-0.5 block text-[12px] leading-relaxed text-text-muted">{s.body}</span>
            </span>
          </motion.li>
        ))}
      </ul>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-text-muted"
      >
        <X size={11} strokeWidth={2} /> Tidak ada iklan, tidak ada pelacakan.
      </motion.p>
    </div>
  );
}
