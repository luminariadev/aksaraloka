<div align="center">
  <img src="client/public/favicon.svg" width="96" height="96" alt="AksaraLoka Logo" />
  <h1>AksaraLoka</h1>
  <p><strong>Semesta Aksara & Arsip Pengetahuan Terbuka</strong></p>
  <p>Platform perpustakaan hibrida dengan sirkulasi fisik di rak, pembaca naskah digital langsung di peramban, serta arsitektur dual-engine database (SQLite Lokal & Supabase PostgreSQL Cloud).</p>
</div>

---

## Ringkasan Fitur

### 1. Ruang Aksara Pembaca (User / Member)
- **Katalog Koleksi**: Menjelajahi buku fisik di rak dan koleksi naskah digital.
- **Naskah Klasik Terbuka (Project Gutenberg)**: Membaca karya klasik dunia (*The Art of War*, *Relativity*, *Meditations*, dll.) bab demi bab langsung di web dengan pilihan tema (Terang, Sepia, Gelap) dan ukuran teks.
- **Komik & Manga Daring**: Membaca komik visual (*XKCD Sains*, MangaDex publik) dengan pembaca panel vertikal *webtoon* atau *single page*.
- **Peminjaman & Pengembalian**: Pengajuan pinjam buku fisik dengan penghitungan jatuh tempo dan denda otomatis.
- **Kartu Anggota Digital**: Identitas keanggotaan virtual ber-QR code dan nomor anggota unik.

### 2. Meja Kerja Pustakawan (Librarian Desk)
- **Meja Layanan Sirkulasi**: Pemrosesan peminjaman fisik, verifikasi pengembalian, dan restock buku otomatis.
- **Audit Kondisi Fisik & Stock Opname**: Pencatatan kondisi fisik eksemplar nyata (*Baik*, *Rusak Ringan*, *Rusak Sedang*, *Rusak Berat*, *Hilang*), catatan inspeksi pustakawan, dan stempel waktu audit.
- **Impor 1-Klik Koleksi Global**: Sinkronisasi jutaan data buku dari **Open Library REST API** berdasarkan judul, subjek, atau ISBN langsung ke database lokal/cloud.

### 3. Portal Administrator Sistem (Admin Desk)
- **Manajemen Pengguna & Peran**: Pengaturan hak akses peran (*ADMIN*, *LIBRARIAN*, *MEMBER*) dengan proteksi *anti-self lockout*.
- **Konfigurasi Kebijakan**: Pengaturan besaran denda harian, batas kuota pinjam, durasi peminjaman, dan nama resmi instansi.
- **Monitoring Dual-Engine**: Pemantauan status engine database yang sedang aktif.

---

## Arsitektur Dual-Engine Database

AksaraLoka dirancang dengan konsep **Zero-Friction Offline & Cloud Synchronization**:

| Mode | Engine | Lokasi Data | Kegunaan |
| :--- | :--- | :--- | :--- |
| **Offline Lokal** | `node:sqlite` (Native) | `server/data/mylibrary_local.db` | Mode bawaan, zero-config, tahan saat internet terputus. |
| **Online Cloud** | **Supabase PostgreSQL** | AWS Cloud (Pooler SSL) | Produksi, multi-user concurrent, pencadangan otomatis. |

> **Fail-Safe Mechanism:** Jika koneksi internet atau Supabase mengalami gangguan, backend otomatis beralih sementara (*auto-fallback*) ke SQLite lokal agar layanan tidak terhenti.

---

## Teknologi yang Digunakan

- **Frontend**: React 18, Vite, Tailwind CSS (Warm Literary Theme: `#FAF8F5`, Obsidian `#1C1917`, Amber Gold `#D97706`), Axios, React Router v6.
- **Backend**: Node.js (v24+), Express.js, JWT Authentication, Helmet, Morgan, Express-Validator.
- **Database**: PostgreSQL (Supabase) & Node.js Native SQLite (`node:sqlite`).
- **Integrasi Eksternal**: Project Gutenberg / Gutendex, MangaDex API, XKCD API, Open Library REST API.

---

## Panduan Menjalankan Proyek

### 1. Prasyarat
- Node.js versi 20 ke atas (disarankan v22+ atau v24).
- Akun Supabase (opsional, jika ingin mengaktifkan mode cloud).

### 2. Pengaturan Variabel Lingkungan
Salin file template konfigurasi:
```bash
cp .env.example server/.env
```

Untuk menghubungkan ke Supabase:
```env
DB_ENGINE=postgres
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
DB_SSL=true
```

### 3. Menjalankan Backend
```bash
cd server
npm install
npm run dev
```
Server backend akan aktif di `http://localhost:5000`.

### 4. Menjalankan Frontend
```bash
cd client
npm install
npm run dev
```
Buka peramban di `http://localhost:5173` (atau melalui jaringan lokal LAN pada IP yang tertera).

---

## Akun Demo Bawaan

| Peran | Email | Kata Sandi |
| :--- | :--- | :--- |
| **Administrator** | `admin@mylibrary.local` | `password123` |
| **Pustakawan** | `pustakawan@mylibrary.local` | `password123` |
| **Anggota** | `rizkia@example.com` | `password123` |

---

<div align="center">
  <small>© 2026 AksaraLoka — Semesta Aksara & Arsip Pengetahuan Terbuka.</small>
</div>