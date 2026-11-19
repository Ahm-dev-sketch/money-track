"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return (
    <AnimatePresence initial={false}>
      {offline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2 text-[12px] font-medium text-text-muted">
            <WifiOff size={14} strokeWidth={2} className="shrink-0 text-warning" />
            <span>Anda sedang offline — data tetap tersimpan lokal.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
