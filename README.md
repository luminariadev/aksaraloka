# 🏛️ MyLibrary — Hybrid Smart Library Platform

Platform perpustakaan modern dengan konsep **Hybrid** (sirkulasi peminjaman buku fisik di rak + pembaca e-book digital langsung di web) dan arsitektur **Dual-Engine Database** (SQLite lokal mandiri untuk operasional offline & backup + PostgreSQL/Supabase untuk sinkronisasi cloud).

Mengusung tema visual **Warm Literary Sanctuary**: palet warna perkamen krem yang nyaman di mata, tipografi editorial *Lora* dan *Playfair Display*, cover buku 3D realistis dengan *spine depth*, serta antarmuka meja pustakawan yang efisien.

---

## 🎨 Fitur Utama

- **📖 Sirkulasi Buku Fisik (Meja Pustakawan)**:
  - Pencatatan kode rak (misal `Rak Sastra A-01`) dan stok riil eksemplar.
  - Alur transaksi peminjaman mandiri & kasir (jatuh tempo default 7 hari).
  - Penghitungan denda otomatis keterlambatan (Rp 1.000/hari) dan restock saat buku dikembalikan.
- **⚡ In-Browser E-Reader Digital**:
  - Membaca dokumen e-book (PDF) langsung di peramban tanpa perlu instalasi aplikasi tambahan.
  - Pilihan mode baca ramah mata: **Sepia**, **Terang (Light)**, dan **Gelap (Dark)**.
- **🏛️ Dual-Engine Database (Offline-Resilient & Cloud Sync)**:
  - **Lokal (SQLite - `server/data/mylibrary_local.db`)**: Otomatis aktif, zero-config, tidak membutuhkan Docker atau PostgreSQL lokal saat masa pengembangan atau saat koneksi internet terputus.
  - **Cloud (PostgreSQL / Supabase)**: Terhubung otomatis saat variabel `DATABASE_URL` diatur pada `.env`.
- **💳 Kartu Anggota Perpustakaan Digital**:
  - Identitas anggota virtual lengkap dengan kode unik anggota (`LIB-2026-001`).
- **🔍 Pencarian & Filter Multi-Format**:
  - Filter cepat: *Semua Format*, *Buku Fisik Saja*, atau *E-Book Digital Saja*.
  - Pengurutan berdasarkan judul, penulis, tahun terbit, dan tanggal entri.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Custom Warm Library Theme)
- **Typography**: Lora (Serif) & Plus Jakarta Sans
- **Routing**: React Router v6
- **HTTP Client**: Axios

### Backend (`server/`)
- **Runtime**: Node.js (v24+)
- **Framework**: Express.js
- **Database Engine**:
  - **Local Native**: `node:sqlite` (SQLite bawaan Node.js tanpa binary compilation)
  - **Cloud/External**: PostgreSQL (`pg` pool) & Supabase compatibility
- **Keamanan**: Helmet, CORS, Express-Validator

---

## 🚀 Cara Menjalankan

### 1. Jalankan Backend
```bash
cd server
npm start
# atau untuk live reload:
npm run dev
```
Server akan aktif di `http://localhost:5000` dan otomatis menginisialisasi database lokal di `server/data/mylibrary_local.db` beserta data awal (seed).

### 2. Jalankan Frontend
```bash
cd client
npm run dev
```
Buka peramban di `http://localhost:5173`. Frontend sudah dilengkapi proxy otomatis ke backend di port 5000.

---

## 📁 Struktur Direktori

```
MyLibrary/
├── client/                     # Antarmuka React + Vite
│   ├── src/
│   │   ├── components/         # BookCard, Header, SearchBar, BookForm, Pagination
│   │   ├── pages/              # Home, BookList, BookDetail, AdminDashboard
│   │   ├── services/           # API Client (Books, Loans, Users, System)
│   │   └── hooks/              # useBooks hook
├── server/                     # Backend API Express.js
│   ├── data/                   # File database lokal (mylibrary_local.db)
│   └── src/
│       ├── config/             # database.js (Dual-Engine Adapter)
│       ├── controllers/        # bookController.js
│       ├── models/             # Book.js, Loan.js, User.js, Category.js
│       └── routes/             # books, categories, loans, users
```