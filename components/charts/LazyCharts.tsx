"use client";

import dynamic from "next/dynamic";
import type { CategorySpending, CashflowPoint } from "@/types";

interface DonutProps {
  data: CategorySpending[] | undefined;
  className?: string;
  height?: number;
}

interface CashflowProps {
  data: CashflowPoint[] | undefined;
  height?: number;
  className?: string;
}

/**
 * Recharts itu berat (~1.2 MB chunk). Load on-demand (ssr:false) supaya tidak
 * masuk initial bundle halaman mana pun; wrapper memesan tinggi (minHeight)
 * agar tidak terjadi Layout Shift saat chunk dimuat. Komponen asli tetap
 * menampilkan skeleton sendiri selama data belum tersedia.
 */
const LazyDonut = dynamic(
  () => import("./CategoryDonut").then((m) => m.CategoryDonut),
  { ssr: false }
);

const LazyCashflow = dynamic(
  () => import("./CashflowChart").then((m) => m.CashflowChart),
  { ssr: false }
);

export function CategoryDonut(props: DonutProps) {
  return (
    <div className={props.className} style={{ minHeight: props.height ?? 196 }}>
      <LazyDonut {...props} />
    </div>
  );
}

export function CashflowChart(props: CashflowProps) {
  return (
    <div className={props.className} style={{ minHeight: props.height ?? 240 }}>
      <LazyCashflow {...props} />
    </div>
  );
}
