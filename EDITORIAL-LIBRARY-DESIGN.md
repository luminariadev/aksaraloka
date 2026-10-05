# Design System: Elegant Editorial Library

## 1. Filosofi Desain
- **Karakter:** Hangat, Tenang, Akademis, Berwibawa (*Warm Editorial & Quiet Luxury*).
- **Inspirasi:** Arsip literatur klasik, perpustakaan kurasi universitas, *The Paris Review*, *Kinfolk*, serta platform baca modern berkualitas tinggi.
- **Prinsip Anti-Slop:**
  - Menghilangkan elemen kartun, maskot gemuk, dan emoji berlebihan.
  - Mengganti gradien mencolok dengan palet warna kertas/perkamen dan aksen kayu walnut/amber kuno.
  - Tipografi kuat: kombinasi serif elegan (Lora / Playfair Display) untuk judul dan sans-serif geometris bersih (Plus Jakarta Sans) untuk legibilitas data.
  - Garis tepi halus (1px border), bayangan buku realistis (book spine depth), dan whitespace yang lapang.

## 2. Paleta Warna & Material
- **Latar Belakang (Parchment/Paper):** `#FAF8F5` (Kertas lembut, ramah di mata untuk membaca lama).
- **Kartu & Kontainer:** `rgba(255, 255, 255, 0.95)` dengan border `stone-200/80` dan blur halus.
- **Tipografi Utama (Ink):** `#292524` (Stone 800) / `#1C1917` (Stone 900).
- **Aksen Primer (Amber Wood / Leather):** `#B45309` (Amber 700) / `#78350F` (Amber 900).
- **Aksen Status Sirkulasi:**
  - *Tersedia / Dikembalikan:* Deep Emerald `#15803D`
  - *Sedang Dipinjam:* Warm Ochre `#D97706`
  - *Jatuh Tempo / Denda:* Crimson Muted `#BE123C`
  - *Digital E-Reader:* Classic Indigo/Sky `#0369A1`

## 3. Sistem Tipografi
- **Headings & Display:** `Lora`, `Playfair Display`, `Georgia`, serif.
- **Body & Data:** `Plus Jakarta Sans`, `Inter`, sans-serif.
- **Nomor Klasifikasi & ISBN:** `JetBrains Mono`, `Consolas`, monospace.

## 4. Sistem Autentikasi & Peran (Role Separation)
1. **Anggota (Member):**
   - Akses: Katalog publik, peminjaman buku fisik (auto-input nomor anggota), pembaca naskah digital e-book, dan portal personal (`/my-loans`).
   - Kartu Anggota Virtual: Menampilkan nama, kode anggota, total buku dipinjam, countdown jatuh tempo, dan estimasi denda (Rp 1.000/hari jika telat).
   - Dibatasi: Dilarang masuk ke meja kerja admin/pustakawan (`/admin` dicegat dengan `ProtectedRoute` dan status 403 di API).

2. **Pustakawan / Admin (Librarian/Admin):**
   - Akses: Dashboard lengkap (`/admin`), manajemen katalog (tambah, edit, hapus buku), pelacakan inventaris rak, dan meja sirkulasi untuk memverifikasi pengembalian buku fisik.
   - Hak istimewa: Mengubah status pinjaman dari *Dipinjam* menjadi *Dikembalikan* dan mencatat denda/kondisi buku.
