"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, Moon, Settings, Sun } from "lucide-react";
import Link from "next/link";
import { useThemeContext } from "@/components/theme-provider";
import { useInstallPrompt } from "@/lib/hooks/useInstallPrompt";

const brand = "Money Track";

export function Header() {
  const { theme, setTheme } = useThemeContext();
  const { canInstall, promptInstall } = useInstallPrompt();

  const toggleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark");
  };

  const iconButton =
    "grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-text-muted transition-colors hover:text-text active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-bg/90 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/75">
      <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between gap-3 px-4 md:max-w-3xl">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-[12.5px] font-bold tracking-[0.02em] text-on-primary">
            Rp
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[15px] font-semibold tracking-[-0.02em] text-text">{brand}</span>
            <span className="block truncate text-[11px] text-text-muted">Uangmu, jelas.</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          <AnimatePresence>
            {canInstall && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                type="button"
                onClick={() => void promptInstall()}
                className="mr-0.5 hidden h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-[12px] font-semibold text-on-primary transition-colors hover:bg-primary/90 active:scale-95 sm:flex"
              >
                <Download size={14} strokeWidth={2} />
                Pasang
              </motion.button>
            )}
          </AnimatePresence>

          <button
            type="button"
            aria-label={theme === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
            onClick={toggleTheme}
            className={iconButton}
          >
            <motion.span
              key={theme}
              initial={{ opacity: 0, rotate: -40, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="grid place-items-center"
            >
              {theme === "dark" ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
            </motion.span>
          </button>

          <Link href="/settings" aria-label="Pengaturan" className={iconButton}>
            <Settings size={17} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </header>
  );
}
