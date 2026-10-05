import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loansAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MyLoans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loansAPI.getMyLoans()
      .then(res => {
        if (res?.data?.data) setLoans(res.data.data);
      })
      .catch(err => console.error('Error fetching personal loans:', err))
      .finally(() => setLoading(false));
  }, []);

  const activeLoans = loans.filter(l => l.status === 'ACTIVE');
  const returnedLoans = loans.filter(l => l.status === 'RETURNED');

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Member Header & Virtual Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-3">
          <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold">
            <span>ID Anggota Terverifikasi</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Peminjaman & Kartu Anggota
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            Tunjukkan kartu anggota Anda di meja sirkulasi untuk meminjam buku fisik, atau pantau sisa batas waktu pengembalian koleksi yang sedang Anda bawa pulang.
          </p>

          <div className="pt-2 flex items-center gap-6 text-xs text-stone-600">
            <div>
              <span className="text-stone-400 block font-mono text-[10px] uppercase">Buku Dipinjam</span>
              <span className="font-serif text-xl font-bold text-stone-900">{activeLoans.length}</span>
            </div>
            <div className="w-px h-8 bg-stone-200" />
            <div>
              <span className="text-stone-400 block font-mono text-[10px] uppercase">Total Riwayat</span>
              <span className="font-serif text-xl font-bold text-stone-900">{loans.length}</span>
            </div>
            <div className="w-px h-8 bg-stone-200" />
            <div>
              <span className="text-stone-400 block font-mono text-[10px] uppercase">Status Akun</span>
              <span className="font-semibold text-emerald-800">Aktif & Valid</span>
            </div>
          </div>
        </div>

        {/* Official Virtual Library Card */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 border border-stone-700/60 p-6 text-white shadow-xl relative space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] tracking-widest uppercase text-amber-400 font-bold font-mono">
                  KARTU ANGGOTA PERPUSTAKAAN
                </p>
                <p className="font-serif font-bold text-base text-stone-100">AksaraLoka Pustaka</p>
              </div>
              <img src="/favicon.svg" alt="AksaraLoka" className="w-8 h-8 rounded-lg shadow-sm" />
            </div>

            <div>
              <p className="text-[10px] text-stone-400 uppercase tracking-wider font-mono">Nama Lengkap</p>
              <p className="font-serif font-bold text-xl text-amber-50 tracking-wide">{user?.name || 'Nama Anggota'}</p>
              <p className="text-[11px] text-stone-400">{user?.email}</p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-end justify-between text-xs">
              <div>
                <p className="text-[9px] text-stone-400 uppercase font-mono">Nomor Kartu</p>
                <p className="font-mono font-bold text-sm tracking-wider text-amber-300">{user?.member_code || 'LIB-2026-001'}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-stone-400 uppercase font-mono">Berlaku Hingga</p>
                <p className="font-mono text-[11px] text-stone-300">Desember 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Borrowings Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Buku Yang Sedang Dipinjam ({activeLoans.length})
          </h2>
          <Link to="/books" className="text-xs font-semibold text-stone-700 hover:text-stone-900">
            + Tambah Koleksi Baru
          </Link>
        </div>

        {loading ? (
          <div className="library-card p-8 text-center text-xs text-stone-500 animate-pulse font-mono">
            Memuat daftar peminjaman...
          </div>
        ) : activeLoans.length === 0 ? (
          <div className="library-card p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto text-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Tidak Ada Peminjaman Aktif</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Saat ini Anda tidak memiliki buku fisik yang sedang dibawa pulang. Jelajahi katalog buku untuk meminjam koleksi baru.
            </p>
            <Link to="/books" className="library-btn-primary inline-block text-xs mt-2">
              Buka Katalog Koleksi
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoans.map((loan) => (
              <div
                key={loan.id}
                className="library-card p-5 flex gap-4 items-center justify-between border-stone-200"
              >
                <div className="flex gap-3.5 items-center">
                  <div className="w-14 h-20 rounded-lg overflow-hidden bg-stone-100 shadow-sm shrink-0 border border-stone-200">
                    <img
                      src={loan.book_cover || `https://picsum.photos/seed/${loan.book_isbn || loan.book_id}/200/300.jpg`}
                      alt={loan.book_title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-stone-400 block">{loan.loan_code}</span>
                    <h4 className="font-serif font-bold text-sm text-stone-900 line-clamp-1">{loan.book_title}</h4>
                    <p className="text-xs text-stone-500">Penulis: {loan.book_author || '-'}</p>
                    <p className="text-[11px] text-stone-600">
                      Lokasi: <span className="font-semibold text-stone-800">{loan.rack_location || 'Rak Umum'}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 block">
                    Batas: {loan.due_date}
                  </span>
                  <span className="text-[10px] text-stone-500 block">
                    Pinjam: {loan.borrow_date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Completed History */}
      {returnedLoans.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-stone-200">
          <h3 className="font-serif text-xl font-bold text-stone-800">
            Riwayat Pengembalian ({returnedLoans.length})
          </h3>
          <div className="overflow-x-auto library-card">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-mono text-[10px] border-b border-stone-200">
                <tr>
                  <th className="p-3">Kode Transaksi</th>
                  <th className="p-3">Judul Buku</th>
                  <th className="p-3">Tgl Pinjam</th>
                  <th className="p-3">Tgl Kembali</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {returnedLoans.map((loan) => (
                  <tr key={loan.id} className="text-stone-600 hover:bg-stone-50/50">
                    <td className="p-3 font-mono font-bold text-stone-900">{loan.loan_code}</td>
                    <td className="p-3 font-serif font-semibold text-stone-900">{loan.book_title}</td>
                    <td className="p-3">{loan.borrow_date}</td>
                    <td className="p-3">{loan.return_date || '-'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700">
                        Selesai
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
