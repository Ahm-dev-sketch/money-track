"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export function Fab({ onClick }: { onClick: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
      <div className="relative w-full max-w-md px-4 md:max-w-3xl">
        <div className="absolute bottom-[calc(60px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2">
          <motion.button
            type="button"
            onClick={onClick}
            aria-label="Catat transaksi baru"
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="pointer-events-auto grid h-14 w-14 place-items-center rounded-full bg-[#0c382e] dark:bg-emerald-600 text-white shadow-[0_8px_24px_-6px_rgba(12,56,46,0.5)] ring-4 ring-bg focus-visible:outline-none focus-visible:ring-primary/40 active:opacity-95"
          >
            <Plus size={26} strokeWidth={2.4} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
