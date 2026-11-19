"use client";

import { useEffect, useState } from "react";
import { useClientQuery } from "./useClientQuery";
import { db } from "@/lib/db/schema";
import { ensureSeed } from "@/lib/db/seed";
import {
  listTransactions,
  listWallets,
  listCategories,
  getWalletBalance,
  computeSummary,
  getCategorySpending,
  getCashflowSeries,
  getSetting,
} from "@/lib/db/repository";
import type {
  Transaction,
  TransactionFilter,
  Wallet,
  Category,
  Summary,
  CategorySpending,
  CashflowPoint,
  WalletBalance,
  DateRange,
} from "@/types";

export function useBootstrap(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    ensureSeed().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return ready;
}

export function useWallets(): Wallet[] | undefined {
  return useClientQuery(() => listWallets(), []);
}

export function useCategories(): Category[] | undefined {
  return useClientQuery(() => listCategories(), []);
}

export function useTransactions(filter: TransactionFilter = {}): Transaction[] | undefined {
  return useClientQuery(
    () => listTransactions(filter),
    [filter.from, filter.to, filter.type, filter.walletId, filter.categoryId, filter.search]
  );
}

export function useSummary(range: DateRange): Summary | undefined {
  return useClientQuery(() => computeSummary(range.from, range.to), [range.from, range.to]);
}

export function useCategorySpending(range: DateRange): CategorySpending[] | undefined {
  return useClientQuery(
    () => getCategorySpending(range.from, range.to),
    [range.from, range.to]
  );
}

export function useCashflow(
  range: DateRange,
  bucket: "day" | "month"
): CashflowPoint[] | undefined {
  return useClientQuery(
    () => getCashflowSeries(range.from, range.to, bucket),
    [range.from, range.to, bucket]
  );
}

export function useWalletBalances(wallets: Wallet[] | undefined): WalletBalance[] | undefined {
  return useClientQuery(async () => {
    if (!wallets) return undefined;
    const out: WalletBalance[] = [];
    for (const w of wallets) {
      out.push({ wallet: w, balance: await getWalletBalance(w.id) });
    }
    return out;
  }, [wallets]);
}

export function useSetting<T>(key: string, fallback: T): T | undefined {
  return useClientQuery(() => getSetting(key, fallback), [key, fallback]);
}
