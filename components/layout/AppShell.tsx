"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useBootstrap, useWallets, useSetting } from "@/lib/hooks/useData";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { Fab } from "./Fab";
import { OfflineBanner } from "./OfflineBanner";
import { InstallPrompt } from "./InstallPrompt";
import { TransactionLogger } from "@/components/transaction/TransactionLogger";

/** Nama event global untuk membuka sheet "Catat transaksi" dari komponen mana pun. */
export const OPEN_LOGGER_EVENT = "mt:open-logger";

export function openLogger() {
  window.dispatchEvent(new CustomEvent(OPEN_LOGGER_EVENT));
}

export function LoadingScreen() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-3">
      <div className="relative h-10 w-10">
        <span className="absolute inset-0 rounded-full border-2 border-line" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
      </div>
      <p className="text-[12.5px] font-medium text-text-muted">Menyiapkan data lokal…</p>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const ready = useBootstrap();
  const wallets = useWallets();
  const lastWalletId = useSetting<string>("lastWalletId", "");
  const [loggerOpen, setLoggerOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setLoggerOpen(true);
    window.addEventListener(OPEN_LOGGER_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_LOGGER_EVENT, onOpen);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <OfflineBanner />
      <Header />

      <main className="flex-1 pb-40 pt-5">{ready ? children : <LoadingScreen />}</main>

      <InstallPrompt />
      <BottomNav />
      <Fab onClick={() => setLoggerOpen(true)} />

      <TransactionLogger
        open={loggerOpen}
        onClose={() => setLoggerOpen(false)}
        wallets={wallets ?? []}
        defaultWalletId={lastWalletId || undefined}
      />
    </div>
  );
}
