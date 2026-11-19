import type { DateRange, PeriodKey } from "@/types";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Local ISO: YYYY-MM-DDTHH:mm:ss (tanpa timezone, konsisten utk perbandingan string). */
export function toLocalISO(d: Date): string {
  return `${toDateKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function nowLocalISO(): string {
  return toLocalISO(new Date());
}

export function todayDateKey(): string {
  return toDateKey(new Date());
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/** Senin sebagai awal minggu. */
export function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 = Minggu
  const diff = day === 0 ? 6 : day - 1;
  x.setDate(x.getDate() - diff);
  return x;
}

export function startOfMonth(d: Date): Date {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function daysBetween(from: Date, to: Date): number {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

/** Rentang "periode berjalan" (dari awal periode sampai sekarang). */
export function getPeriodRange(period: PeriodKey, custom?: DateRange, now = new Date()): DateRange {
  if (period === "custom" && custom) return custom;
  if (period === "today") {
    return { from: toLocalISO(startOfDay(now)), to: toLocalISO(endOfDay(now)) };
  }
  if (period === "week") {
    return { from: toLocalISO(startOfWeek(now)), to: toLocalISO(endOfDay(now)) };
  }
  return { from: toLocalISO(startOfMonth(now)), to: toLocalISO(endOfDay(now)) };
}

export function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function formatDateMedium(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function monthLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
}

export function dayKey(iso: string): string {
  return iso.slice(0, 10);
}
