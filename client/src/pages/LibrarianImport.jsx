import { useState, useEffect } from 'react';
import { openLibraryAPI } from '../services/api';

export default function LibrarianImport() {
  const [searchQuery, setSearchQuery] = useState('');
  const [subject, setSubject] = useState('literature');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalFound, setTotalFound] = useState(0);
  const [importingKey, setImportingKey] = useState(null);
  const [notification, setNotification] = useState(null);

  // Quick subject presets
  const subjectPresets = [
    { id: 'literature', label: 'Sastra & Cerita' },
    { id: 'science', label: 'Sains & Alam' },
    { id: 'history', label: 'Sejarah Dunia' },
    { id: 'technology', label: 'Teknologi & Komputer' },
    { id: 'philosophy', label: 'Filsafat' },
    { id: 'biography', label: 'Biografi' },
  ];

  const fetchTrending = async (targetSubject) => {
    try {
      setLoading(true);
      setNotification(null);
      const res = await openLibraryAPI.getTrending(targetSubject, 16);
      setResults(res.data?.books || []);
      setTotalFound(res.data?.totalFound || 0);
    } catch (err) {
      console.error('Gagal memuat Open Library trending:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      fetchTrending(subject);
      return;
    }

    try {
      setLoading(true);
      setNotification(null);
      const res = await openLibraryAPI.search(searchQuery.trim(), 16);
      setResults(res.data?.books || []);
      setTotalFound(res.data?.totalFound || 0);
    } catch (err) {
      console.error('Gagal mencari di Open Library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending(subject);
  }, [subject]);

  const handleImportBook = async (book) => {
    setImportingKey(book.openlibrary_work_id || book.title);
    try {
      const res = await openLibraryAPI.importBook(book, {
        rackLocation: `Rak Terbuka OL-${(book.published_year || 2024).toString().slice(-2)}`,
        stock: 3,
        isPhysical: true,
        isDigital: true,
      });

      if (res.alreadyExists) {
        setNotification({
          type: 'info',
          text: res.message,
        });
      } else {
        setNotification({
          type: 'success',
          text: `${res.message} (Dialokasikan di ${res.book.rack_location})`,
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        text: err?.response?.data?.message || 'Gagal mengimpor buku ke perpustakaan.',
      });
    } finally {
      setImportingKey(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-amber-800 font-mono font-bold mb-1">
            <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Integrasi GitHub Public-APIs</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
            Impor Koleksi dari Open Library REST API
          </h1>
          <p className="text-stone-600 text-sm mt-0.5 max-w-2xl">
            Jelajahi jutaan karya buku digital dan naskah terbuka dari Internet Archive. Pustakawan dapat mengimpor metadata buku langsung ke katalog lokal dengan satu klik.
          </p>
        </div>

        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 self-start sm:self-auto shrink-0 font-medium">
          <div className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-amber-800 font-mono">
            <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>Open Library Engine</span>
          </div>
          <p className="text-[11px] text-stone-600 mt-0.5">openlibrary.org (Internet Archive)</p>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between animate-fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : notification.type === 'info'
            ? 'bg-sky-50 text-sky-800 border border-sky-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="font-bold ml-4">✕</button>
        </div>
      )}

      {/* Search and Subject Filter */}
      <div className="library-card p-5 sm:p-6 space-y-4">
        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul buku, penulis dunia, atau kata kunci (contoh: Pramoedya, Artificial Intelligence, Hamlet)..."
              className="library-input pl-10"
            />
            <svg className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="library-btn-primary bg-amber-900 hover:bg-amber-800 text-amber-50 px-6 shrink-0 flex items-center gap-2"
          >
            {loading ? 'Mencari...' : 'Jelajahi API'}
          </button>
        </form>

        {/* Preset Subjects */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-xs text-stone-500 font-semibold">Kategori Populer:</span>
          {subjectPresets.map(p => (
            <button
              key={p.id}
              onClick={() => {
                setSearchQuery('');
                setSubject(p.id);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                subject === p.id && !searchQuery
                  ? 'bg-stone-900 text-amber-100 font-bold shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          Ditemukan <b className="text-stone-900 font-serif text-sm">{totalFound.toLocaleString('id-ID')}</b> karya di Open Library
        </span>
        <span className="font-mono text-[11px]">Format: E-Book & Naskah Digital</span>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="library-card p-4 animate-pulse space-y-3">
              <div className="aspect-[3/4] bg-stone-200 rounded-xl" />
              <div className="h-4 bg-stone-200 rounded w-3/4" />
              <div className="h-3 bg-stone-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="library-card p-12 text-center space-y-3">
          <p className="font-serif text-lg text-stone-700">Tidak ada buku yang ditemukan dari Open Library.</p>
          <p className="text-xs text-stone-500">Coba gunakan kata kunci pencarian yang lebih umum.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((book, idx) => {
            const isImporting = importingKey === (book.openlibrary_work_id || book.title);

            return (
              <div key={idx} className="library-card p-4 flex flex-col justify-between hover:border-amber-700/40 transition-all">
                <div>
                  {/* Book Cover */}
                  <div className="relative aspect-[3/4] overflow-hidden rounded-r-xl rounded-l-sm shadow-book bg-stone-100 mb-3 border-l-4 border-stone-800/20">
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-stone-900/90 text-amber-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-sm">
                        OL
                      </span>
                    </div>
                  </div>

                  {/* Title & Author */}
                  <h3 className="font-serif font-bold text-sm text-stone-900 line-clamp-2 leading-snug">
                    {book.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-1 mt-1 font-medium">
                    {book.author}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    {book.published_year && (
                      <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                        Tahun {book.published_year}
                      </span>
                    )}
                    {book.edition_count > 1 && (
                      <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                        {book.edition_count} Edisi
                      </span>
                    )}
                  </div>
                </div>

                {/* Import Action Button */}
                <div className="pt-3 mt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleImportBook(book)}
                    disabled={isImporting}
                    className="w-full library-btn-primary bg-amber-900 hover:bg-amber-800 text-amber-50 py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    {isImporting ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Impor ke Katalog</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
