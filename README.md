# Money Track

Pelacak pemasukan & pengeluaran harian — **local-first PWA**, offline-first, privasi penuh (data tersimpan di perangkat, bukan di server).

## Fitur

- **Dashboard** — saldo bersih, pemasukan, pengeluaran, daily burn rate + filter periode.
- **Analitik** — donut kategori, cashflow bar/area, top spending (Recharts).
- **Catat cepat** — bottom sheet 3-tap, multi-dompet + transfer antar dompet.
- **Riwayat** — filter / edit / hapus transaksi.
- **Backup** — export/import CSV & JSON (idempoten).
- **PWA** — offline-first, installable, Service Worker (serwist).

## Stack

- Next.js (App Router + Static Export) · Tailwind CSS v4 · TypeScript
- Dexie.js (IndexedDB) · Recharts · Framer Motion · Lucide (ikon, bukan emoji)
- `@serwist/turbopack` untuk Service Worker (bukan `@ducanh2912/next-pwa`)

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export ke out/
npm run preview    # pratinjau hasil build
```

## Deploy

Output statis (`output: "export"`) — deploy ke **Vercel** atau **Cloudflare Pages**:

- **Vercel:** atur *Framework Preset* = Next.js, *Build Command* = `npm run build`, *Output Directory* = `out`.
- **Cloudflare Pages:** *Build Command* = `npm run build`, *Output Directory* = `out`.

## Struktur

- `lib/db/` — skema Dexie, seed, repository (data layer, local-first)
- `lib/hooks/` — `useData`, `useTheme`, `useInstallPrompt`, `useClientQuery`
- `lib/utils/` — format IDR, tanggal, id; `lib/portability/` — CSV/JSON
- `components/` — UI (dashboard, charts, transaction, wallet, settings, layout)
- `app/` — halaman + manifest + Service Worker (serwist)

Spesifikasi lengkap: [`PRD.md`](./PRD.md).
