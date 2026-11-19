import { db } from "./schema";
import { uuid } from "@/lib/utils/id";
import type { Category, Wallet } from "@/types";

const EXPENSE_CATEGORIES = [
  { name: "Makan & Minum", icon: "Utensils", color: "#B4553D" },
  { name: "Transportasi", icon: "Car", color: "#0F766E" },
  { name: "Tagihan", icon: "Receipt", color: "#C97E62" },
  { name: "Belanja", icon: "ShoppingBag", color: "#4E9B84" },
  { name: "Hiburan", icon: "Gamepad2", color: "#2F8A72" },
  { name: "Lainnya", icon: "MoreHorizontal", color: "#8A9490" },
];

const INCOME_CATEGORIES = [
  { name: "Gaji", icon: "Briefcase", color: "#0F766E" },
  { name: "Freelance", icon: "Laptop", color: "#2F8A72" },
  { name: "Investasi", icon: "TrendingUp", color: "#3D7F6C" },
  { name: "Hadiah", icon: "Gift", color: "#4E9B84" },
  { name: "Lainnya", icon: "MoreHorizontal", color: "#8A9490" },
];

const DEFAULT_WALLETS = [
  { name: "Tunai", icon: "Wallet", color: "#0F766E" },
  { name: "Rekening Bank", icon: "Landmark", color: "#3D7F6C" },
  { name: "E-Wallet", icon: "Smartphone", color: "#B4553D" },
];

/** Idempotent: hanya seed jika tabel masih kosong. */
export async function ensureSeed(): Promise<void> {
  if ((await db.categories.count()) === 0) {
    const cats: Category[] = [];
    EXPENSE_CATEGORIES.forEach((c, i) =>
      cats.push({ id: uuid(), ...c, type: "expense", order: i, isSystem: true })
    );
    INCOME_CATEGORIES.forEach((c, i) =>
      cats.push({ id: uuid(), ...c, type: "income", order: i, isSystem: true })
    );
    await db.categories.bulkAdd(cats);
  }

  if ((await db.wallets.count()) === 0) {
    const wallets: Wallet[] = DEFAULT_WALLETS.map((w, i) => ({
      id: uuid(),
      ...w,
      initialBalance: 0,
      order: i,
    }));
    await db.wallets.bulkAdd(wallets);
  }
}
