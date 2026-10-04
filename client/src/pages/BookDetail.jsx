import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBook } from '../hooks/useBooks';
import { loansAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BookDetail() {
  const { id } = useParams();
  const { book, loading, error } = useBook(id);
  const { user, isAuthenticated, openLogin } = useAuth();

  const [showReader, setShowReader] = useState(false);
  const [readerTheme, setReaderTheme] = useState('sepia'); // 'sepia' | 'light' | 'dark'
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [borrowSuccess, setBorrowSuccess] = useState(null);
  const [borrowError, setBorrowError] = useState(null);
  const [borrowSubmitting, setBorrowSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto library-card p-8 animate-pulse">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-72 aspect-[2/3] bg-stone-200 rounded-xl" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-stone-200 rounded-lg w-3/4" />
            <div className="h-5 bg-stone-200 rounded-lg w-1/2" />
            <div className="h-24 bg-stone-100 rounded-xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-xl mx-auto library-card p-10 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900">Buku Tidak Ditemukan</h2>
        <p className="text-stone-500 text-xs">{error || 'Data koleksi tidak tersedia di katalog perpustakaan.'}</p>
        <Link to="/books" className="library-btn-primary inline-block text-xs">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const getCoverUrl = () => {
    if (book.cover_url) return book.cover_url;
    return `https://picsum.photos/seed/${book.isbn || book.id}/400/600.jpg`;
  };

  const handleOpenBorrowModal = () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    setShowBorrowModal(true);
  };

  const handleConfirmBorrow = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLogin();
      return;
    }

    try {
      setBorrowSubmitting(true);
      setBorrowError(null);
      const res = await loansAPI.create({
        book_id: book.id,
        notes: `Pengajuan mandiri oleh ${user.name} (${user.member_code})`,
      });

      setBorrowSuccess(`Transaksi sukses! Kode Pinjam: ${res.data.data.loan_code}. Silakan ambil buku di meja sirkulasi.`);
      setTimeout(() => {
        setShowBorrowModal(false);
        setBorrowSuccess(null);
        window.location.reload();
      }, 2500);
    } catch (err) {
      setBorrowError(err.response?.data?.message || 'Gagal memproses peminjaman.');
    } finally {
      setBorrowSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/books"
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Kembali ke Katalog</span>
      </Link>

      {/* Main Book Detail Container */}
      <article className="library-card overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-10">
          {/* Left Column: Book Cover & Actions */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-6">
            <div className="relative aspect-[2/3] rounded-r-xl rounded-l-sm overflow-hidden shadow-book-lg border-l-4 border-stone-900/30 bg-stone-100 max-w-xs mx-auto w-full">
              <img
                src={getCoverUrl()}
                alt={`Cover ${book.title}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                {book.is_digital === 1 && (
                  <span className="bg-sky-900/90 text-white px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider">
                    DIGITAL
                  </span>
                )}
                {book.is_physical === 1 && (
                  <span className="bg-emerald-900/90 text-white px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider">
                    FISIK
                  </span>
                )}
              </div>
            </div>

            {/* Action CTA Under Book Cover */}
            <div className="space-y-2.5 max-w-xs mx-auto w-full">
              {(book.is_digital === 1 || book.gutenberg_id) && (
                <Link
                  to={`/reader/${book.id}`}
                  className="w-full py-3.5 px-4 rounded-xl bg-stone-900 text-amber-50 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-stone-800 transition-all shadow-md"
                >
                  <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Baca Langsung di Web (E-Reader)</span>
                </Link>
              )}

              {book.is_physical === 1 && (
                <button
                  type="button"
                  onClick={handleOpenBorrowModal}
                  disabled={book.stock <= 0 || book.physical_condition === 'PERBAIKAN' || book.physical_condition === 'RUSAK_BERAT' || book.physical_condition === 'HILANG'}
                  className={`w-full py-3 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all ${
                    (book.physical_condition === 'PERBAIKAN' || book.physical_condition === 'RUSAK_BERAT' || book.physical_condition === 'HILANG')
                      ? 'bg-orange-50 text-orange-800 cursor-not-allowed border border-orange-200'
                      : book.stock > 0
                      ? 'bg-amber-50 text-amber-900 border border-amber-300/80 hover:bg-amber-100/80'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {book.physical_condition === 'PERBAIKAN'
                      ? 'Buku Sedang Dalam Konservasi'
                      : book.physical_condition === 'RUSAK_BERAT'
                      ? 'Buku Rusak Berat (Tidak Dipinjamkan)'
                      : book.physical_condition === 'HILANG'
                      ? 'Buku Hilang dari Rak'
                      : book.stock > 0
                      ? isAuthenticated
                        ? 'Ajukan Peminjaman Fisik'
                        : 'Masuk Akun untuk Meminjam'
                      : 'Stok Fisik Sedang Habis'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Book Details */}
          <div className="md:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {book.category_name && (
                  <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 rounded-full text-xs font-medium">
                    {book.category_name}
                  </span>
                )}
                {book.is_physical === 1 && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    book.stock > 0
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {book.stock > 0 ? `Tersedia: ${book.stock} Buku` : 'Habis Dipinjam'}
                  </span>
                )}
                {book.is_physical === 1 && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    book.physical_condition === 'PERBAIKAN'
                      ? 'bg-orange-50 text-orange-800 border-orange-200'
                      : book.physical_condition === 'RUSAK_RINGAN'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : book.physical_condition === 'RUSAK_BERAT'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : book.physical_condition === 'HILANG'
                      ? 'bg-stone-100 text-stone-700 border-stone-300'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    Kondisi: {
                      book.physical_condition === 'PERBAIKAN' ? 'Dalam Konservasi' :
                      book.physical_condition === 'RUSAK_RINGAN' ? 'Rusak Ringan (Layak)' :
                      book.physical_condition === 'RUSAK_BERAT' ? 'Rusak Berat' :
                      book.physical_condition === 'HILANG' ? 'Hilang' : 'Prima'
                    }
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
                {book.title}
              </h1>
              <p className="text-sm text-stone-600 font-medium">
                Karya <span className="text-stone-900 font-semibold">{book.author}</span>
              </p>
            </div>

            {/* Synopsis */}
            {book.description && (
              <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-stone-200/60 space-y-2">
                <h3 className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">
                  Sinopsis Buku
                </h3>
                <p className="text-stone-700 leading-relaxed text-sm font-serif">
                  {book.description}
                </p>
              </div>
            )}

            {/* Book Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-white border border-stone-200 text-xs">
              <div>
                <span className="text-stone-400 font-mono text-[10px] uppercase block">Lokasi Rak</span>
                <span className="font-semibold text-stone-900 mt-0.5 block">
                  {book.rack_location || 'Rak Umum'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 font-mono text-[10px] uppercase block">ISBN</span>
                <span className="font-mono text-stone-800 mt-0.5 block">{book.isbn || '-'}</span>
              </div>
              <div>
                <span className="text-stone-400 font-mono text-[10px] uppercase block">Tahun Terbit</span>
                <span className="text-stone-800 mt-0.5 block">{book.published_year || '-'}</span>
              </div>
              <div>
                <span className="text-stone-400 font-mono text-[10px] uppercase block">Halaman</span>
                <span className="text-stone-800 mt-0.5 block">{book.pages ? `${book.pages} hlm` : '-'}</span>
              </div>
              <div>
                <span className="text-stone-400 font-mono text-[10px] uppercase block">Bahasa</span>
                <span className="text-stone-800 mt-0.5 block">{book.language || 'Indonesia'}</span>
              </div>
              <div>
                <span className="text-stone-400 font-mono text-[10px] uppercase block">Format Digital</span>
                <span className="text-stone-800 mt-0.5 block">{book.ebook_format || 'PDF'}</span>
              </div>
            </div>

            {book.is_physical === 1 && book.condition_notes && (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase font-bold text-amber-800">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Catatan Kondisi Fisik (Stock Opname Rak)</span>
                </div>
                <p className="text-stone-700 italic">"{book.condition_notes}"</p>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Digital Reading Showcase Banner */}
      {(book.is_digital === 1 || book.gutenberg_id) && (
        <section className="library-card p-6 sm:p-8 bg-amber-50/40 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-800 uppercase tracking-wider">
              <svg className="w-4 h-4 text-amber-800 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Naskah Lengkap Siap Dibaca</span>
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900">
              Baca Karya Ini Langsung di Peramban Web Anda
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Dilengkapi pemilih mode kertas sepia, tata letak bab terstruktur, dan penyesuaian ukuran teks tanpa perlu keluar dari aplikasi AksaraLoka.
            </p>
          </div>

          <Link
            to={`/reader/${book.id}`}
            className="library-btn-primary bg-amber-900 hover:bg-amber-800 text-amber-50 px-6 py-3 text-xs font-semibold shrink-0 flex items-center justify-center gap-2 shadow-md"
          >
            <span>Mulai Membaca Sekarang</span>
            <span>→</span>
          </Link>
        </section>
      )}

      {/* Borrow Slip Modal */}
      {showBorrowModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h3 className="font-serif font-bold text-xl text-stone-900">Slip Peminjaman Buku</h3>
              <button
                onClick={() => setShowBorrowModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">Koleksi Terpilih</span>
              <h4 className="font-serif font-bold text-lg text-stone-900 leading-snug">{book.title}</h4>
              <p className="text-xs text-stone-600">Lokasi Rak: <strong className="text-stone-900">{book.rack_location}</strong></p>
            </div>

            {borrowSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium mb-4">
                {borrowSuccess}
              </div>
            )}

            {borrowError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-medium mb-4">
                {borrowError}
              </div>
            )}

            <form onSubmit={handleConfirmBorrow} className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-bold">
                  Identitas Peminjam
                </span>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-900">{user?.name}</span>
                  <span className="font-mono text-stone-500">{user?.member_code}</span>
                </div>
                <p className="text-[11px] text-stone-400">{user?.email}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-100/70 text-[11px] space-y-1 text-stone-600 border border-stone-200">
                <p>• Durasi Peminjaman: <strong className="text-stone-900">7 Hari</strong></p>
                <p>• Denda Keterlambatan: <strong className="text-stone-900">Rp 1.000 / hari</strong></p>
                <p>• Verifikasi pengambilan buku: Meja Sirkulasi Perpustakaan</p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBorrowModal(false)}
                  className="library-btn-secondary flex-1 py-2.5 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={borrowSubmitting}
                  className="library-btn-primary flex-1 py-2.5 text-xs font-semibold"
                >
                  {borrowSubmitting ? 'Memproses...' : 'Konfirmasi Peminjaman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
