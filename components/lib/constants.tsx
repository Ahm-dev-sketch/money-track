"use client";

import type { Wallet } from "@/types";

/**
 * Palet aksen bersama: nada bumi, sage, dan teal yang menyatu dengan warna
 * utama #0c382e. Semua nada sengaja muted (bukan neon) supaya kartu dan sheet
 * tetap netral.
 */
const TONE_RAMP = [
  "#B4553D", // Terracotta
  "#C97E62", // Clay
  "#0F766E", // Teal tua
  "#2F8A72", // Hijau pinus
  "#4E9B84", // Sage
  "#5B7A8C", // Biru slate
  "#8A6B7E", // Plum redup
  "#8A9490", // Slate netral
] as const;

/** Warna semantik untuk chart (selaras token --income / --expense). */
export const INCOME_COLOR = "#059669";
/** Coral lembut (bukan crimson neon) senada dengan teal utama. */
export const EXPENSE_COLOR = "#B04F45";

function hashKey(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 9973;
  return h;
}

/** Warna palet stabil untuk sebuah entitas (kategori/dompet). */
export function toneFor(key: string): string {
  return TONE_RAMP[hashKey(key) % TONE_RAMP.length];
}

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Warna kategori: pakai warna tersimpan bila valid, fallback palet untuk data lama. */
export function categoryTone(category: { id: string; color?: string }): string {
  const stored = category.color?.trim() ?? "";
  return HEX_COLOR.test(stored) ? stored : toneFor(category.id);
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

/** Ikon kategori (Lucide, tanpa emoji). */
export const CATEGORY_ICON_CHOICES = [
  "Utensils",
  "Coffee",
  "Car",
  "Fuel",
  "ShoppingBag",
  "Receipt",
  "Gamepad2",
  "HeartPulse",
  "GraduationCap",
  "Home",
  "Smartphone",
  "Gift",
  "TrendingUp",
  "Briefcase",
  "Plane",
  "MoreHorizontal",
] as const;

/** Warna kategori — palet muted yang selaras dengan teal. */
export const CATEGORY_COLOR_CHOICES = TONE_RAMP;

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
