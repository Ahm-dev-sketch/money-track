import Dexie, { type Table } from "dexie";
import type { Transaction, Wallet, Category, Setting } from "@/types";

export class MoneyTrackDB extends Dexie {
  transactions!: Table<Transaction, string>;
  wallets!: Table<Wallet, string>;
  categories!: Table<Category, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super("money-track-db");
    this.version(1).stores({
      transactions:
        "id, date, type, walletId, toWalletId, categoryId, [date+type], [walletId+date]",
      wallets: "id, name, order",
      categories: "id, type, order",
      settings: "key",
    });
  }
}

let _db: MoneyTrackDB | null = null;

/** Lazy singleton. `new Dexie()` is safe in Node (no indexedDB access until open). */
export function getDb(): MoneyTrackDB {
  if (!_db) _db = new MoneyTrackDB();
  return _db;
}

export const db = getDb();
