"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share, X } from "lucide-react";
import { useInstallPrompt } from "@/lib/hooks/useInstallPrompt";

const DISMISS_KEY = "mt.installDismissed";

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function isIosDevice(): boolean {
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && "ontouchend" in document);
}

/** Kartu ajakan pasang aplikasi (sekali, bisa ditutup permanen). */
export function InstallPrompt() {
  const { canInstall, isStandalone, promptInstall } = useInstallPrompt();
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    // Dibaca di klien setelah mount agar prerender tidak terpengaruh.
    const t = window.setTimeout(() => {
      setIos(isIosDevice());
      setDismissed(readDismissed());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const close = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* mode privat: abaikan */
    }
  };

  const show = ready && !dismissed && !isStandalone && (canInstall || ios);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="fixed inset-x-0 bottom-[calc(132px+env(safe-area-inset-bottom))] z-30 mx-auto w-full max-w-md px-4 md:max-w-3xl"
        >
          <div className="card-shadow-lg relative flex items-center gap-3 rounded-[22px] border border-line/80 bg-surface p-3.5 pr-9">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
              {ios && !canInstall ? <Share size={18} strokeWidth={2} /> : <Download size={18} strokeWidth={2} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-text">Pasang Money Track</p>
              <p className="text-[11.5px] leading-snug text-text-muted">
                {ios && !canInstall
                  ? "Ketuk Share, lalu “Add to Home Screen”."
                  : "Akses instan dari layar utama, tetap jalan offline."}
              </p>
            </div>
            {canInstall && (
              <button
                type="button"
                onClick={() => void promptInstall()}
                className="h-9 shrink-0 rounded-full bg-[#0c382e] dark:bg-emerald-600 px-3.5 text-[12.5px] font-semibold text-white transition-transform active:scale-95 shadow-xs"
              >
                Pasang
              </button>
            )}
            <button
              type="button"
              onClick={close}
              aria-label="Tutup ajakan pasang"
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
