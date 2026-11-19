"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  LoaderCircle,
  Lock,
  Monitor,
  Moon,
  Share,
  Sun,
  Upload,
} from "lucide-react";
import { useThemeContext } from "@/components/theme-provider";
import { useCategories, useTransactions, useWallets } from "@/lib/hooks/useData";
import { useInstallPrompt } from "@/lib/hooks/useInstallPrompt";
import { exportCSV } from "@/lib/portability/csv";
import { exportJSON, importJSON } from "@/lib/portability/json";
import { parseExportPayload } from "@/lib/portability/validate";
import { PageContainer, PageHeader } from "@/components/ui/PageHeader";
import { Card, SectionTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { ThemePref } from "@/types";

type Status = { kind: "idle" } | { kind: "busy"; label: string } | { kind: "ok"; message: string } | { kind: "error"; message: string };

function downloadFile(name: string, data: string, mime: string) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function SettingsPage() {
  const { theme, setTheme } = useThemeContext();
  const { canInstall, isStandalone, promptInstall } = useInstallPrompt();
  const wallets = useWallets();
  const categories = useCategories();
  const transactions = useTransactions();

  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const totalTx = transactions?.length;

  const runExportCsv = async () => {
    setStatus({ kind: "busy", label: "Menyiapkan CSV…" });
    try {
      const csv = await exportCSV();
      downloadFile(`money-track-${stamp()}.csv`, csv, "text/csv;charset=utf-8");
      setStatus({ kind: "ok", message: "CSV berhasil diunduh." });
    } catch {
      setStatus({ kind: "error", message: "Gagal mengekspor CSV." });
    }
  };

  const runExportJson = async () => {
    setStatus({ kind: "busy", label: "Menyiapkan backup…" });
    try {
      const payload = await exportJSON();
      downloadFile(`money-track-backup-${stamp()}.json`, JSON.stringify(payload, null, 2), "application/json");
      setStatus({ kind: "ok", message: "Backup JSON berhasil diunduh." });
    } catch {
      setStatus({ kind: "error", message: "Gagal membuat backup." });
    }
  };

  const runImport = async (file: File) => {
    setStatus({ kind: "busy", label: "Memvalidasi file…" });
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const payload = parseExportPayload(parsed);
      await importJSON(payload);
      setStatus({
        kind: "ok",
        message: `Import selesai: ${payload.transactions.length} transaksi, ${payload.wallets.length} dompet.`,
      });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? `Import gagal: ${err.message}` : "File tidak valid.",
      });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const busy = status.kind === "busy";

  return (
    <PageContainer className="space-y-6">
      <PageHeader title="Pengaturan" subtitle="Tema, cadangan data, dan aplikasi" />

      <section>
        <SectionTitle icon={Sun}>Tampilan</SectionTitle>
        <Card className="space-y-3">
          <SegmentedControl
            options={[
              { value: "light" as ThemePref, label: "Terang" },
              { value: "dark" as ThemePref, label: "Gelap" },
              { value: "system" as ThemePref, label: "Sistem" },
            ]}
            value={theme}
            onChange={setTheme}
            layoutId="settings-theme"
          />
          <div className="flex items-center gap-2 text-[12px] text-text-muted">
            {theme === "light" && <Sun size={14} strokeWidth={2} />}
            {theme === "dark" && <Moon size={14} strokeWidth={2} />}
            {theme === "system" && <Monitor size={14} strokeWidth={2} />}
            <span>
              {theme === "light" && "Selalu menggunakan mode terang."}
              {theme === "dark" && "Selalu menggunakan mode gelap."}
              {theme === "system" && "Mengikuti pengaturan perangkat."}
            </span>
          </div>
        </Card>
      </section>

      <section>
        <SectionTitle icon={Database} right={<span className="text-[11px] font-medium text-text-muted">100% lokal</span>}>
          Data &amp; Cadangan
        </SectionTitle>
        <Card className="space-y-1 p-1.5">
          <div className="flex items-center justify-between px-2.5 py-2 text-[12px] text-text-muted">
            <span className="flex items-center gap-1.5">
              <Database size={13} strokeWidth={2} />
              {totalTx ?? "…"} transaksi · {wallets?.length ?? "…"} dompet · {categories?.length ?? "…"} kategori
            </span>
          </div>

          <ActionRow
            icon={<FileSpreadsheet size={18} strokeWidth={2} />}
            title="Ekspor CSV"
            description="Untuk dibuka di Excel / Sheets."
            onClick={() => void runExportCsv()}
            disabled={busy}
          />
          <ActionRow
            icon={<FileJson size={18} strokeWidth={2} />}
            title="Ekspor JSON"
            description="Backup lengkap semua data."
            onClick={() => void runExportJson()}
            disabled={busy}
          />
          <ActionRow
            icon={<Upload size={18} strokeWidth={2} />}
            title="Import JSON"
            description="Gabung backup tanpa duplikasi."
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          />
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void runImport(f);
            }}
          />
        </Card>

        <div className="min-h-[34px] pt-2">
          {status.kind !== "idle" && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              role={status.kind === "error" ? "alert" : "status"}
              aria-live="polite"
              className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-[12px] font-medium ${
                status.kind === "error"
                  ? "border-expense/25 bg-expense/10 text-expense"
                  : status.kind === "ok"
                    ? "border-income/25 bg-income/10 text-income"
                    : "border-line bg-surface-2 text-text-muted"
              }`}
            >
              {status.kind === "busy" && <LoaderCircle size={14} className="mt-0.5 shrink-0 animate-spin" strokeWidth={2} />}
              {status.kind === "ok" && <Check size={14} className="mt-0.5 shrink-0" strokeWidth={2} />}
              <span>{status.kind === "busy" ? status.label : status.message}</span>
            </motion.div>
          )}
        </div>
      </section>

      <section>
        <SectionTitle icon={Download}>Aplikasi</SectionTitle>
        <Card className="space-y-3">
          {isStandalone ? (
            <p className="flex items-center gap-2 text-[12.5px] font-medium text-income">
              <Check size={15} strokeWidth={2} /> Aplikasi sudah terpasang di perangkat ini.
            </p>
          ) : canInstall ? (
            <Button fullWidth onClick={() => void promptInstall()} leftIcon={<Download size={16} strokeWidth={2} />}>
              Pasang Money Track
            </Button>
          ) : (
            <div className="space-y-1.5 text-[12px] leading-relaxed text-text-muted">
              <p className="flex items-center gap-1.5 font-semibold text-text">
                <Share size={13} strokeWidth={2} /> Tambah ke layar utama
              </p>
              <p>Di iOS: ketuk ikon Share di Safari, lalu “Add to Home Screen”. Di desktop: pakai ikon install pada address bar.</p>
            </div>
          )}
        </Card>
      </section>

      <section>
        <SectionTitle icon={Lock}>Tentang</SectionTitle>
        <Card>
          <p className="text-[12.5px] leading-relaxed text-text-muted">
            <span className="font-semibold text-text">Data 100% lokal.</span> Transaksi, dompet, dan pengaturan disimpan
            di IndexedDB perangkat ini dan tidak dikirim ke server mana pun. Aplikasi tetap berjalan offline. Tanpa
            sinkronisasi cloud, buat <span className="font-semibold text-text">backup JSON</span> sebelum menghapus data
            browser atau berganti perangkat.
          </p>
          <p className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[11px] text-text-muted">
            <span>Money Track</span>
            <span>v1.0 · Local-first PWA</span>
          </p>
        </Card>
      </section>
    </PageContainer>
  );
}

function ActionRow({
  icon,
  title,
  description,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-surface-2 active:scale-[0.99] disabled:opacity-50"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-primary">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-semibold text-text">{title}</span>
        <span className="block text-[11.5px] text-text-muted">{description}</span>
      </span>
      <ChevronRight size={16} strokeWidth={2} className="shrink-0 text-text-muted/70" />
    </button>
  );
}
