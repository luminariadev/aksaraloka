import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { booksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated, isMember, isLibrarian, isAdmin, openLogin } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Automatically redirect staff to their dedicated workspace desk
  if (isAdmin) {
    return <Navigate to="/admin/users" replace />;
  }
  if (isLibrarian) {
    return <Navigate to="/librarian/circulation" replace />;
  }

  useEffect(() => {
    booksAPI.getAll({ limit: 4 })
      .then(res => {
        if (res?.data?.data) setFeaturedBooks(res.data.data);
      })
      .catch(err => console.error('Error fetching featured books:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16 sm:space-y-20 animate-fade-in">
      {/* Editorial Hero Section */}
      <section className="border-b border-stone-200/80 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Sirkulasi Fisik & API Open Library Global</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-[1.12] tracking-tight">
              Arsip Literatur Klasik & Naskah Digital Terbuka.
            </h1>

            <p className="text-stone-600 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
              Platform perpustakaan terpadu yang memadukan sirkulasi buku fisik di rak, pembaca naskah digital di peramban, serta integrasi langsung ke jutaan karya Open Library dunia.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/books"
                className="library-btn-primary px-6 py-3.5 text-xs font-semibold tracking-wide flex items-center gap-2"
              >
                <span>Jelajahi Katalog Buku</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => openLogin()}
                  className="library-btn-secondary px-5 py-3.5 text-xs font-semibold"
                >
                  Masuk Akun Perpustakaan
                </button>
              ) : isAdmin ? (
                <Link
                  to="/admin/users"
                  className="library-btn-secondary px-5 py-3.5 text-xs font-semibold text-stone-900 border-stone-300"
                >
                  Buka Portal Administrator
                </Link>
              ) : isLibrarian ? (
                <Link
                  to="/librarian/circulation"
                  className="library-btn-secondary px-5 py-3.5 text-xs font-semibold text-amber-900 border-amber-300"
                >
                  Buka Meja Sirkulasi Pustakawan
                </Link>
              ) : (
                <Link
                  to="/my-loans"
                  className="library-btn-secondary px-5 py-3.5 text-xs font-semibold text-emerald-900 border-emerald-300"
                >
                  Lihat Pinjaman & Kartu Saya
                </Link>
              )}
            </div>

            {/* Micro Metadata */}
            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-stone-200/70 max-w-md text-xs">
              <div>
                <p className="font-serif text-xl font-bold text-stone-900">3 Peran</p>
                <p className="text-[11px] text-stone-500 font-mono mt-0.5">Admin, Pustakawan, User</p>
              </div>
              <div>
                <p className="font-serif text-xl font-bold text-stone-900">Open Library</p>
                <p className="text-[11px] text-stone-500 font-mono mt-0.5">Jutaan Buku REST API</p>
              </div>
              <div>
                <p className="font-serif text-xl font-bold text-stone-900">Dual-Engine</p>
                <p className="text-[11px] text-stone-500 font-mono mt-0.5">SQLite & Cloud</p>
              </div>
            </div>
          </div>

          {/* Curated Spotlight Book */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-xs library-card p-6 space-y-4 hover:shadow-card-warm-hover transition-all duration-300">
              <div className="flex items-center justify-between text-[10px] font-mono tracking-wider uppercase text-stone-400">
                <span>Sorotan Utama</span>
                <span className="text-amber-800 font-bold">Karya Pilihan</span>
              </div>

              <div className="relative aspect-[2/3] rounded-r-xl rounded-l-sm overflow-hidden shadow-book-lg border-l-4 border-stone-900/30 bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600"
                  alt="Laskar Pelangi"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">Laskar Pelangi</h3>
                <p className="text-xs text-stone-500 font-medium">Andrea Hirata • Sastra Indonesia</p>
                <p className="text-xs text-stone-600 line-clamp-2 pt-1 font-serif leading-relaxed">
                  Perjuangan sepuluh anak di Belitong dalam meraih impian melalui pendidikan.
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-emerald-800 font-semibold">Rak Sastra A-01</span>
                <Link
                  to="/books/1"
                  className="text-xs font-semibold text-stone-900 hover:text-amber-800 flex items-center gap-1"
                >
                  <span>Buka Detail</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Distinct Roles Architecture Showcase */}
      <section className="space-y-6">
        <div className="max-w-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 font-bold">
            Pemisahan Otoritas & Alur Kerja
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Tiga Menu & Peran Terpisah (Admin, Pustakawan, Anggota)
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Setiap peran memiliki hak akses terspesialisasi yang dijaga ketat oleh sistem autentikasi JWT.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* 1. ADMIN ROLE */}
          <div className="library-card p-6 space-y-4 flex flex-col justify-between border-stone-300 bg-white">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-stone-900 text-amber-200">
                  1. ADMINISTRATOR
                </span>
                <span className="text-xs text-stone-400 font-mono">ADM-001</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Tata Kelola Pengguna & Sistem
              </h3>
              <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-900 mt-1.5 shrink-0" />
                  <span>Manajemen pengguna: daftar anggota, tunjuk staf Pustakawan, ganti hak akses.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-900 mt-1.5 shrink-0" />
                  <span>Pengaturan kebijakan: batas pinjam buku, masa durasi pinjam, dan denda per hari.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-900 mt-1.5 shrink-0" />
                  <span>Pengawasan failover dual-engine (SQLite offline ⇋ PostgreSQL cloud).</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => openLogin({ email: 'admin@mylibrary.local', password: 'password123' })}
                className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-all text-center shadow-sm"
              >
                Masuk sebagai Admin
              </button>
            </div>
          </div>

          {/* 2. LIBRARIAN ROLE */}
          <div className="library-card p-6 space-y-4 flex flex-col justify-between border-amber-200/80 bg-amber-50/20">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900">
                  2. PUSTAKAWAN
                </span>
                <span className="text-xs text-amber-800 font-mono">LIB-001</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Meja Sirkulasi & Impor Buku
              </h3>
              <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-1.5 shrink-0" />
                  <span>Meja Sirkulasi: Catat pinjaman fisik dan verifikasi pengembalian buku di rak.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-1.5 shrink-0" />
                  <span>Impor Open Library: Tambahkan jutaan buku dunia ke database lokal dengan 1 klik.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-1.5 shrink-0" />
                  <span>Kelola kode rak (Rak A-01, dll) dan update ketersediaan stok fisik.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-amber-200/60">
              <button
                type="button"
                onClick={() => openLogin({ email: 'pustakawan@mylibrary.local', password: 'password123' })}
                className="w-full py-2.5 rounded-xl bg-amber-900 text-amber-50 text-xs font-semibold hover:bg-amber-800 transition-all text-center shadow-sm"
              >
                Masuk sebagai Pustakawan
              </button>
            </div>
          </div>

          {/* 3. MEMBER ROLE */}
          <div className="library-card p-6 space-y-4 flex flex-col justify-between border-emerald-200/80 bg-emerald-50/20">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900">
                  3. ANGGOTA (USER)
                </span>
                <span className="text-xs text-emerald-800 font-mono">MBR-001</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Kartu Anggota & Pembaca Digital
              </h3>
              <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mt-1.5 shrink-0" />
                  <span>Kartu Anggota Virtual dengan kode keanggotaan dan kuota pinjam.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mt-1.5 shrink-0" />
                  <span>Pengajuan pinjam buku fisik langsung ke perpustakaan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mt-1.5 shrink-0" />
                  <span>Hitung mundur jatuh tempo pengembalian dan e-reader naskah digital.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-emerald-200/60">
              <button
                type="button"
                onClick={() => openLogin({ email: 'rizkia@example.com', password: 'password123' })}
                className="w-full py-2.5 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 transition-all text-center shadow-sm"
              >
                Masuk sebagai Anggota
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Open Library REST API Feature Banner */}
      <section className="library-card p-8 sm:p-10 bg-gradient-to-br from-stone-900 to-stone-800 text-stone-100 relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-semibold">
            <span>Repositori Open Source Dunia (Internet Archive)</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Terhubung ke Jutaan Buku Melalui Open Library REST API.
          </h2>
          <p className="text-stone-300 text-sm leading-relaxed">
            Sebagai implementasi rekomendasi <i>public-apis</i> GitHub terpopuler, AksaraLoka memungkinkan Anda mengeksplorasi katalog literatur dunia secara langsung tanpa batas lisensi.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/books"
              className="px-5 py-3 rounded-xl bg-amber-100 text-stone-900 text-xs font-bold hover:bg-white transition-all shadow-sm"
            >
              Coba Eksplorasi Open Library
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Catalog Shelf */}
      <section className="space-y-6 pt-4">
        <div className="flex items-end justify-between border-b border-stone-200 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold">
              Koleksi Terbaru
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-0.5">
              Baru Tiba di Katalog Perpustakaan
            </h2>
          </div>
          <Link
            to="/books"
            className="text-xs font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1 group"
          >
            Lihat Semua Koleksi
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="library-card p-4 animate-pulse space-y-3">
                <div className="aspect-[2/3] bg-stone-200 rounded-xl" />
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="library-card p-4 group hover:border-amber-700/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-r-xl rounded-l-sm shadow-book bg-stone-100 mb-3 border-l-4 border-stone-900/25">
                    <img
                      src={book.cover_url || `https://picsum.photos/seed/${book.id}/300/400.jpg`}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-serif font-bold text-sm text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
                    {book.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-1 mt-1 font-medium">
                    {book.author}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="font-mono text-[11px]">{book.rack_location || `${book.pages || '-'} hal`}</span>
                  <span className="font-semibold text-emerald-800">Tersedia</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}