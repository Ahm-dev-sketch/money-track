"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { isTopOverlay, popOverlay, pushOverlay } from "./overlayStack";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Konfirmasi ringkas di tengah layar (untuk aksi destruktif). */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  danger = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const token = Symbol("dialog");
    pushOverlay(token);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isTopOverlay(token)) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      popOverlay(token);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-5">
          <motion.div
            className="absolute inset-0 bg-[#0c382e]/40 dark:bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            className="card-shadow-lg relative z-10 w-full max-w-xs overflow-hidden rounded-[24px] border border-line/80 bg-surface p-5.5"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          >
            <div
              className={`mb-3 grid h-11 w-11 place-items-center rounded-xl ${
                danger ? "bg-expense/10 text-expense" : "bg-primary/10 text-primary"
              }`}
            >
              <TriangleAlert size={20} strokeWidth={2} />
            </div>
            <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-text">{title}</h3>
            {description && <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">{description}</p>}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-11 flex-1 rounded-full border border-line bg-surface text-sm font-semibold text-text transition-colors hover:bg-surface-2 active:scale-[0.98]"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`h-11 flex-1 rounded-full text-sm font-semibold transition-transform active:scale-[0.98] ${
                  danger ? "bg-expense text-on-primary" : "bg-primary text-on-primary"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
