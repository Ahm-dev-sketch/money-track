"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";

/**
 * Wrapper aman-SSR untuk useLiveQuery.
 * IndexedDB tidak ada saat prerender/static-export; query baru dijalankan
 * setelah mount di klien (mounted → true memicu resubscribe via deps).
 */
export function useClientQuery<T>(
  querier: () => Promise<T>,
  deps: unknown[]
): T | undefined {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return useLiveQuery(
    () => (mounted ? querier() : Promise.resolve(undefined as unknown as T)),
    [...deps, mounted]
  );
}
