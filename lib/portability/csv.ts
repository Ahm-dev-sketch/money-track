import { db } from "@/lib/db/schema";

function escapeCsv(v: string | number): string {
  const s = String(v ?? "");
  if (/[",;\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

/** CSV dengan BOM UTF-8 agar karakter Indonesia terbaca benar di Excel. Nominal integer (bisa di-sum). */
export async function exportCSV(): Promise<string> {
  const txs = await db.transactions.orderBy("date").toArray();
  const cats = await db.categories.toArray();
  const wallets = await db.wallets.toArray();
  const catMap = new Map(cats.map((c) => [c.id, c.name]));
  const walMap = new Map(wallets.map((w) => [w.id, w.name]));

  const header = ["Tanggal", "Tipe", "Kategori", "Dompet", "Nominal", "Catatan"];
  const rows = txs.map((t) => {
    const type = t.type === "income" ? "Pemasukan" : t.type === "expense" ? "Pengeluaran" : "Transfer";
    const nominal = t.type === "expense" ? -t.amount : t.amount;
    return [
      t.date,
      type,
      t.categoryId ? catMap.get(t.categoryId) ?? "Transfer" : "Transfer",
      walMap.get(t.walletId) ?? "",
      nominal,
      t.note,
    ]
      .map(escapeCsv)
      .join(",");
  });

  return "\uFEFF" + [header.join(","), ...rows].join("\r\n");
}
