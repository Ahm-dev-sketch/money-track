"use client";

import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Aksi di kanan judul (misal tombol hapus). */
  action?: ReactNode;
  /** max-w kelas untuk tampilan desktop. */
  widthClass?: string;
}

export function BottomSheet({ open, onClose, title, subtitle, children, action, widthClass = "max-w-md" }: BottomSheetProps) {
  const titleId = useId();
  const dragControls = useDragControls();
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollLockPrev = useRef<string>("");

  useEffect(() => {
    if (!open) return;
    scrollLockPrev.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = scrollLockPrev.current;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            key="backdrop"
            className="absolute inset-0 bg-[#0c382e]/35 dark:bg-black/65 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={`relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[32px] border border-line/80 bg-surface shadow-sheet sm:mb-6 sm:rounded-[32px] ${widthClass}`}
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.4 }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.02, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 700) onClose();
            }}
          >
            <div
              className="flex cursor-grab touch-none justify-center pt-3 pb-1.5 active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <span className="h-1.5 w-11 rounded-full bg-line/90" />
            </div>

            {(title || action) && (
              <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-1">
                <div className="min-w-0">
                  {title && (
                    <h2 id={titleId} className="truncate text-[18px] font-bold tracking-tight text-text">
                      {title}
                    </h2>
                  )}
                  {subtitle && <p className="mt-0.5 text-[12.5px] font-medium text-text-muted">{subtitle}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {action}
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Tutup"
                    className="grid h-9 w-9 place-items-center rounded-full text-text-muted transition-colors hover:bg-surface-2 hover:text-text active:scale-95"
                  >
                    <X size={18} strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(20px,env(safe-area-inset-bottom))]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
