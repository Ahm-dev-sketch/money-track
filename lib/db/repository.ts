import { db } from "./schema";
import type {
  Transaction,
  TransactionInput,
  TransactionFilter,
  Wallet,
  Category,
  Summary,
  CategorySpending,
  CashflowPoint,
} from "@/types";
import {
  nowLocalISO,
  toLocalISO,
  startOfDay,
  addDays,
  daysBetween,
  dayKey,
  monthKey,
  monthLabel,
  formatDateShort,
} from "@/lib/utils/date";
import { uuid } from "@/lib/utils/id";

function normalizeDate(d?: string): string {
  return d || nowLocalISO();
}

export async function addTransaction(input: TransactionInput): Promise<string> {
  const id = uuid();
  const now = nowLocalISO();
  const tx: Transaction = {
    id,
    type: input.type,
    amount: Math.round(Math.abs(input.amount)),
    categoryId: input.categoryId ?? null,
    walletId: input.walletId,
    toWalletId: input.type === "transfer" ? input.toWalletId ?? null : null,
    note: input.note?.trim() ?? "",
    date: normalizeDate(input.date),
    createdAt: now,
    updatedAt: now,
  };
  await db.transactions.add(tx);
  return id;
}

export async function updateTransaction(
  id: string,
  patch: Partial<TransactionInput>
): Promise<void> {
  const existing = await db.transactions.get(id);
  if (!existing) return;
  const next: Transaction = {
    ...existing,
    ...patch,
    amount: patch.amount != null ? Math.round(Math.abs(patch.amount)) : existing.amount,
    note: patch.note != null ? patch.note.trim() : existing.note,
    date: normalizeDate(patch.date ?? existing.date),
    categoryId: patch.categoryId !== undefined ? patch.categoryId : existing.categoryId,
    toWalletId: patch.type === "transfer" ? patch.toWalletId ?? null : existing.toWalletId,
    updatedAt: nowLocalISO(),
  };
  await db.transactions.put(next);
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.transactions.delete(id);
}

/**
 * Daftar transaksi, diurutkan tanggal menurun (terbaru dulu).
 * Rentang tanggal memakai indexed query `.where("date").between(...)` (bukan full-scan),
 * dan `limit` memangkas hasil lebih awal — penting saat data sudah ribuan baris.
 * Filter non-tanggal (type/wallet/category/search) tetap di-JS di atas hasil yang sudah tergerus.
 */
export async function listTransactions(
  filter: TransactionFilter = {},
  limit?: number
): Promise<Transaction[]> {
  const hasRange = filter.from != null || filter.to != null;
  const matches = (t: Transaction): boolean => {
    if (filter.type && t.type !== filter.type) return false;
    if (filter.walletId && t.walletId !== filter.walletId) return false;
    if (filter.categoryId && t.categoryId !== filter.categoryId) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!t.note.toLowerCase().includes(q)) return false;
    }
    return true;
  };

  let rows: Transaction[];
  if (hasRange) {
    const from = filter.from ?? "\u0000";
    const to = filter.to ?? "\uffff"; // ISO datetime: \uffff > semua tanggal ascii
    // between() mengembalikan urutan menaik; reverse untuk terbaru-dulu.
    rows = (await db.transactions.where("date").between(from, to, true, true).toArray()).reverse();
  } else {
    rows = await db.transactions.orderBy("date").reverse().toArray();
  }

  const out: Transaction[] = [];
  for (const t of rows) {
    if (!matches(t)) continue;
    out.push(t);
    if (limit != null && out.length >= limit) break;
  }
  return out;
}

/** Hitung total transaksi (pakai index count, tanpa memuat record ke memori). */
export async function countTransactions(): Promise<number> {
  return db.transactions.count();
}

export async function listWallets(): Promise<Wallet[]> {
  return db.wallets.orderBy("order").toArray();
}

export async function getWallet(id: string): Promise<Wallet | undefined> {
  return db.wallets.get(id);
}

export async function addWallet(input: {
  name: string;
  icon: string;
  color: string;
  initialBalance?: number;
}): Promise<string> {
  const id = uuid();
  const order = await db.wallets.count();
  await db.wallets.add({
    id,
    name: input.name,
    icon: input.icon,
    color: input.color,
    initialBalance: Math.round(input.initialBalance ?? 0),
    order,
  });
  return id;
}

export async function updateWallet(
  id: string,
  patch: Partial<Omit<Wallet, "id">>
): Promise<void> {
  const existing = await db.wallets.get(id);
  if (!existing) return;
  await db.wallets.put({ ...existing, ...patch, id });
}

export async function deleteWallet(id: string): Promise<void> {
  await db.wallets.delete(id);
}

export async function listCategories(): Promise<Category[]> {
  return db.categories.orderBy("order").toArray();
}

export async function getCategory(id: string): Promise<Category | undefined> {
  return db.categories.get(id);
}

export async function addCategory(input: {
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
}): Promise<string> {
  const id = uuid();
  const order = await db.categories.where("type").equals(input.type).count();
  await db.categories.add({ id, ...input, order, isSystem: false });
  return id;
}

