export type TxType = "income" | "expense" | "transfer";
export type ThemePref = "light" | "dark" | "system";
export type PeriodKey = "today" | "week" | "month" | "custom";

export interface Transaction {
  id: string;
  type: TxType;
  /** Nominal positif integer Rupiah. Untuk transfer = nominal keluar. */
  amount: number;
  /** FK ke Category; null untuk transfer. */
  categoryId: string | null;
  /** FK ke Wallet sumber. */
  walletId: string;
  /** FK ke Wallet tujuan; hanya untuk transfer. */
  toWalletId: string | null;
  note: string;
  /** Local ISO datetime: YYYY-MM-DDTHH:mm:ss */
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  name: string;
  /** Nama icon Lucide (key). */
  icon: string;
  color: string;
  initialBalance: number;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
  order: number;
  isSystem: boolean;
}

export interface Setting {
  key: string;
  value: unknown;
}

export interface DateRange {
  from: string; // local ISO
  to: string; // local ISO
}

export interface TransactionInput {
  type: TxType;
  amount: number;
  categoryId: string | null;
  walletId: string;
  toWalletId?: string | null;
  note?: string;
  date?: string;
}

export interface TransactionFilter {
  from?: string;
  to?: string;
  type?: TxType;
  walletId?: string;
  categoryId?: string;
  search?: string;
}

export interface Summary {
  income: number;
  expense: number;
  net: number;
  burnRate: number;
}

export interface CategorySpending {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  total: number;
  percent: number;
}

export interface CashflowPoint {
  key: string;
  label: string;
  income: number;
  expense: number;
}

export interface WalletBalance {
  wallet: Wallet;
  balance: number;
}

export interface ExportPayload {
  version: 1;
  exportedAt: string;
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  settings: Setting[];
}
