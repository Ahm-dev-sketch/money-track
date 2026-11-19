import { db } from "@/lib/db/schema";
import type { ExportPayload } from "@/types";

export async function exportJSON(): Promise<ExportPayload> {
  const [transactions, wallets, categories, settings] = await Promise.all([
    db.transactions.toArray(),
    db.wallets.toArray(),
    db.categories.toArray(),
    db.settings.toArray(),
  ]);
  return { version: 1, exportedAt: new Date().toISOString(), transactions, wallets, categories, settings };
}

/** Upsert by id — idempotent, tidak menduplikasi saat import berulang. */
export async function importJSON(payload: ExportPayload): Promise<void> {
  await db.transaction(
    "rw",
    db.transactions,
    db.wallets,
    db.categories,
    db.settings,
    async () => {
      for (const t of payload.transactions) await db.transactions.put(t);
      for (const w of payload.wallets) await db.wallets.put(w);
      for (const c of payload.categories) await db.categories.put(c);
      for (const s of payload.settings) await db.settings.put(s);
    }
  );
}
