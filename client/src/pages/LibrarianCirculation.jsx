import { useState, useEffect } from 'react';
import { loansAPI, booksAPI, usersAPI } from '../services/api';

export default function LibrarianCirculation() {
  const [loans, setLoans] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [returningId, setReturningId] = useState(null);

  // New loan modal
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [memberUsers, setMemberUsers] = useState([]);
  const [newLoanData, setNewLoanData] = useState({
    user_id: '',
    book_id: '',
    due_days: '14',
    notes: 'Dipinjam langsung di Meja Sirkulasi',
  });

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const [loansRes, statsRes] = await Promise.all([
        loansAPI.getAll({ status: statusFilter || undefined }),
        loansAPI.getStats(),
      ]);
      setLoans(loansRes.data?.data || []);
      setStats(statsRes.data?.data || null);
    } catch (err) {
      console.error('Gagal memuat sirkulasi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  const openNewLoanModal = async () => {
    try {
      const [booksRes, usersRes] = await Promise.all([
        booksAPI.getAll({ limit: 100 }),
        usersAPI.getAll({ limit: 100 }),
      ]);
      setAvailableBooks(booksRes.data?.data?.filter(b => b.stock > 0) || []);
      setMemberUsers(usersRes.data?.data?.filter(u => u.role === 'MEMBER') || []);
      setLoanModalOpen(true);
    } catch (err) {
      console.error('Gagal memuat data pilihan:', err);
    }
  };

  const handleReturnBook = async (loanId) => {
    try {
      const res = await loansAPI.returnBook(loanId, returnNotes || 'Kondisi buku baik dan lengkap');
      setActionMessage({ type: 'success', text: res.data?.message || 'Buku berhasil diverifikasi dan dikembalikan ke rak!' });
      setReturningId(null);
      setReturnNotes('');
      fetchLoans();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Gagal memproses pengembalian buku.',
      });
    }
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    if (!newLoanData.user_id || !newLoanData.book_id) {
      setActionMessage({ type: 'error', text: 'Pilih anggota dan buku yang akan dipinjam.' });
      return;
    }

    try {
      const borrowDate = new Date().toISOString().split('T')[0];
      const dueDays = parseInt(newLoanData.due_days) || 14;
      const dueDate = new Date(Date.now() + dueDays * 24 * 3600 * 1000).toISOString().split('T')[0];

      const res = await loansAPI.create({
        user_id: parseInt(newLoanData.user_id),
        book_id: parseInt(newLoanData.book_id),
        borrow_date: borrowDate,
        due_date: dueDate,
        notes: newLoanData.notes,
      });

      setActionMessage({ type: 'success', text: res.data?.message || 'Peminjaman berhasil dicatat!' });
      setLoanModalOpen(false);
      setNewLoanData({ user_id: '', book_id: '', due_days: '14', notes: 'Dipinjam langsung di Meja Sirkulasi' });
      fetchLoans();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Gagal mencatat peminjaman.',
      });
    }
  };

  const calculateDaysRemaining = (dueDateStr) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-amber-800 font-mono font-bold mb-1">
            <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>Meja Kerja Pustakawan</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
            Meja Sirkulasi & Verifikasi Pengembalian
          </h1>
          <p className="text-stone-600 text-sm mt-0.5">
            Layanan peminjaman buku fisik, pemeriksaan jatuh tempo, dan penerimaan kembali buku ke rak inventaris.
          </p>
        </div>

        <button
          onClick={openNewLoanModal}
          className="library-btn-primary bg-amber-900 hover:bg-amber-800 text-amber-50 flex items-center gap-2 self-start text-xs font-semibold"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Catat Peminjaman Baru
        </button>
      </div>

      {/* Circulation Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="library-card p-4">
            <span className="text-xs text-stone-500 font-medium">Total Riwayat Sirkulasi</span>
            <div className="font-serif text-2xl font-bold text-stone-900 mt-1">{stats.total || 0}</div>
          </div>
          <div className="library-card p-4 border-l-4 border-l-amber-600">
            <span className="text-xs text-stone-500 font-medium">Buku Sedang Dipinjam</span>
            <div className="font-serif text-2xl font-bold text-amber-800 mt-1">{stats.active || 0}</div>
          </div>
          <div className="library-card p-4 border-l-4 border-l-rose-600">
            <span className="text-xs text-stone-500 font-medium">Keterlambatan (Overdue)</span>
            <div className="font-serif text-2xl font-bold text-rose-700 mt-1">{stats.overdue || 0}</div>
          </div>
          <div className="library-card p-4 border-l-4 border-l-emerald-600">
            <span className="text-xs text-stone-500 font-medium">Telah Dikembalikan</span>
            <div className="font-serif text-2xl font-bold text-emerald-800 mt-1">{stats.returned || 0}</div>
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {actionMessage && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between ${
          actionMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="font-bold ml-4">✕</button>
        </div>
      )}

      {/* Status Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: '', label: 'Semua Transaksi' },
          { id: 'ACTIVE', label: 'Sedang Dipinjam' },
          { id: 'OVERDUE', label: 'Terlambat' },
          { id: 'RETURNED', label: 'Sudah Kembali' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === tab.id
                ? 'bg-amber-900 text-amber-100 shadow-sm'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Circulation Table */}
      <div className="library-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-stone-700 uppercase font-mono tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="p-4 font-bold">Buku & Lokasi Rak</th>
                <th className="p-4 font-bold">Peminjam</th>
                <th className="p-4 font-bold">Tenggat Waktu</th>
                <th className="p-4 font-bold">Denda</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-stone-500">
                    Memuat antrean sirkulasi...
                  </td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-stone-500">
                    Tidak ada catatan transaksi peminjaman pada filter ini.
                  </td>
                </tr>
              ) : (
                loans.map(loan => {
                  const daysRemaining = calculateDaysRemaining(loan.due_date);
                  const isLate = loan.status === 'ACTIVE' && daysRemaining !== null && daysRemaining < 0;

                  return (
                    <tr key={loan.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-stone-900 line-clamp-1">{loan.book_title}</div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <span>{loan.book_author}</span>
                          <span>•</span>
                          <span className="font-mono text-amber-800">{loan.rack_location || 'Rak Standar'}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-stone-900">{loan.user_name}</div>
                        <div className="font-mono text-[10px] text-stone-400">{loan.member_code}</div>
                      </td>

                      <td className="p-4 font-mono">
                        <div>Jatuh Tempo: {loan.due_date}</div>
                        {loan.status === 'ACTIVE' && (
                          <div className={`text-[11px] font-semibold mt-0.5 ${
                            isLate ? 'text-rose-600' : daysRemaining <= 3 ? 'text-amber-700' : 'text-emerald-700'
                          }`}>
                            {isLate
                              ? `Telat ${Math.abs(daysRemaining)} hari`
                              : `${daysRemaining} hari lagi`}
                          </div>
                        )}
                        {loan.return_date && (
                          <div className="text-[10px] text-stone-400">Kembali: {loan.return_date}</div>
                        )}
                      </td>

                      <td className="p-4 font-mono">
                        {loan.fine_amount > 0 ? (
                          <span className="text-rose-700 font-bold">
                            Rp {loan.fine_amount.toLocaleString('id-ID')}
                          </span>
                        ) : (
                          <span className="text-stone-400">Rp 0</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          loan.status === 'RETURNED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : isLate
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-900 border border-amber-200'
                        }`}>
                          {loan.status === 'RETURNED' ? 'Dikembalikan' : isLate ? 'Terlambat' : 'Dipinjam'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {loan.status === 'ACTIVE' ? (
                          returningId === loan.id ? (
                            <div className="flex flex-col items-end gap-1.5 animate-fade-in">
                              <input
                                type="text"
                                placeholder="Catatan kondisi buku..."
                                value={returnNotes}
                                onChange={(e) => setReturnNotes(e.target.value)}
                                className="library-input py-1 text-xs w-48"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setReturningId(null)}
                                  className="library-btn-secondary px-2 py-1 text-[11px]"
                                >
                                  Batal
                                </button>
                                <button
                                  onClick={() => handleReturnBook(loan.id)}
                                  className="library-btn-primary bg-emerald-800 hover:bg-emerald-900 text-white px-2.5 py-1 text-[11px]"
                                >
                                  Konfirmasi
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setReturningId(loan.id); setReturnNotes(''); }}
                              className="library-btn-secondary px-3 py-1.5 text-xs font-semibold text-stone-800 hover:border-amber-700"
                            >
                              Verifikasi Kembali
                            </button>
                          )
                        ) : (
                          <span className="text-stone-400 text-xs">Selesai</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Catat Peminjaman */}
      {loanModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-bold text-stone-900">Catat Peminjaman Buku Fisik</h3>
              <button onClick={() => setLoanModalOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Pilih Anggota Perpustakaan *</label>
                <select
                  required
                  value={newLoanData.user_id}
                  onChange={(e) => setNewLoanData(p => ({ ...p, user_id: e.target.value }))}
                  className="library-input cursor-pointer"
                >
                  <option value="">-- Pilih Anggota --</option>
                  {memberUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.member_code}) - {u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Pilih Buku Fisik Tersedia *</label>
                <select
                  required
                  value={newLoanData.book_id}
                  onChange={(e) => setNewLoanData(p => ({ ...p, book_id: e.target.value }))}
                  className="library-input cursor-pointer"
                >
                  <option value="">-- Pilih Buku --</option>
                  {availableBooks.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title} (Stok: {b.stock}) - Lokasi: {b.rack_location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Durasi Pinjam (Hari)</label>
                  <input
                    type="number"
                    value={newLoanData.due_days}
                    onChange={(e) => setNewLoanData(p => ({ ...p, due_days: e.target.value }))}
                    className="library-input"
                    min="1"
                    max="30"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Catatan Tambahan</label>
                  <input
                    type="text"
                    value={newLoanData.notes}
                    onChange={(e) => setNewLoanData(p => ({ ...p, notes: e.target.value }))}
                    className="library-input"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setLoanModalOpen(false)}
                  className="library-btn-secondary px-4 py-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="library-btn-primary bg-amber-900 hover:bg-amber-800 text-amber-50 px-5 py-2 font-semibold"
                >
                  Ajukan Peminjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
