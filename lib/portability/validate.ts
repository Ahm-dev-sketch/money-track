import type { ExportPayload } from "@/types";

export function parseExportPayload(raw: unknown): ExportPayload {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("File bukan objek JSON yang valid.");
  }
  const o = raw as Record<string, unknown>;
  if (o.version !== 1) {
    throw new Error("Versi backup tidak didukung.");
  }
  for (const key of ["transactions", "wallets", "categories", "settings"] as const) {
    if (!Array.isArray(o[key])) {
      throw new Error(`Field "${key}" harus berupa array.`);
    }
  }
  return o as unknown as ExportPayload;
}
