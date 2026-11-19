"use client";

import { useCallback, useMemo, useState } from "react";
import { getPeriodRange } from "@/lib/utils/date";
import type { DateRange, PeriodKey } from "@/types";

const CUSTOM_KEY = "mt.customRange";

function readCustom(): DateRange | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (!raw) return undefined;
    const p = JSON.parse(raw) as { from?: string; to?: string };
    if (typeof p.from === "string" && typeof p.to === "string") return { from: p.from, to: p.to };
  } catch {
    /* abaikan nilai korup */
  }
  return undefined;
}

/**
 * State filter periode per halaman (default "Bulan Ini", lihat PRD §4.1).
 * Rentang custom disimpan di localStorage agar tidak hilang saat pindah halaman.
 */
export function usePeriod(initial: PeriodKey = "month") {
  const [period, setPeriodKey] = useState<PeriodKey>(initial);
  const [custom, setCustom] = useState<DateRange | undefined>(undefined);

  const range = useMemo(() => getPeriodRange(period, custom), [period, custom]);

  const setPeriod = useCallback((next: PeriodKey, nextRange?: DateRange) => {
    setPeriodKey(next);
    if (next === "custom") {
      setCustom(nextRange ?? readCustom());
      if (nextRange) {
        try {
          localStorage.setItem(CUSTOM_KEY, JSON.stringify(nextRange));
        } catch {
          /* mode privat: abaikan */
        }
      }
    }
  }, []);

  return { period, range, setPeriod };
}