export async function updateCategory(
  id: string,
  patch: Partial<Pick<Category, "name" | "icon" | "color" | "type">>
): Promise<void> {
  const existing = await db.categories.get(id);
  if (!existing) return;
  const next: Category = { ...existing, ...patch, id };
  // Pindah grup tipe (expense <-> income) → letakkan di akhir grup baru.
  if (patch.type && patch.type !== existing.type) {
    next.order = await db.categories.where("type").equals(patch.type).count();
  }
  await db.categories.put(next);
}

export async function deleteCategory(id: string): Promise<void> {
  const existing = await db.categories.get(id);
  if (!existing) return;
  if (existing.isSystem) {
    throw new Error("Kategori bawaan tidak dapat dihapus.");
  }
  await db.categories.delete(id);
}

/** Jumlah transaksi yang merujuk wallet (sebagai sumber ataupun tujuan transfer). */
export async function countTransactionsByWallet(walletId: string): Promise<number> {
  const [outgoing, incoming] = await Promise.all([
    db.transactions.where("walletId").equals(walletId).count(),
    db.transactions.where("toWalletId").equals(walletId).count(),
  ]);
  return outgoing + incoming;
}

/** Jumlah transaksi yang memakai kategori tertentu. */
export async function countTransactionsByCategory(categoryId: string): Promise<number> {
  return db.transactions.where("categoryId").equals(categoryId).count();
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const s = await db.settings.get(key);
  return (s?.value as T) ?? fallback;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await db.settings.put({ key, value });
}

/** Saldo dompet = initialBalance + income − expense − transfer keluar + transfer masuk. */
export async function getWalletBalance(walletId: string, until?: string): Promise<number> {
  const wallet = await db.wallets.get(walletId);
  if (!wallet) return 0;
  let balance = wallet.initialBalance;

  const within = (tx: Transaction) => !until || tx.date <= until;

  const outgoing = await db.transactions.where("walletId").equals(walletId).toArray();
  for (const t of outgoing) {
    if (!within(t)) continue;
    if (t.type === "income") balance += t.amount;
    else balance -= t.amount; // expense & transfer keluar
  }

  const incoming = await db.transactions.where("toWalletId").equals(walletId).toArray();
  for (const t of incoming) {
    if (!within(t)) continue;
    if (t.type === "transfer") balance += t.amount;
  }

  return balance;
}

/** Ringkasan finansial periode. Transfer dikecualikan (netral). */
export async function computeSummary(from: string, to: string): Promise<Summary> {
  const txs = await db.transactions.where("date").between(from, to, true, true).toArray();
  let income = 0;
  let expense = 0;
  for (const t of txs) {
    if (t.type === "income") income += t.amount;
    else if (t.type === "expense") expense += t.amount;
  }
  const days = daysBetween(new Date(from), new Date(to));
  return { income, expense, net: income - expense, burnRate: expense / days };
}

export async function getCategorySpending(
  from: string,
  to: string
): Promise<CategorySpending[]> {
  const txs = await db.transactions.where("date").between(from, to, true, true).toArray();
  const cats = await db.categories.toArray();
  const catMap = new Map(cats.map((c) => [c.id, c]));

  const totals = new Map<string, number>();
  let total = 0;
  for (const t of txs) {
    if (t.type !== "expense" || !t.categoryId) continue;
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount);
    total += t.amount;
  }

  const out: CategorySpending[] = [];
  for (const [catId, sum] of totals) {
    const c = catMap.get(catId);
    if (!c) continue;
    out.push({
      categoryId: catId,
      name: c.name,
      icon: c.icon,
      color: c.color,
      total: sum,
      percent: total ? sum / total : 0,
    });
  }
  out.sort((a, b) => b.total - a.total);
  return out;
}

export async function getCashflowSeries(
  from: string,
  to: string,
  bucket: "day" | "month"
): Promise<CashflowPoint[]> {
  const txs = await db.transactions.where("date").between(from, to, true, true).toArray();

  const map = new Map<string, CashflowPoint>();
  for (const t of txs) {
    if (t.type === "transfer") continue;
    const k = bucket === "day" ? dayKey(t.date) : monthKey(t.date);
    let p = map.get(k);
    if (!p) {
      p = {
        key: k,
        label: bucket === "day" ? formatDateShort(t.date) : monthLabel(t.date),
        income: 0,
        expense: 0,
      };
      map.set(k, p);
    }
    if (t.type === "income") p.income += t.amount;
    else p.expense += t.amount;
  }

  const points: CashflowPoint[] = [];
  if (bucket === "day") {
    let d = startOfDay(new Date(from));
    const end = startOfDay(new Date(to));
    while (d.getTime() <= end.getTime()) {
      const iso = toLocalISO(d);
      const k = dayKey(iso);
      points.push(map.get(k) ?? { key: k, label: formatDateShort(iso), income: 0, expense: 0 });
      d = addDays(d, 1);
    }
  } else {
    let d = new Date(new Date(from).getFullYear(), new Date(from).getMonth(), 1);
    const end = new Date(new Date(to).getFullYear(), new Date(to).getMonth(), 1);
    while (d.getTime() <= end.getTime()) {
      const iso = toLocalISO(d);
      const k = monthKey(iso);
      points.push(map.get(k) ?? { key: k, label: monthLabel(iso), income: 0, expense: 0 });
      d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    }
  }
  return points;
}
