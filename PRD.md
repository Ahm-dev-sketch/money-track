# PRD — Personal Expense & Income Tracker (PWA, Local-First)

**Dokumen:** Product Requirements Document (developer-ready)
**Status:** Final / Siap Eksekusi
**Versi:** 1.0.0
**Platform:** Progressive Web App (PWA) — Web, Mobile-First
**Target Deploy:** Vercel / Cloudflare Pages (Static Export)

---

## Daftar Isi
1. [Executive Summary & User Persona](#1-executive-summary--user-persona)
2. [Design System & UI/UX Reference Blueprint](#2-design-system--uiux-reference-blueprint)
3. [Database Schema (Dexie.js / IndexedDB)](#3-database-schema-dexiejs--indexeddb)
4. [Functional Requirements & User Stories](#4-functional-requirements--user-stories)
5. [PWA & Offline Architecture](#5-pwa--offline-architecture)
6. [Project Folder Structure](#6-project-folder-structure)
7. [Step-by-Step Implementation Roadmap](#7-step-by-step-implementation-roadmap)

---

## 1. Executive Summary & User Persona

### 1.1 Ringkasan Eksekutif

Aplikasi **Personal Expense & Income Tracker** adalah PWA yang membantu pengguna melacak aliran uang harian secara presisi dan instan — menjawab satu pertanyaan inti: **"uang habis ke mana?"**.

| Dimensi | Keputusan |
|---|---|
| **Model Autentikasi** | Zero-friction — tanpa login/registrasi. Pengguna langsung masuk ke aplikasi. |
| **Model Data** | Local-First — 100% tersimpan di browser via IndexedDB. Offline-first, instan, bebas biaya server (Rp 0). |
| **Prinsip Utama** | Kecepatan input (< 3 tap), kejelasan visual (uang langsung terlihat), dan privasi penuh (data milik pengguna). |
| **Biaya Operasional** | Rp 0 — tanpa backend, tanpa database server, tanpa autentikasi server. |
| **Risiko Utama** | Kehilangan data saat cache browser dihapus → dimitigasi dengan fitur Export/Import JSON & CSV. |

### 1.2 Tujuan & Non-Tujuan

**Tujuan (Goals):**
- Pengguna dapat mencatat transaksi pemasukan/pengeluaran dalam ≤ 3 detik.
- Pengguna melihat ringkasan saldo bersih, pemasukan, pengeluaran, dan *burn rate* secara langsung.
- Pengguna memahami distribusi pengeluaran per kategori (donut chart) dan tren arus kas (cashflow chart).
- Berjalan penuh tanpa koneksi internet (offline-first).

**Non-Tujuan (Non-Goals, v1):**
- Multi-user / sinkronisasi cloud / kolaborasi.
- Budgeting envelope, target tabungan, atau perencanaan keuangan otomatis.
- Multi-currency (v1 hardcode Rupiah, format `Rp 150.000`).
- Recurring/auto-transaction scheduler.
- Integrasi bank/payment gateway.

### 1.3 User Persona

**Persona Primer — "Andi, 27, Karyawan Swasta"**
- Gaji masuk bulanan; pengeluaran harian tersebar (makan, transport, e-wallet, hiburan).
- Frustasi: tidak tahu kemana uang habis di tengah bulan.
- Kebutuhan: catat transaksi cepat di HP, lihat ringkasan & breakdown kategori.
- Perilaku: mayoritas di mobile (Android/iOS via *Add to Home Screen*), sesekali desktop.

**Persona Sekunder — "Sari, 32, Freelancer"**
- Pemasukan tidak teratur (multi proyek), perlu melacak arus kas masuk vs keluar.
- Kebutuhan: tren cashflow, multi-wallet (bank + e-wallet + cash), backup data saat ganti perangkat.

**Persona Tersier — "Budi, 22, Mahasiswa"**
- Budget ketat, pengeluaran kecil tapi sering. Butuh input super cepat dan kategori sederhana.

### 1.4 Asumsi & Constraint

- Data lokal per-perangkat; tidak ada sinkronisasi antar perangkat di v1.
- Format mata uang Indonesia: integer Rupiah (tanpa desimal sen).
- Target browser modern (Chrome, Safari, Firefox, Edge) dengan dukungan IndexedDB & Service Worker.

---

## 2. Design System & UI/UX Reference Blueprint

### 2.1 Arahan Riset & Referensi Visual

Riset dilakukan terhadap dua sumber pola desain modern:

**21st.dev (komponen React/Tailwind modern):**
- **Bento Grid** untuk dashboard — kartu ringkasan disusun grid modular dengan ukuran bervariasi, bukan kartu seragam membosankan.
- **Glassmorphism / Clean Card** untuk kartu saldo utama — background translusen, subtle backdrop-blur, border 1px semi-transparan, shadow lembut.
- **Mikro-interaksi** — hover/active scale pada tombol, transisi warna halus, *spring* easing untuk drawer/bottom sheet.
- **Komponen modern** — segmented control untuk filter periode, pill/toggle untuk Pemasukan/Pengeluaran, icon-button dengan tooltip.

**Pinterest (tata letak mobile-first fintech/tracker):**
- Layout **high-contrast, bersih, bernapas** — banyak whitespace, satu aksi utama per layar.
- **Bottom Navigation** + **FAB** sebagai pola utama navigasi thumb-friendly.
- Kartu transaksi dengan **ikon kategori berwarna** sebagai anchor visual (scan cepat).
- **Warna semantik** konsisten: hijau = masuk, merah = keluar.

### 2.2 Palet Warna

Mode terang & gelap didukung penuh via CSS variable + Tailwind `dark:` class.

| Token | Light | Dark | Penggunaan |
|---|---|---|---|
| `--bg` | `#fafbfc` | `#002222` | Background app |
| `--surface` | `#ffffff` | `#0e2525` | Kartu / sheet |
| `--surface-2` | `#f2f5f4` | `#153432` | Surface sekunder |
| `--line` | `#e5e7eb` | `#22403d` | Border |
| `--text` | `#1a1d1c` | `#eaf1ef` | Teks utama |
| `--text-muted` | `#6b7280` | `#91a8a3` | Teks sekunder |
| `--primary` | `#115544` | `#63c7a9` | Aksi utama, FAB |
| `--income` | `#0f766e` | `#4bc2a0` | Pemasukan |
| `--expense` | `#b4553d` | `#e08c72` | Pengeluaran |
| `--warning` | `#a87739` | `#d6a75d` | Perhatian |
| `--hero` | `#002222` | `#143a36` | Kartu saldo (hero) |
| `--hero-text` | `#f2f8f6` | `#f2f8f6` | Teks di atas hero |

Palet kategori & dompet diturunkan dari satu keluarga nada (teal → terracotta → netral) via `toneFor(id)` di `components/lib/constants.tsx` (ramp `TONE_RAMP`), bukan warna per-kategori hardcode — jadi stabil & selaras di tema terang/gelap. Data tersimpan tidak diubah.

### 2.3 Tipografi

- **Font:** `Inter` (via `next/font`), fallback system-ui.
- **Skala (mobile-first):** Display `32px/800`, H1 `24px/700`, H2 `20px/600`, Body `16px/400`, Caption `13px/400`, Micro `11px/500`.
- **Angka uang:** `tabular-nums` (angka sejajar) + weight semi-bold agar nominal mudah dipindai.

### 2.4 Struktur Layout (Mobile-First)

```
┌─────────────────────────────┐
│  Header: Salam + Toggle     │  ← sticky, transparan → solid saat scroll
│  Dark/Light + Install       │
├─────────────────────────────┤
│  Saldo Utama (Hero Card)    │  ← glassmorphism, nominal besar
│  [Saldo | Pemasukan |      ]│
│  [Pengeluaran | Burn Rate ] │
├─────────────────────────────┤
│  Filter Periode (Segmented) │  ← Hari/Minggu/Bulan/Custom
├─────────────────────────────┤
│  Bento Grid                 │  ← donut kategori + cashflow trend + top spend
├─────────────────────────────┤
│  Riwayat (grouped by date)  │  ← daftar transaksi
│                             │
│  (spacer untuk FAB)         │
├─────────────────────────────┤
│  Bottom Navigation          │  ← 4 tab: Beranda / Analitik / Riwayat / Dompet
│  [FAB +]                    │  ← di atas bottom nav, center
└─────────────────────────────┘
```

**Aturan Thumb-Friendly:**
- Zona aksi utama (FAB, tab) berada di 40% bawah layar.
- Target sentuh minimum `44×44px`.
- Input cepat maksimal 3 tap: tap FAB → pilih nominal/ketik → tap simpan.

### 2.5 Micro-interactions & Polish

| Interaksi | Spesifikasi |
|---|---|
| FAB press | `scale 0.94` saat active, spring kembali ke `1` (Framer Motion `spring`, stiffness 400, damping 22). |
| Bottom sheet | Muncul dari bawah dengan `y: 100% → 0`, easing spring; backdrop `opacity` fade. |
| Toggle Pemasukan/Pengeluaran | Pill slider animasi `layoutId` untuk transisi indikator halus. |
| Kartu saldo angka | Animasi angka naik/turun (count-up) saat periode berganti. |
| Tombol | Haptic feel — `active:scale-95`, transisi `duration-150`; feedback visual instan. |
| Filter periode | Segmented control dengan indikator `layoutId` sliding. |
| Delete transaksi | Konfirmasi swipe-to-reveal atau long-press dengan animasi collapse. |
| Mode gelap/terang | Transisi warna `transition-colors duration-300` global. |

### 2.6 Format Input Mata Uang Otomatis

- Input nominal diformat saat mengetik: `150000` → `Rp 150.000`.
- Logika: strip non-digit → integer → format ribuan titik `toLocaleString('id-ID')`.
- Nilai disimpan sebagai **integer Rupiah** (hindari float).
- Display konsisten via helper `formatIDR(n)` = `"Rp " + n.toLocaleString('id-ID')`.

---

## 3. Database Schema (Dexie.js / IndexedDB)

### 3.1 Prinsip

- Store nilai uang sebagai **integer Rupiah** (bukan float) untuk presisi.
- ID memakai string UUID (`crypto.randomUUID()`) untuk import/export idempotent; `id` primary key non-increment agar merge backup tidak konflik.
- Schema versioning via `Dexie.version(n).stores(...)` untuk migrasi.
- React reaktivitas via `dexie-react-hooks` → `useLiveQuery`.

### 3.2 Tabel & Definisi

```ts
// schema.ts — deklarasi versi
const db = new Dexie('money-track-db');

db.version(1).stores({
  transactions: 'id, date, type, walletId, categoryId, [date+type], [walletId+date]',
  wallets:      'id, name, order',
  categories:   'id, type, order',
  settings:     'key',
});

db.version(2).stores({ /* migrasi mendatang, contoh: budgets */ });
```

#### Tabel `transactions`

| Field | Type | Index | Keterangan |
|---|---|---|---|
| `id` | string (UUID) | PK | `crypto.randomUUID()` |
| `type` | `'income' \| 'expense' \| 'transfer'` | ya | Jenis transaksi |
| `amount` | number (int) | — | Nominal positif (Rupiah). Transfer = nominal keluar. |
| `categoryId` | string \| null | ya | FK ke `categories`; `null` untuk transfer |
| `walletId` | string | ya | FK ke `wallets` (sumber) |
| `toWalletId` | string \| null | — | FK tujuan (hanya transfer) |
| `note` | string | — | Catatan opsional |
| `date` | string (ISO datetime) | ya | Tanggal transaksi (`YYYY-MM-DDTHH:mm:ss`) |
| `createdAt` | string (ISO) | — | Dibuat |
| `updatedAt` | string (ISO) | — | Diubah |

Compound indexes:
- `[date+type]` — query cashflow trend per rentang.
- `[walletId+date]` — saldo & riwayat per dompet.

#### Tabel `wallets`

| Field | Type | Keterangan |
|---|---|---|
| `id` | string (UUID) | PK |
| `name` | string | "Tunai", "Rekening Bank", "E-Wallet" |
| `icon` | string | Nama icon Lucide (key) |
| `color` | string | Hex warna dompet |
| `initialBalance` | number (int) | Saldo awal |
| `order` | number | Urutan tampil |

> **Saldo dompet dihitung on-the-fly** (derived): `initialBalance + Σ(income) − Σ(expense) − Σ(transfer keluar) + Σ(transfer masuk)`. Tidak disimpan terdenormalisasi untuk mencegah drift.

#### Tabel `categories`

| Field | Type | Keterangan |
|---|---|---|
| `id` | string (UUID) | PK |
| `name` | string | "Makan & Minum" |
| `icon` | string | Nama icon Lucide |
| `color` | string | Hex |
| `type` | `'income' \| 'expense'` | Kategori milik tipe mana |
| `order` | number | Urutan tampil |
| `isSystem` | boolean | Kategori bawaan (tidak bisa dihapus) |

**Seed kategori bawaan (saat init):**
- Expense: Makan & Minum `Utensils`, Transportasi `Car`, Tagihan `Receipt`, Belanja `ShoppingBag`, Hiburan `Gamepad2`, Lainnya `MoreHorizontal`.
- Income: Gaji `Briefcase`, Freelance `Laptop`, Investasi `TrendingUp`, Hadiah `Gift`, Lainnya `MoreHorizontal`.

#### Tabel `settings` (key-value)

| Key | Type | Default |
|---|---|---|
| `theme` | `'light' \| 'dark' \| 'system'` | `'system'` |
| `lastWalletId` | string | wallet pertama |
| `onboarded` | boolean | `false` |

### 3.3 Data Access Layer

Fungsi helper terpusat di `lib/db/repository.ts`:
- `addTransaction(input)`, `updateTransaction(id, patch)`, `deleteTransaction(id)`
- `listTransactions({from, to, type?, walletId?, categoryId?, search?})`
- `getWalletBalance(walletId, until?)`, `computeNetBalance(from, to)`
- `getCategorySpending(from, to)`, `getCashflowSeries(from, to, bucket: 'day'|'month')`
- `exportJSON()`, `importJSON(payload)` (dengan validasi schema), `exportCSV()`

---

## 4. Functional Requirements & User Stories

### 4.1 Dashboard Ringkasan Finansial

**User Story:** "Sebagai pengguna, saya ingin melihat ringkasan keuangan periode berjalan secara sekilas."

**Fungsional:**
- Kartu utama menampilkan **Total Saldo Bersih** (income − expense pada periode), **Total Pemasukan**, **Total Pengeluaran**, **Daily Burn Rate**.
- *Daily Burn Rate* = `Σ(pengeluaran periode) / jumlah hari berjalan periode`. Periode "Bulan Ini" → `Σexpense / hari-ke-tanggal`.
- Filter periode cepat: **Hari Ini, Minggu Ini, Bulan Ini, Custom Range** (date picker).
- Filter disimpan di state UI lokal (bukan DB), default "Bulan Ini".

**Acceptance Criteria:**
- [ ] Saldo bersih terhitung benar untuk semua 4 filter.
- [ ] Burn rate menampilkan nilai rata-rata harian, diformat `Rp X`.
- [ ] Custom range memakai date picker dengan validasi `from ≤ to`.
- [ ] Angka ber-animasi count-up saat ganti periode.

### 4.2 Analytics & Data Visualization (Chart Interaktif)

**Library:** Recharts (responsif, ringan, tree-shakeable).

#### 4.2.1 Donut/Pie Chart Breakdown Kategori

**User Story:** "Saya ingin tahu proporsi pengeluaran per kategori agar tahu uang habis ke mana."

- Donut/Pie menampilkan proporsi pengeluaran per kategori + persentase + nominal Rupiah.
- Hover/click slice → highlight + tooltip (`nama`, `Rp nominal`, `persen%`).
- Legend interaktif: tap kategori untuk toggle slice; total selalu menampilkan 100% dari kategori aktif.
- Kategori < 3% diaggregasikan ke "Lainnya".

**Acceptance Criteria:**
- [ ] Tooltip menampilkan nominal + persentase akurat.
- [ ] Persentase slice = `kategori / total expense periode` (bukan seluruh transaksi).
- [ ] Empty state saat tidak ada pengeluaran ("Belum ada pengeluaran").

#### 4.2.2 Bar/Area Chart Arus Kas (Cashflow Trend)

**User Story:** "Saya ingin membandingkan tren pemasukan vs pengeluaran."

- Bar chart (atau area) membandingkan **Pemasukan vs Pengeluaran** per bucket (harian untuk rentang ≤ 31 hari, bulanan untuk rentang > 31 hari).
- Dua seri: income (hijau), expense (merah). Legend toggle seri.
- Responsive container (`<ResponsiveContainer>`) agar sesuai lebar layar.

**Acceptance Criteria:**
- [ ] Bucket otomatis (day/month) berdasarkan panjang rentang.
- [ ] Tooltip menampilkan nilai per seri per bucket.
- [ ] Tidak crash saat rentang kosong (render zero-value series).

#### 4.2.3 Top Spending Rank

**User Story:** "Saya ingin melihat kategori paling boros."

- Daftar peringkat kategori terboros dengan **progress bar** visual (lebar = proporsi terhadap kategori terbesar).
- Tampilkan icon, nama, nominal, dan persentase per baris.

**Acceptance Criteria:**
- [ ] Diurutkan menurun berdasarkan nominal.
- [ ] Progress bar relatif terhadap nilai maksimum (bukan total), agar visual proporsional.

### 4.3 Quick Transaction Logger (Input Cepat)

**User Story:** "Saya ingin mencatat transaksi ≤ 3 tap / < 3 detik."

- **Bottom sheet** (drawer bawah) dengan:
  - Input nominal besar + keypad numerik (atau input keyboard native yang diformat otomatis).
  - Toggle **Pemasukan / Pengeluaran** (pill).
  - Pemilihan kategori berbasis **ikon** (grid horizontal scroll).
  - Pemilihan **sumber dana/dompet** (Cash, Rekening Bank, E-Wallet).
  - **Tanggal** (default hari ini, bisa diubah).
  - **Catatan** opsional.
- Nominal diformat `Rp 150.000` saat mengetik.
- Default wallet = `settings.lastWalletId` (diingat antar sesi).

**Acceptance Criteria:**
- [ ] Transaksi tersimpan ke IndexedDB dan langsung muncul di riwayat + dashboard.
- [ ] Toggle tipe otomatis menukar daftar kategori (income vs expense).
- [ ] Validasi: nominal > 0; kategori wajib; wallet wajib.
- [ ] Input keyboard numerik di mobile memunculkan keypad angka.

### 4.4 Multi-Wallet / Sumber Dana

**User Story:** "Saya ingin mengelola saldo terpisah antar dompet dan transfer antar dompet."

- CRUD dompet (nama, icon, saldo awal).
- Layar dompet menampilkan saldo terhitung per dompet.
- **Transfer antar dompet**: pilih wallet asal, wallet tujuan, nominal, tanggal, catatan. Merekam sebagai `type: 'transfer'` dengan `walletId` + `toWalletId`.
- Saldo dompet = derived value (lihat §3.2).

**Acceptance Criteria:**
- [ ] Saldo dompet akurat setelah income/expense/transfer.
- [ ] Transfer tidak boleh dompet asal = tujuan.
- [ ] Transfer nominal > 0; tidak mewajibkan saldo cukup (boleh negatif, v1).

### 4.5 Riwayat Transaksi & Filter

**User Story:** "Saya ingin mencari, memfilter, mengedit, dan menghapus transaksi."

- Daftar transaksi **dikelompokkan per tanggal** (header tanggal + subtotal hari itu).
- **Pencarian** catatan (case-insensitive substring).
- **Filter**: kategori, dompet, tipe.
- **Edit** transaksi (buka kembali bottom sheet dengan data terisi).
- **Hapus** transaksi (dengan konfirmasi).

**Acceptance Criteria:**
- [ ] Grouping per tanggal dengan subtotal harian benar.
- [ ] Search + filter bisa dikombinasikan.
- [ ] Edit memperbarui data & merefresh seluruh view (live query).
- [ ] Hapus meminta konfirmasi; tidak bisa di-undo tanpa konfirmasi.

### 4.6 Data Portability (Backup & Restore)

**User Story:** "Saya ingin mencadangkan data agar tidak hilang saat ganti perangkat/hapus cache."

- **Export CSV** — kolom: Tanggal, Tipe, Kategori, Dompet, Nominal, Catatan. Dibuka di Excel. Memakai BOM UTF-8 agar karakter Indonesia benar.
- **Export JSON** — seluruh DB (transactions, wallets, categories, settings) dalam satu file.
- **Import JSON** — validasi schema sebelum merge; strategi **upsert by id** (idempotent, tidak duplikat).

**Acceptance Criteria:**
- [ ] CSV terbuka di Excel dengan angka terformat dan header benar.
- [ ] Export JSON menghasilkan seluruh data.
- [ ] Import JSON validasi field wajib; tolak file korup dengan pesan jelas.
- [ ] Import idempotent (import 2× tidak menduplikasi).

### 4.7 PWA & Offline Capabilities

**User Story:** "Saya ingin aplikasi terpasang seperti native dan tetap berfungsi tanpa internet."

- `manifest.json` + ikon (192, 512, maskable).
- Service Worker (via `@ducanh2912/next-pwa`) dengan caching aset statis.
- Indikator status offline + tombol install (beforeinstallprompt) + konfirmasi "Aplikasi siap diakses offline".

**Acceptance Criteria:**
- [ ] Aplikasi ter-install via Add to Home Screen, splash screen benar.
- [ ] Semua aset statis ter-cache; reload offline tetap render penuh.
- [ ] Data tetap tersimpan & terbaca offline (IndexedDB lokal).

> **Catatan arsitektur offline:** Karena 100% Local-First, seluruh operasi CRUD tidak memerlukan jaringan. Service Worker hanya untuk aset statis & installability; **tidak ada API call** yang perlu di-cache runtime.

---

## 5. PWA & Offline Architecture

### 5.1 Konfigurasi Next.js (Static Export)

`next.config.mjs`:
```js
import withPWA from '@ducanh2912/next-pwa';

const nextConfig = {
  output: 'export',           // Static Export → deploy ke Vercel/Cloudflare Pages
  images: { unoptimized: true }, // wajib untuk static export
  trailingSlash: true,
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);
```

### 5.2 Web Manifest

`app/manifest.ts` (Next Metadata API) atau `public/manifest.json`:
```json
{
  "name": "Money Track",
  "short_name": "MoneyTrack",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fafbfc",
  "theme_color": "#115544",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 5.3 Caching Strategy

| Jenis Aset | Strategi |
|---|---|
| HTML shell (`/`) | Network-first, fallback cache |
| JS/CSS chunks (hashed) | Cache-first (immutable) |
| Font | Cache-first |
| Icons/images | Cache-first |
| Runtime API | *Tidak ada* (Local-First) |

### 5.4 Service Worker Lifecycle

- `skipWaiting: true` + `clientsClaim` → update langsung aktif.
- Deteksi offline via event listener `navigator.onLine` + `online/offline` event → tampilkan banner status.

### 5.5 Offline & Install UX

- **Install prompt:** tangkap `beforeinstallprompt`, tampilkan tombol "Install Aplikasi"; simpan event untuk dipanggil saat klik.
- **Offline indicator:** banner non-intrusif "Anda sedang offline — data tetap tersimpan lokal" saat `offline` event.
- **A2HS hint:** pada iOS Safari, tampilkan panduan singkat (tap Share → Add to Home Screen).

---

## 6. Project Folder Structure

```
money-track/
├─ next.config.mjs
├─ tsconfig.json
├─ tailwind.config.ts
├─ package.json
├─ public/
│  ├─ manifest.json
│  ├─ icons/
│  │  ├─ icon-192.png
│  │  ├─ icon-512.png
│  │  └─ icon-maskable-512.png
│  └─ offline.html            # fallback offline (opsional)
├─ app/
│  ├─ layout.tsx              # root layout, font Inter, theme provider
│  ├─ page.tsx                # Dashboard (Beranda)
│  ├─ analytics/page.tsx      # Analitik (chart)
│  ├─ history/page.tsx        # Riwayat transaksi
│  ├─ wallets/page.tsx        # Dompet & transfer
│  ├─ settings/page.tsx       # Pengaturan, backup/restore, tema
│  ├─ manifest.ts             # Next Metadata manifest
│  └─ globals.css             # CSS variables tema + Tailwind
├─ components/
│  ├─ ui/                     # primitif reusable
│  │  ├─ Button.tsx
│  │  ├─ BottomSheet.tsx
│  │  ├─ SegmentedControl.tsx
│  │  ├─ Toggle.tsx
│  │  ├─ ProgressBar.tsx
│  │  ├─ EmptyState.tsx
│  │  └─ AnimatedNumber.tsx
│  ├─ layout/
│  │  ├─ BottomNav.tsx
│  │  ├─ Fab.tsx
│  │  ├─ Header.tsx
│  │  ├─ OfflineBanner.tsx
│  │  └─ InstallPrompt.tsx
│  ├─ dashboard/
│  │  ├─ BalanceCard.tsx
│  │  ├─ PeriodFilter.tsx
│  │  └─ BentoGrid.tsx
│  ├─ charts/
│  │  ├─ CategoryDonut.tsx
│  │  ├─ CashflowChart.tsx
│  │  └─ TopSpending.tsx
│  ├─ transaction/
│  │  ├─ TransactionLogger.tsx   # bottom sheet input cepat
│  │  ├─ AmountInput.tsx
│  │  ├─ CategoryPicker.tsx
│  │  ├─ WalletPicker.tsx
│  │  └─ TransactionItem.tsx
│  └─ wallet/
│     ├─ WalletCard.tsx
│     └─ TransferSheet.tsx
├─ lib/
│  ├─ db/
│  │  ├─ schema.ts            # Dexie db + version
│  │  ├─ repository.ts        # data access layer
│  │  ├─ seed.ts              # seed categories & default wallet
│  │  └─ migrate.ts
│  ├─ utils/
│  │  ├─ format.ts            # formatIDR, formatDate, etc.
│  │  ├─ date.ts              # period helpers (today/week/month)
│  │  └─ id.ts                # uuid
│  ├─ hooks/
│  │  ├─ useTransactions.ts   # useLiveQuery wrappers
│  │  ├─ useWallets.ts
│  │  ├─ useCategories.ts
│  │  ├─ useTheme.ts
│  │  └─ useInstallPrompt.ts
│  └─ portability/
│     ├─ csv.ts               # export CSV (BOM UTF-8)
│     ├─ json.ts              # export/import JSON + validasi
│     └─ validate.ts
├─ types/
│  └─ index.ts                # Transaction, Wallet, Category, Settings
└─ __tests__/                 # (opsional) unit test repository & format
```

---

## 7. Step-by-Step Implementation Roadmap

Fase disusun agar tiap fase menghasilkan artefak runnable, mudah dikerjakan bertahap oleh AI agent, dan bisa diverifikasi terpisah.

### Fase 0 — Scaffold & Fondasi
- Init Next.js (App Router, TS, Tailwind), `output: 'export'`.
- Install deps: `dexie`, `dexie-react-hooks`, `recharts`, `framer-motion`, `lucide-react`, `@ducanh2912/next-pwa`.
- Setup font Inter, `globals.css` dengan CSS variables tema.
- **Verifikasi:** `next build` sukses; static export menghasilkan `out/`.

### Fase 1 — Data Layer (Dexie)
- `lib/db/schema.ts` (v1), `types/index.ts`, `seed.ts`.
- `repository.ts` semua fungsi CRUD + kalkulasi (balance, spending, cashflow).
- `hooks/*` dengan `useLiveQuery`.
- **Verifikasi:** unit test kecil / devtools IndexedDB — insert & query benar.

### Fase 2 — Design System & Shell
- Implement primitives UI: `Button`, `BottomSheet`, `SegmentedControl`, `Toggle`, `ProgressBar`, `AnimatedNumber`.
- Layout shell: `BottomNav`, `Fab`, `Header`, `ThemeProvider` (dark/light).
- **Verifikasi:** navigasi antar 4 tab berfungsi; tema toggle berfungsi.

### Fase 3 — Quick Transaction Logger
- `TransactionLogger` bottom sheet + `AmountInput` (format Rp) + `CategoryPicker` + `WalletPicker`.
- Integrasi simpan ke DB.
- **Verifikasi:** catat transaksi muncul di DB & bisa dilihat di halaman riwayat sederhana.

### Fase 4 — Dashboard
- `BalanceCard`, `PeriodFilter`, perhitungan saldo bersih/pemasukan/pengeluaran/burn rate.
- Count-up animation.
- **Verifikasi:** angka akurat untuk 4 filter.

### Fase 5 — Riwayat & Filter
- List grouped per tanggal, search, filter kategori/dompet, edit & hapus.
- **Verifikasi:** edit/hapus merefresh live query.

### Fase 6 — Analytics & Charts
- `CategoryDonut`, `CashflowChart`, `TopSpending` (Recharts).
- **Verifikasi:** chart interaktif, tooltip, legend toggle, empty state.

### Fase 7 — Multi-Wallet & Transfer
- `WalletCard`, `TransferSheet`, derived balance.
- **Verifikasi:** saldo konsisten setelah transfer.

### Fase 8 — Data Portability
- `csv.ts`, `json.ts`, `validate.ts`; UI backup/restore di Settings.
- **Verifikasi:** export→import idempotent; CSV terbuka benar di Excel.

### Fase 9 — PWA & Offline
- `manifest.ts`/`manifest.json`, ikon, `@ducanh2912/next-pwa`.
- `OfflineBanner`, `InstallPrompt`.
- **Verifikasi:** installable via Lighthouse; reload offline render penuh.

### Fase 10 — Polish, A11y & Deploy
- Micro-interactions Framer Motion, empty/loading states, aksesibilitas (aria-label, focus, kontras).
- Lighthouse audit (PWA, Performance, Accessibility ≥ 90).
- Deploy ke Vercel / Cloudflare Pages.
- **Verifikasi:** Lighthouse + smoke test per fitur.

---

### Prioritas & Urutan Nilai (MoSCoW)

- **Must:** Fase 0–6 (core tracker + visualisasi).
- **Should:** Fase 7 (multi-wallet), Fase 8 (backup).
- **Could:** Fase 9–10 (PWA install/offline polish, aksesibilitas penuh).

---

*Dokumen ini adalah blueprint eksekusi. Setiap fase menyediakan acceptance criteria yang bisa dijadikan checklist verifikasi oleh agent implementasi.*
