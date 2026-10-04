import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import { readerAPI, comicsAPI } from '../services/api';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';

export default function BookList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'local';
  const initialCategory = searchParams.get('category') || 'Semua';

  const [sourceMode, setSourceMode] = useState(initialTab); // 'local' | 'gutenberg' | 'comics'
  const { books, categories, pagination, loading, error, filters, setFilters } = useBooks();

  // Full-Text Open Source Books state (Project Gutenberg via public-apis)
  const [openBooks, setOpenBooks] = useState([]);
  const [openQuery, setOpenQuery] = useState('');
  const [openLoading, setOpenLoading] = useState(false);
  const [openTotal, setOpenTotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Comics & Manga state (MangaDex & XKCD via public-apis)
  const [comicsList, setComicsList] = useState([]);
  const [comicsLoading, setComicsLoading] = useState(false);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && (tab === 'local' || tab === 'gutenberg' || tab === 'comics')) {
      setSourceMode(tab);
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setSourceMode(newTab);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('tab', newTab);
      return p;
    });
  };

  const handleSearch = (searchValue, categoryId, sortBy, sortOrder, format = 'all') => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      search: searchValue,
      category_id: categoryId,
      format,
      sort_by: sortBy,
      sort_order: sortOrder,
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load Curated Full-Text Books from Project Gutenberg
  const loadOpenBooks = async (query = '', category = selectedCategory) => {
    try {
      setOpenLoading(true);
      if (!query || !query.trim()) {
        const catFilter = category === 'Semua' ? '' : category;
        const res = await readerAPI.getCurated(catFilter);
        setOpenBooks(res.data || []);
        setOpenTotal(res.data?.length || 0);
      } else {
        const res = await readerAPI.searchGutenberg(query.trim());
        setOpenBooks(res.data?.books || []);
        setOpenTotal(res.data?.total || 0);
      }
    } catch (err) {
      console.error('Gagal memuat buku terbuka:', err);
    } finally {
      setOpenLoading(false);
    }
  };

  // Load Curated Comics & Manga
  const loadComics = async () => {
    try {
      setComicsLoading(true);
      const res = await comicsAPI.getAll();
      setComicsList(res.data || []);
    } catch (err) {
      console.error('Gagal memuat galeri komik:', err);
    } finally {
      setComicsLoading(false);
    }
  };

  useEffect(() => {
    if (sourceMode === 'gutenberg') {
      loadOpenBooks(openQuery, selectedCategory);
    } else if (sourceMode === 'comics' && comicsList.length === 0) {
      loadComics();
    }
  }, [sourceMode, selectedCategory]);

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    setOpenQuery('');
    loadOpenBooks('', catName);
  };

  const handleOpenSearchSubmit = (e) => {
    e.preventDefault();
    loadOpenBooks(openQuery, selectedCategory);
  };

  const gutenbergCategories = [
    { name: 'Semua', label: 'Semua Kategori' },
    { name: 'Sains & Pengetahuan', label: 'Sains & Pengetahuan' },
    { name: 'Pendidikan & Belajar', label: 'Pendidikan & Belajar' },
    { name: 'Sejarah & Filsafat', label: 'Sejarah & Filsafat' },
    { name: 'Sastra & Klasik Dunia', label: 'Sastra Dunia' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Editorial Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-amber-800 font-bold">
          <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>Repositori Terbuka & Perpustakaan Digital</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          Katalog Koleksi & Galeri Digital
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-2xl">
          Akses koleksi perpustakaan fisik, naskah sains & pendidikan terlengkap dari repositori terbuka, atau baca komik & manga pilihan langsung di peramban web.
        </p>
      </div>

      {/* Source Mode Tabs (3 Distinct Sources) */}
      <div className="flex p-1.5 bg-stone-200/60 rounded-2xl w-full sm:w-fit text-xs font-semibold gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange('local')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            sourceMode === 'local'
              ? 'bg-stone-900 text-white shadow-sm font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>Koleksi Perpustakaan (Lokal & Rak)</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('gutenberg')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            sourceMode === 'gutenberg'
              ? 'bg-amber-900 text-white shadow-sm font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>Naskah Terbuka (Sains, Pendidikan, Sastra)</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('comics')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            sourceMode === 'comics'
              ? 'bg-purple-900 text-purple-50 shadow-sm font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Komik & Manga (Visual Reader)</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: LOCAL LIBRARY COLLECTION */}
      {/* ========================================================= */}
      {sourceMode === 'local' && (
        <div className="space-y-6">
          <SearchBar
            onSearch={handleSearch}
            categories={categories}
            initialValues={filters}
          />

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-4 border border-stone-200/80 animate-pulse space-y-3 shadow-sm"
                >
                  <div className="aspect-[3/4] bg-stone-200/70 rounded-xl" />
                  <div className="h-4 bg-stone-200/70 rounded-lg w-3/4" />
                  <div className="h-3 bg-stone-200/70 rounded-lg w-1/2" />
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="library-card p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto border border-stone-200">
                <svg className="w-7 h-7 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">Koleksi Tidak Ditemukan</h3>
              <p className="text-stone-500 text-sm max-w-md mx-auto">
                Tidak ada buku yang cocok dengan kriteria pencarian atau filter yang dipilih. Coba gunakan kata kunci lain.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: GUTENBERG OPEN REPOSITORY (CATEGORIZED FULL-TEXT) */}
      {/* ========================================================= */}
      {sourceMode === 'gutenberg' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-mono opacity-60 mr-1 shrink-0">Kategori:</span>
            {gutenbergCategories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => handleCategorySelect(cat.name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap ${
                  selectedCategory === cat.name
                    ? 'bg-amber-900 text-amber-50 font-bold shadow-sm'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="library-card p-4 sm:p-5">
            <form onSubmit={handleOpenSearchSubmit} className="flex gap-2">
              <input
                type="text"
                value={openQuery}
                onChange={(e) => setOpenQuery(e.target.value)}
                placeholder="Cari naskah terbuka (misal: Einstein, Montessori, Darwin, Plato, Sherlock)..."
                className="library-input"
              />
              <button
                type="submit"
                disabled={openLoading}
                className="library-btn-primary bg-amber-900 hover:bg-amber-800 text-amber-50 px-6 shrink-0 text-xs font-semibold"
              >
                {openLoading ? 'Mencari...' : 'Cari Naskah'}
              </button>
            </form>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Sumber API: <b>Project Gutenberg & Gutendex</b> (Kategori Terbuka)</span>
              </span>
              <span className="font-mono text-emerald-800 font-semibold inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                100% Naskah Lengkap Bab demi Bab di Web
              </span>
            </div>
          </div>

          {openLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="library-card p-4 animate-pulse space-y-3">
                  <div className="aspect-[3/4] bg-stone-200 rounded-xl" />
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {openBooks.map((book, idx) => (
                <article key={idx} className="library-card p-4 flex flex-col justify-between hover:border-amber-700/40 transition-all group">
                  <div>
                    <div className="relative aspect-[3/4] overflow-hidden rounded-r-xl rounded-l-sm shadow-book bg-stone-100 mb-3 border-l-4 border-stone-800/25">
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-2 left-2 bg-emerald-800/90 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-sm">
                        Full Text
                      </span>
                      {book.category && (
                        <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm text-amber-200 text-[10px] font-serif px-2 py-0.5 rounded shadow-sm">
                          {book.category}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-sm text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
                      {book.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-1 mt-1 font-medium">
                      {book.author}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      {book.published_year && (
                        <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                          {book.published_year > 0 ? book.published_year : `${Math.abs(book.published_year)} SM`}
                        </span>
                      )}
                      {book.total_chapters && (
                        <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 font-semibold">
                          {book.total_chapters} Bab
                        </span>
                      )}
                    </div>

                    {book.description && (
                      <p className="text-[11px] text-stone-600 line-clamp-2 mt-2 leading-relaxed">
                        {book.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-stone-100">
                    <Link
                      to={`/reader/gutenberg/${book.gutenberg_id}`}
                      className="w-full library-btn-primary bg-stone-900 hover:bg-stone-800 text-amber-50 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>Baca Langsung di Web</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: VISUAL COMICS & MANGA (MANGADEX & XKCD OPEN APIS) */}
      {/* ========================================================= */}
      {sourceMode === 'comics' && (
        <div className="space-y-6 animate-fade-in">
          {/* Comics Banner */}
          <div className="library-card p-5 bg-gradient-to-r from-purple-900/10 via-amber-900/5 to-transparent border-purple-200/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-purple-900 uppercase">
                  <svg className="w-3.5 h-3.5 text-purple-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Galeri Visual Komik & Webcomic</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-900 mt-0.5">
                  Manga Terbuka & Webcomic Sains Interaktif
                </h3>
                <p className="text-xs text-stone-600 max-w-xl mt-1 leading-relaxed">
                  Terintegrasi langsung dengan <b>MangaDex Open API</b> dan <b>XKCD Science Comics</b>. Dilengkapi antarmuka visual pembaca lembar demi lembar atau gulir webtoon vertikal.
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-mono font-bold">
                  {comicsList.length} Judul Komik Siap Baca
                </span>
              </div>
            </div>
          </div>

          {comicsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="library-card p-4 animate-pulse space-y-3">
                  <div className="aspect-[3/4] bg-stone-200 rounded-xl" />
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {comicsList.map((comic) => (
                <article key={comic.id} className="library-card p-4 flex flex-col justify-between hover:border-purple-600/40 transition-all group">
                  <div>
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-book bg-stone-100 mb-3 border border-stone-200">
                      <img
                        src={comic.cover_url}
                        alt={comic.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-2 left-2 bg-purple-900/90 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {comic.is_xkcd ? 'Webcomic' : 'Manga'}
                      </span>
                      {comic.language && (
                        <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-sm text-purple-200 text-[10px] font-mono px-2 py-0.5 rounded shadow-sm">
                          {comic.language}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-sm text-stone-900 group-hover:text-purple-900 transition-colors line-clamp-2 leading-snug">
                      {comic.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-1 mt-1 font-medium">
                      {comic.author}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      {comic.genre && (
                        <span className="text-[10px] font-serif text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60 font-semibold">
                          {comic.genre}
                        </span>
                      )}
                      {comic.total_pages && (
                        <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                          {comic.total_pages} Hal
                        </span>
                      )}
                    </div>

                    {comic.description && (
                      <p className="text-[11px] text-stone-600 line-clamp-2 mt-2 leading-relaxed">
                        {comic.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-stone-100">
                    <Link
                      to={`/reader/comic/${comic.id}`}
                      className="w-full library-btn-primary bg-purple-900 hover:bg-purple-800 text-purple-50 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Baca Komik di Web</span>
                      <span>→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
