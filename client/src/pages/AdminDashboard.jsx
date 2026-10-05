import { useState, useEffect } from 'react';
import { booksAPI, categoriesAPI, loansAPI, systemAPI } from '../services/api';
import BookForm from '../components/BookForm';
import { useAuth } from '../context/AuthContext';

const CONDITION_META = {
  BAIK: {
    label: 'Baik (Prima)',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-600',
    cardBorder: 'hover:border-emerald-300',
    description: 'Kondisi mulus, halaman lengkap, siap dipinjamkan.',
  },
  RUSAK_RINGAN: {
    label: 'Rusak Ringan',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
    cardBorder: 'hover:border-amber-300',
    description: 'Lipatan cover / coretan pensil minor, masih layak dibaca.',
  },
  PERBAIKAN: {
    label: 'Dalam Konservasi',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
    dotClass: 'bg-orange-500',
    cardBorder: 'hover:border-orange-300',
    description: 'Jilid lepas / punggung rusak, sedang di meja restorasi pustakawan.',
  },
  RUSAK_BERAT: {
    label: 'Rusak Berat',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    dotClass: 'bg-rose-600',
    cardBorder: 'hover:border-rose-300',
    description: 'Halaman robek parah / basah, ditarik dari sirkulasi peminjaman.',
  },
  HILANG: {
    label: 'Hilang / Missing',
    badgeClass: 'bg-stone-100 text-stone-700 border-stone-300',
    dotClass: 'bg-stone-500',
    cardBorder: 'hover:border-stone-400',
    description: 'Tidak ditemukan di rak saat stock opname berkala.',
  },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('books'); // 'books' | 'audit' | 'loans' | 'system'
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loans, setLoans] = useState([]);
  const [stats, setStats] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [conditionStats, setConditionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [loanMessage, setLoanMessage] = useState(null);

  // Stock Opname Audit Modal State
  const [auditModalBook, setAuditModalBook] = useState(null);
  const [auditForm, setAuditForm] = useState({ condition: 'BAIK', notes: '' });
  const [auditSubmitting, setAuditSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [booksRes, catsRes, loansRes, statsRes, sysRes, condStatsRes] = await Promise.all([
        booksAPI.getAll({ limit: 100 }),
        categoriesAPI.getAll().catch(() => ({ data: { data: [] } })),
        loansAPI.getAll({ limit: 50 }).catch(() => ({ data: { data: [] } })),
        loansAPI.getStats().catch(() => ({ data: { data: null } })),
        systemAPI.getStatus().catch(() => ({ data: { data: null } })),
        booksAPI.getConditionStats().catch(() => ({ data: null })),
      ]);

      if (booksRes?.data?.data) setBooks(booksRes.data.data);
      if (catsRes?.data?.data) setCategories(catsRes.data.data);
      if (loansRes?.data?.data) setLoans(loansRes.data.data);
      if (statsRes?.data?.data) setStats(statsRes.data.data);
      if (sysRes?.data?.data) setSystemStatus(sysRes.data.data);
      if (condStatsRes?.data) setConditionStats(condStatsRes.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreate = () => {
    setEditingBook(null);
    setShowForm(true);
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setShowForm(true);
  };

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(`Hapus koleksi "${title}" dari inventaris perpustakaan?`);
    if (!confirmed) return;

    try {
      await booksAPI.delete(id);
      setBooks(prev => prev.filter(b => b.id !== id));
      // Refresh condition stats
      const updatedStats = await booksAPI.getConditionStats().catch(() => null);
      if (updatedStats?.data) setConditionStats(updatedStats.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus buku');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      if (editingBook) {
        const res = await booksAPI.update(editingBook.id, formData);
        setBooks(prev => prev.map(b => b.id === editingBook.id ? res.data.data : b));
      } else {
        const res = await booksAPI.create(formData);
        setBooks(prev => [res.data.data, ...prev]);
      }
      setShowForm(false);
      setEditingBook(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan buku');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnBook = async (loanId, bookTitle) => {
    try {
      await loansAPI.returnBook(loanId, 'Buku diverifikasi kembali di meja sirkulasi');
      setLoanMessage(`Pengembalian buku "${bookTitle}" berhasil diverifikasi dan stok telah dipulihkan.`);
      setTimeout(() => setLoanMessage(null), 4000);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memproses pengembalian');
    }
  };

  // Stock Opname Audit Handlers
  const handleOpenAudit = (book) => {
    setAuditModalBook(book);
    setAuditForm({
      condition: book.physical_condition || 'BAIK',
      notes: book.condition_notes || '',
    });
  };

  const handleSaveAudit = async (e) => {
    e.preventDefault();
    if (!auditModalBook) return;

    try {
      setAuditSubmitting(true);
      const res = await booksAPI.updateCondition(auditModalBook.id, {
        physical_condition: auditForm.condition,
        condition_notes: auditForm.notes,
      });

      // Update book state locally
      setBooks(prev => prev.map(b => {
        if (b.id === auditModalBook.id) {
          return {
            ...b,
            physical_condition: res.data?.physical_condition || auditForm.condition,
            condition_notes: res.data?.condition_notes || auditForm.notes,
            last_inspected_at: res.data?.last_inspected_at || new Date().toISOString(),
          };
        }
        return b;
      }));

      // Refresh stats
      const updatedStats = await booksAPI.getConditionStats().catch(() => null);
      if (updatedStats?.data) setConditionStats(updatedStats.data);

      setLoanMessage(`Hasil audit fisik untuk "${auditModalBook.title}" berhasil diperbarui ke [${auditForm.condition}].`);
      setTimeout(() => setLoanMessage(null), 4000);
      setAuditModalBook(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan hasil audit fisik');
    } finally {
      setAuditSubmitting(false);
    }
  };

  const formatInspectionDate = (dateStr) => {
    if (!dateStr) return 'Belum pernah diaudit';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Filtering books
  const filteredBooks = books.filter(book => {
    const matchesSearch = !searchQuery || (
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.isbn && book.isbn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.rack_location && book.rack_location.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return matchesSearch;
  });

  // Physical books specifically for Stock Opname Audit
  const physicalBooks = books.filter(b => b.is_physical === 1);
  const filteredPhysicalBooks = physicalBooks.filter(book => {
    const matchesSearch = !searchQuery || (
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.isbn && book.isbn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.rack_location && book.rack_location.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const matchesCondition = conditionFilter === 'ALL' || (book.physical_condition || 'BAIK') === conditionFilter;

    return matchesSearch && matchesCondition;
  });

  const totalStock = books.reduce((sum, b) => sum + (b.stock || 0), 0);
  const digitalCount = books.filter(b => b.is_digital === 1).length;

  return (
    <div className="space-y-8">
      {/* Editorial Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-stone-500 font-bold mb-1">
            <span>Staf Pustakawan: {user?.name || 'Administrator'}</span>
            <span>•</span>
            <span>{user?.member_code || 'ADM-001'}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Meja Kerja Pustakawan
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
            Manajemen inventaris rak, monitoring kondisi fisik (stock opname), dan sirkulasi transaksi.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200 self-start md:self-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('books')}
            className={`px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'books'
                ? 'bg-stone-900 text-white shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Inventaris Buku ({books.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-amber-900 text-amber-50 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Audit & Stock Opname</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-full font-mono font-bold">
              {physicalBooks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'loans'
                ? 'bg-stone-900 text-white shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sirkulasi Pinjam ({loans.length})
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'system'
                ? 'bg-stone-900 text-white shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Engine Database
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="library-card p-5 space-y-1">
          <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">Total Judul</span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">{books.length}</p>
          <span className="text-[11px] text-stone-500 block">Koleksi terdaftar</span>
        </div>
        <div className="library-card p-5 space-y-1">
          <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">Eksemplar Fisik</span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-800">{totalStock}</p>
          <span className="text-[11px] text-emerald-700 block">Tersedia di rak</span>
        </div>
        <div className="library-card p-5 space-y-1">
          <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">Fisik Prima</span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700">{conditionStats?.baik || 0}</p>
          <span className="text-[11px] text-stone-500 block">Kondisi siap pinjam</span>
        </div>
        <div className="library-card p-5 space-y-1">
          <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">Konservasi / Rusak</span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-orange-700">
            {(conditionStats?.perbaikan || 0) + (conditionStats?.rusak_ringan || 0) + (conditionStats?.rusak_berat || 0)}
          </p>
          <span className="text-[11px] text-orange-600 block">Perlu perhatian</span>
        </div>
        <div className="library-card p-5 space-y-1 col-span-2 md:col-span-1">
          <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">Pinjaman Aktif</span>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-800">{stats?.activeLoans ?? loans.filter(l => l.status === 'ACTIVE').length}</p>
          <span className="text-[11px] text-amber-700 block">Di tangan anggota</span>
        </div>
      </div>

      {/* Notification Banner */}
      {loanMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center justify-between animate-fadeIn">
          <span>{loanMessage}</span>
          <button onClick={() => setLoanMessage(null)} className="text-emerald-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* TAB 1: INVENTORY & CATALOG */}
      {activeTab === 'books' && (
        <div className="library-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Cari berdasarkan judul, penulis, ISBN, atau rak..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="library-input text-xs py-2"
              />
            </div>
            <button
              onClick={handleCreate}
              className="library-btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>+</span>
              <span>Tambah Koleksi Baru</span>
            </button>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#FAF8F5] rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200">
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    {editingBook ? 'Perbarui Data Buku' : 'Tambah Entri Buku Baru'}
                  </h3>
                  <button
                    onClick={() => { setShowForm(false); setEditingBook(null); }}
                    className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1"
                  >
                    ✕
                  </button>
                </div>
                <BookForm
                  book={editingBook}
                  categories={categories}
                  onSubmit={handleSubmit}
                  onCancel={() => { setShowForm(false); setEditingBook(null); }}
                  loading={submitting}
                />
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-mono text-[10px] border-b border-stone-200">
                <tr>
                  <th className="p-3">Koleksi Buku</th>
                  <th className="p-3">Format & Rak</th>
                  <th className="p-3">Kondisi Fisik</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Stok</th>
                  <th className="p-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-400">
                      Tidak ada data koleksi yang sesuai dengan kata kunci.
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => {
                    const cond = CONDITION_META[book.physical_condition] || CONDITION_META.BAIK;
                    return (
                      <tr key={book.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-3">
                          <div className="font-serif font-bold text-stone-900 text-sm">{book.title}</div>
                          <div className="text-[11px] text-stone-500">{book.author} • {book.isbn || 'No ISBN'}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1.5 flex-wrap">
                            {book.is_physical === 1 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Fisik: {book.rack_location || 'Rak Umum'}
                              </span>
                            )}
                            {book.is_digital === 1 && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                                Digital (PDF)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          {book.is_physical === 1 ? (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cond.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cond.dotClass}`} />
                              <span>{cond.label}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-400 font-mono">Digital Asset</span>
                          )}
                        </td>
                        <td className="p-3 text-stone-600">{book.category_name || '-'}</td>
                        <td className="p-3 font-semibold">
                          {book.is_physical === 1 ? (
                            <span className={book.stock > 0 ? 'text-emerald-800' : 'text-rose-600'}>
                              {book.stock} exp
                            </span>
                          ) : (
                            <span className="text-stone-400">Digital</span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          {book.is_physical === 1 && (
                            <button
                              onClick={() => handleOpenAudit(book)}
                              className="px-2.5 py-1 text-xs rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 font-semibold transition-all"
                              title="Audit kondisi fisik & stock opname"
                            >
                              Audit
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(book)}
                            className="px-2.5 py-1 text-xs rounded-lg border border-stone-200 hover:bg-stone-50 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(book.id, book.title)}
                            className="px-2.5 py-1 text-xs rounded-lg text-rose-700 hover:bg-rose-50 font-medium"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT & STOCK OPNAME (PHYSICAL CONDITION MONITORING) */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Stock Opname Guide & Overview */}
          <div className="library-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-bold mb-2">
                  <span>Modul Preservasi & Konservasi Fisik</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  Stock Opname & Monitoring Kondisi Buku di Rak
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-3xl">
                  Fitur ini dirancang khusus untuk staf pustakawan melakukan audit inspeksi berkala pada rak fisik.
                  Identifikasi buku yang mengalami kerusakan cover, jilid lepas yang membutuhkan lem/re-binding di meja konservasi, atau eksemplar yang hilang dari rak.
                </p>
              </div>
            </div>

            {/* Interactive Condition Breakdown Cards (Click to filter) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              {Object.entries(CONDITION_META).map(([key, meta]) => {
                const count = conditionStats ? conditionStats[key.toLowerCase()] || 0 : 0;
                const total = conditionStats?.total_physical || 1;
                const pct = Math.round((count / total) * 100);
                const isSelected = conditionFilter === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setConditionFilter(isSelected ? 'ALL' : key)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'ring-2 ring-amber-800 bg-white shadow-md border-amber-800'
                        : 'bg-[#FAF8F5] border-stone-200 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${meta.dotClass}`} />
                      <span className="font-mono text-[10px] text-stone-400">{pct}%</span>
                    </div>
                    <p className="font-serif text-2xl font-bold text-stone-900">{count}</p>
                    <p className="text-xs font-semibold text-stone-700 mt-0.5">{meta.label}</p>
                    <span className="text-[10px] text-stone-400 block line-clamp-1 mt-1">
                      {meta.description}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Filter Bar & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-stone-200">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Filter berdasarkan judul, rak, atau catatan kerusakan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="library-input text-xs py-2"
                />
              </div>

              {/* Condition Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <button
                  onClick={() => setConditionFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    conditionFilter === 'ALL'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Semua ({physicalBooks.length})
                </button>
                {Object.entries(CONDITION_META).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setConditionFilter(key)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                      conditionFilter === key
                        ? 'bg-amber-900 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
                    <span>{meta.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Physical Inventory Audit Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase font-mono text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="p-3">Koleksi Rak</th>
                    <th className="p-3">Lokasi Rak</th>
                    <th className="p-3">Stok Eksemplar</th>
                    <th className="p-3">Status Kondisi Fisik</th>
                    <th className="p-3">Catatan Kerusakan & Konservasi</th>
                    <th className="p-3">Audit Terakhir</th>
                    <th className="p-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredPhysicalBooks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400">
                        Tidak ada eksemplar fisik yang sesuai dengan kriteria filter audit.
                      </td>
                    </tr>
                  ) : (
                    filteredPhysicalBooks.map((book) => {
                      const cond = CONDITION_META[book.physical_condition] || CONDITION_META.BAIK;
                      return (
                        <tr key={book.id} className="hover:bg-stone-50/50 transition-colors">
                          <td className="p-3">
                            <div className="font-serif font-bold text-stone-900 text-sm">{book.title}</div>
                            <div className="text-[11px] text-stone-500">{book.author} • {book.isbn || 'No ISBN'}</div>
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-xs font-semibold text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                              {book.rack_location || 'Rak Umum'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`font-semibold ${book.stock > 0 ? 'text-emerald-800' : 'text-rose-600'}`}>
                              {book.stock} exp
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cond.badgeClass}`}>
                              <span className={`w-2 h-2 rounded-full ${cond.dotClass}`} />
                              <span>{cond.label}</span>
                            </span>
                          </td>
                          <td className="p-3 max-w-xs">
                            <p className="text-stone-700 italic text-[11px] line-clamp-2">
                              {book.condition_notes || <span className="text-stone-400 not-italic">Tidak ada catatan kerusakan</span>}
                            </p>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-stone-500">
                            {formatInspectionDate(book.last_inspected_at)}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleOpenAudit(book)}
                              className="px-3 py-1.5 rounded-lg bg-amber-900 text-white hover:bg-amber-950 text-xs font-semibold transition-all shadow-sm flex items-center gap-1 ml-auto"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                              <span>Audit Fisik</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CIRCULATION & LOANS */}
      {activeTab === 'loans' && (
        <div className="library-card p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">Meja Transaksi Sirkulasi</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Verifikasi peminjaman fisik, jatuh tempo (7 hari), dan pemulihan stok buku saat dikembalikan.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase font-mono text-[10px] border-b border-stone-200">
                <tr>
                  <th className="p-3">Kode Pinjam</th>
                  <th className="p-3">Peminjam</th>
                  <th className="p-3">Buku & Rak</th>
                  <th className="p-3">Tgl Pinjam</th>
                  <th className="p-3">Jatuh Tempo</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {loans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-400">
                      Belum ada transaksi peminjaman tercatat dalam sistem.
                    </td>
                  </tr>
                ) : (
                  loans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-stone-900">{loan.loan_code}</td>
                      <td className="p-3">
                        <div className="font-semibold text-stone-900">{loan.user_name || 'Anggota'}</div>
                        <div className="text-[10px] text-stone-500 font-mono">{loan.member_code || '-'}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-stone-900">{loan.book_title}</div>
                        <div className="text-[10px] text-stone-500">{loan.rack_location || '-'}</div>
                      </td>
                      <td className="p-3 text-stone-600">{loan.borrow_date}</td>
                      <td className="p-3">
                        <span className={`font-semibold ${loan.status === 'ACTIVE' ? 'text-amber-800' : 'text-stone-400'}`}>
                          {loan.due_date}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          loan.status === 'ACTIVE'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {loan.status === 'ACTIVE' ? 'DIPINJAM' : 'SELESAI'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {loan.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleReturnBook(loan.id, loan.book_title)}
                            className="px-3 py-1 rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 text-xs font-semibold transition-all"
                          >
                            Buku Kembali
                          </button>
                        ) : (
                          <span className="text-[11px] text-stone-400">Kembali {loan.return_date}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM ENGINE */}
      {activeTab === 'system' && (
        <div className="library-card p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">Arsitektur Dual-Engine Database</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Penyimpanan lokal mandiri (offline-resilient) dan integrasi sinkronisasi cloud.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-3">
              <h4 className="font-bold text-stone-900 text-xs uppercase font-mono tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Mesin Database Aktif
              </h4>
              <div className="space-y-1.5 text-xs text-stone-600">
                <p>• Engine: <strong className="font-mono text-stone-900">{systemStatus?.activeEngine?.toUpperCase() || 'SQLITE'}</strong></p>
                <p>• Mode: <span className="font-semibold text-emerald-800">Offline-Ready (Lokal Mandiri)</span></p>
                <p>• Berkas DB: <span className="font-mono text-stone-500 break-all">{systemStatus?.sqlitePath || 'server/data/aksaraloka_local.db'}</span></p>
                <p className="text-[11px] text-stone-500 pt-1">
                  Katalog dan kasir sirkulasi dapat beroperasi tanpa jaringan internet eksternal.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-3">
              <h4 className="font-bold text-stone-900 text-xs uppercase font-mono tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-600" />
                Konektivitas Cloud (PostgreSQL / Supabase)
              </h4>
              <div className="space-y-1.5 text-xs text-stone-600">
                <p>• Status Cloud: {systemStatus?.isPostgresConnected ? 'Terhubung' : 'Standby / Fallback ke SQLite'}</p>
                <p>• Hubungkan Supabase: Atur <code className="bg-white px-1.5 py-0.5 rounded border border-stone-200 font-mono text-[11px]">DATABASE_URL</code> pada <code className="bg-white px-1.5 py-0.5 rounded border border-stone-200 font-mono text-[11px]">server/.env</code>.</p>
                <p className="text-[11px] text-stone-500 pt-1">
                  Database lokal SQLite otomatis menyimpan seluruh transaksi secara persisten.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STOCK OPNAME AUDIT MODAL */}
      {auditModalBook && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold block">
                  Inspeksi Fisik Rak
                </span>
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  Stock Opname Buku
                </h3>
              </div>
              <button
                onClick={() => setAuditModalBook(null)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Book Info Summary */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200 mb-5 space-y-1">
              <h4 className="font-serif font-bold text-stone-900 text-sm">{auditModalBook.title}</h4>
              <p className="text-xs text-stone-500">{auditModalBook.author} • {auditModalBook.isbn || 'No ISBN'}</p>
              <div className="flex items-center gap-3 pt-1 text-[11px]">
                <span className="font-semibold text-stone-700">Lokasi: <span className="font-mono text-stone-900">{auditModalBook.rack_location || 'Rak Umum'}</span></span>
                <span>•</span>
                <span className="font-semibold text-stone-700">Stok: <span className="font-mono text-emerald-800 font-bold">{auditModalBook.stock} exp</span></span>
              </div>
            </div>

            <form onSubmit={handleSaveAudit} className="space-y-5">
              {/* Condition Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Status Kondisi Fisik Saat Ini
                </label>
                <div className="space-y-2">
                  {Object.entries(CONDITION_META).map(([key, meta]) => (
                    <label
                      key={key}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        auditForm.condition === key
                          ? 'bg-amber-50/70 border-amber-800 shadow-sm'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="condition"
                        value={key}
                        checked={auditForm.condition === key}
                        onChange={(e) => setAuditForm(prev => ({ ...prev, condition: e.target.value }))}
                        className="mt-1 w-4 h-4 text-amber-800 focus:ring-amber-700"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} />
                          <span className="font-bold text-stone-900">{meta.label}</span>
                        </div>
                        <p className="text-stone-500 text-[11px] mt-0.5">{meta.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quick Preset Tags for Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Catatan Kerusakan / Konservasi
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    'Cover sudut terlipat',
                    'Jilid punggung lepas perlu lem',
                    'Halaman ada coretan pensil',
                    'Kondisi prima siap pinjam',
                    'Sampul plastik baru dipasang',
                    'Halaman 15-20 robek',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAuditForm(prev => ({
                        ...prev,
                        notes: prev.notes ? `${prev.notes}. ${preset}` : preset
                      }))}
                      className="text-[10px] px-2 py-0.5 bg-stone-100 hover:bg-stone-200 rounded-md text-stone-700 border border-stone-200 transition-colors"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
                <textarea
                  value={auditForm.notes}
                  onChange={(e) => setAuditForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Deskripsikan kondisi fisik buku atau riwayat restorasi..."
                  rows={3}
                  className="library-input text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setAuditModalBook(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={auditSubmitting}
                  className="library-btn-primary px-5 py-2 text-xs font-semibold"
                >
                  {auditSubmitting ? 'Menyimpan...' : 'Simpan Hasil Audit Fisik'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
