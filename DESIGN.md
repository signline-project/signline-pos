# Design System: Signline Studio POS & Service System

## 1. Identitas & Karakter Desain
Aplikasi Signline Studio POS adalah alat kerja operasional harian (point of sale dan manajemen service gadget/elektronik) untuk kasir, teknisi, dan pemilik studio.
Desain mengutamakan:
- **Kecepatan & Utilitarian**: Kontrol mudah dijangkau, alur transaksi minim friksi, navigasi konsisten.
- **Keterbacaan Tinggi & Kontras (WCAG AA)**: Tipografi jelas, angka dengan `tabular-nums`, status visual dengan makna warna yang tegas.
- **Bebas AI Slop**: Tidak ada gradien ungu generik, tidak ada sudut membulat berlebihan (pill everywhere), tidak ada animasi loop yang mengganggu, tidak ada tombol mati (dead controls).

## 2. Dials (Antislop Part 3)
- **ENERGY: 1 (Calm)** - Antarmuka kerja profesional, fokus pada kejelasan data dan efisiensi kerja.
- **RHYTHM: 2 (Balanced)** - Tata letak terstruktur dengan hirarki modul yang jelas antara kasir, servis, katalog, riwayat, dan grafik.
- **MOTION: 1 (Hover & State Transitions Only)** - Transisi cepat (150ms-200ms) tanpa bouncing atau floating berulang.

## 3. Sistem Warna (Color Palette - R-29)
Maksimal 3 warna inti + 1 warna aksen + warna semantik:
- **Netral Gelap (Dark Mode)**: Base `#0f172a` (Slate 900), Surface `#1e293b` (Slate 800), Border `#334155` (Slate 700), Teks `#f8fafc` (Slate 50).
- **Netral Terang (Light Mode)**: Base `#f1f5f9` (Slate 100), Surface `#ffffff` (White), Border `#e2e8f0` (Slate 200), Teks `#0f172a` (Slate 900).
- **Warna Aksen Utama**: `#2563eb` (Blue 600) / `#3b82f6` (Blue 500).
- **Warna Semantik**:
  - Hijau Sukses / Selesai: `#059669` (Emerald 600) / `#10b981`.
  - Oranye / Amber Peringatan / DP: `#d97706` (Amber 600) / `#f59e0b`.
  - Merah Bahaya / Hapus / Batal: `#dc2626` (Red 600) / `#ef4444`.
  - Biru Info / Proses: `#2563eb` / `#3b82f6`.

## 4. Tipografi (R-06)
- Font Utama: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.
- Angka & Moneter: `font-variant-numeric: tabular-nums` agar sejajar rapi pada tabel belanjaan dan faktur.
- Font Thermal: `'Courier New', Courier, monospace` khusus print thermal.

## 5. Ukuran & Radius (R-11)
- Border radius tombol & input: `8px` (bukan pill 30px).
- Border radius kartu & modal: `12px`.
- Minimum tap target mobile: `44px` (R-03).
- Focus ring: `2px solid #2563eb` dengan offset `2px` untuk navigasi keyboard (R-32).

## 6. Copywriting (R-02, R-16)
- Bahasa Indonesia lugas, sopan, dan formal kerja.
- Dilarang menggunakan tanda strip em dash (`—`). Gunakan tanda hubung biasa (`-`), koma, atau tanda kurung.

