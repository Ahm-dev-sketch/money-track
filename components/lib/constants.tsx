"use client";

import type { Wallet } from "@/types";

/**
 * Warna tampilan diturunkan dari satu keluarga nada (teal → terracotta → netral)
 * yang terbaca di tema terang maupun gelap. Data tersimpan tidak diubah.
 */
const TONE_RAMP = [
  "#0F766E",
  "#2F8A72",
  "#4E9B84",
  "#3D7F6C",
  "#B4553D",
  "#C97E62",
  "#8A9490",
  "#6E837E",
] as const;

/** Warna semantik untuk chart (selaras token --income / --expense). */
export const INCOME_COLOR = "#0F766E";
export const EXPENSE_COLOR = "#B4553D";

function hashKey(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 9973;
  return h;
}

/** Warna palet stabil untuk sebuah entitas (kategori/dompet). */
export function toneFor(key: string): string {
  return TONE_RAMP[hashKey(key) % TONE_RAMP.length];
}

/** Warna teks yang terbaca di atas isian warna solid. */
export function inkFor(color: string): string {
  const hex = color.replace("#", "");
  if (hex.length < 6) return "#ffffff";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62 ? "#002222" : "#ffffff";
}

/** Ikon yang bisa dipilih untuk dompet. */
export const WALLET_ICON_CHOICES = [
  "Wallet",
  "Landmark",
  "Smartphone",
  "Banknote",
  "CreditCard",
  "PiggyBank",
  "Coins",
  "Bitcoin",
] as const;

/** Pilihan warna dompet — semua dari keluarga palet. */
export const WALLET_COLOR_CHOICES = TONE_RAMP;

/** Warna tampil dompet: pakai pilihan tersimpan bila masih dalam palet, else fallback deterministik. */
export function walletTone(wallet: { id: string; color: string }): string {
  return (WALLET_COLOR_CHOICES as readonly string[]).includes(wallet.color)
    ? wallet.color
    : toneFor(wallet.id);
}

/** Ikon netral untuk konteks transfer. */
export const TRANSFER_ICON = "ArrowLeftRight";
export const TRANSFER_COLOR = "#54706B";

/** "2026-11-18" -> "2026-11-18T07:30:00" (tanggal hari ini saat diedit tetap pakai jam sekarang). */
export function dateKeyToISO(dateKey: string, base?: string): string {
  const time = base ? base.slice(11, 19) : new Date().toTimeString().slice(0, 8);
  return `${dateKey}T${time || "00:00:00"}`;
}

/** Ambil default wallet tersimpan, fallback ke wallet pertama. */
export function defaultWalletId(
  wallets: Wallet[] | undefined,
  lastWalletId?: string
): string {
  if (!wallets || wallets.length === 0) return "";
  if (lastWalletId && wallets.some((w) => w.id === lastWalletId)) return lastWalletId;
  return wallets[0].id;
}
