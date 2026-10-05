import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { comicsAPI } from '../services/api';

export default function ComicReader() {
  const { comicId, chapterId } = useParams();
  const navigate = useNavigate();

  const [comicInfo, setComicInfo] = useState(null);
  const [pagesData, setPagesData] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentChapterId, setCurrentChapterId] = useState(chapterId || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reader Modes
  const [viewMode, setViewMode] = useState(localStorage.getItem('comic_view_mode') || 'single'); // 'single' | 'webtoon'
  const [zoomFit, setZoomFit] = useState(localStorage.getItem('comic_zoom_fit') || 'width'); // 'width' | 'contain'
  const [showChapterMenu, setShowChapterMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);

  // Load comic metadata and chapters
  useEffect(() => {
    const fetchComic = async () => {
      try {
        setLoading(true);
        setError(null);

        const targetId = comicId || 'd90ea6cb-7bc3-4d80-8af0-28557e6c4e17';
        const detailRes = await comicsAPI.getDetail(targetId);
        if (detailRes?.data) {
          setComicInfo(detailRes.data);
          const activeChapId = chapterId || detailRes.data.default_chapter_id || detailRes.data.chapters?.[0]?.id;
          setCurrentChapterId(activeChapId);
        } else {
          setError('Komik tidak ditemukan.');
        }
      } catch (err) {
        console.error('Gagal memuat info komik:', err);
        setError(err?.response?.data?.message || err?.message || 'Gagal memuat data komik.');
      }
    };

    fetchComic();
  }, [comicId]);

  // Load chapter pages whenever currentChapterId changes
  useEffect(() => {
    if (!currentChapterId) return;

    const fetchPages = async () => {
      try {
        setLoading(true);
        setError(null);
        setCurrentPageIndex(0);

        const res = await comicsAPI.getChapterPages(currentChapterId);
        if (res?.data && res.data.pages && res.data.pages.length > 0) {
          setPagesData(res.data);
        } else {
          setError('Halaman bab komik ini belum tersedia.');
        }
      } catch (err) {
        console.error('Gagal mengambil halaman komik:', err);
        setError(err?.response?.data?.message || err?.message || 'Gagal memuat halaman bab komik.');
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [currentChapterId]);

  // Preload next images for instant flipping
  useEffect(() => {
    if (!pagesData?.pages) return;
    const nextIdx = currentPageIndex + 1;
    if (nextIdx < pagesData.pages.length) {
      const img1 = new Image();
      img1.src = pagesData.pages[nextIdx].url;
    }
    const nextIdx2 = currentPageIndex + 2;
    if (nextIdx2 < pagesData.pages.length) {
      const img2 = new Image();
      img2.src = pagesData.pages[nextIdx2].url;
    }
  }, [currentPageIndex, pagesData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        if (pagesData?.pages && currentPageIndex < pagesData.pages.length - 1) {
          setCurrentPageIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentPageIndex > 0) {
          setCurrentPageIndex(prev => prev - 1);
        }
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pagesData, currentPageIndex]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const totalPages = pagesData?.pages?.length || 1;
  const currentPage = pagesData?.pages?.[currentPageIndex];

  return (
    <div className="min-h-screen bg-[#111113] text-zinc-100 -mx-4 sm:-mx-6 lg:-mx-8 -my-8 sm:-my-10 px-4 sm:px-6 lg:px-8 pb-16 flex flex-col">
      {/* Top Controls Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#18181B]/95 border-b border-zinc-800 transition-colors">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Back & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/books?tab=comics')}
              className="p-1.5 rounded-xl hover:bg-white/10 transition-colors shrink-0 text-zinc-400 hover:text-white"
              title="Kembali ke Galeri Komik"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="font-serif font-bold text-sm sm:text-base leading-tight truncate text-zinc-100">
                {comicInfo?.title || 'Komik & Manga'}
              </h1>
              <p className="text-[11px] text-zinc-400 truncate font-mono">
                {pagesData?.title || `Halaman ${currentPageIndex + 1} dari ${totalPages}`}
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle: Single Page vs Webtoon */}
            <button
              onClick={() => {
                const nextMode = viewMode === 'single' ? 'webtoon' : 'single';
                setViewMode(nextMode);
                localStorage.setItem('comic_view_mode', nextMode);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-medium transition-colors hidden sm:flex items-center gap-1.5 text-zinc-300"
              title="Ganti Mode Tampilan (Per Halaman vs Gulir Vertikal)"
            >
              <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <span>{viewMode === 'single' ? 'Mode Halaman' : 'Mode Webtoon'}</span>
            </button>

            {/* Chapters Drawer Toggle */}
            {comicInfo?.chapters && comicInfo.chapters.length > 1 && (
              <button
                onClick={() => setShowChapterMenu(!showChapterMenu)}
                className="px-2.5 py-1.5 rounded-xl bg-amber-900/60 border border-amber-700/50 hover:bg-amber-800/80 text-xs font-semibold text-amber-200 transition-colors flex items-center gap-1"
              >
                <span>Pilih Bab</span>
                <span className="text-[10px] opacity-75 font-mono">({comicInfo.chapters.length})</span>
              </button>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              title="Layar Penuh (F)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar for Single Mode */}
        {viewMode === 'single' && (
          <div className="w-full h-1 bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-200"
              style={{ width: `${Math.round(((currentPageIndex + 1) / totalPages) * 100)}%` }}
            />
          </div>
        )}
      </header>

      {/* Main Comic Canvas */}
      <main
        ref={containerRef}
        className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6 max-w-4xl mx-auto w-full"
      >
        {loading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
            <p className="text-zinc-400 text-xs font-mono">Memuat lembar komik visual dari CDN...</p>
          </div>
        ) : error ? (
          <div className="max-w-md my-16 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 text-rose-300 border border-rose-800/50 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="font-serif text-xl font-bold text-zinc-100">Gagal Membuka Komik</h2>
            <p className="text-zinc-400 text-xs leading-relaxed">{error}</p>
            <button
              onClick={() => navigate('/books?tab=comics')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl"
            >
              Kembali ke Galeri Komik
            </button>
          </div>
        ) : viewMode === 'webtoon' ? (
          /* Webtoon Continuous Scroll Mode */
          <div className="space-y-2 w-full max-w-2xl mx-auto animate-fade-in">
            {pagesData.pages.map((p, idx) => (
              <div key={idx} className="relative flex flex-col items-center bg-zinc-950 rounded-lg overflow-hidden shadow-2xl border border-zinc-800/60">
                <img
                  src={p.url}
                  alt={`Halaman ${idx + 1}`}
                  loading="lazy"
                  className="w-full h-auto object-contain select-none"
                />
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-zinc-300">
                  {idx + 1} / {totalPages}
                </span>
                {p.caption && (
                  <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 text-xs text-amber-200 text-center font-mono flex items-center justify-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{p.caption}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Single Page View Mode */
          <div className="flex flex-col items-center justify-center w-full animate-fade-in">
            {/* The Image Viewer Canvas */}
            <div className="relative group max-w-full flex items-center justify-center">
              {currentPage ? (
                <div className="relative bg-zinc-950 border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl flex flex-col items-center">
                  <img
                    src={currentPage.url}
                    alt={`Halaman ${currentPageIndex + 1}`}
                    className={`max-h-[82vh] w-auto object-contain select-none transition-transform duration-150`}
                    onClick={(e) => {
                      // Tap right half to go next, tap left half to go prev
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      if (x > rect.width / 2) {
                        if (currentPageIndex < totalPages - 1) setCurrentPageIndex(p => p + 1);
                      } else {
                        if (currentPageIndex > 0) setCurrentPageIndex(p => p - 1);
                      }
                    }}
                  />

                  {/* XKCD Alt text caption banner */}
                  {currentPage.caption && (
                    <div className="w-full p-3.5 bg-zinc-900 border-t border-zinc-800 text-center text-xs text-amber-300 font-mono flex items-center justify-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Catatan Strip: "{currentPage.caption}"</span>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Left/Right Floating Overlay Buttons */}
              <button
                onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                disabled={currentPageIndex === 0}
                className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-amber-600 disabled:opacity-20 text-white flex items-center justify-center transition-all shadow-lg backdrop-blur-sm"
                title="Halaman Sebelumnya (←)"
              >
                ‹
              </button>
              <button
                onClick={() => setCurrentPageIndex(Math.min(totalPages - 1, currentPageIndex + 1))}
                disabled={currentPageIndex >= totalPages - 1}
                className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-amber-600 disabled:opacity-20 text-white flex items-center justify-center transition-all shadow-lg backdrop-blur-sm"
                title="Halaman Berikutnya (→)"
              >
                ›
              </button>
            </div>

            {/* Bottom Slider / Pagination */}
            <div className="mt-6 flex items-center justify-between gap-4 w-full max-w-md px-4">
              <button
                onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                disabled={currentPageIndex === 0}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-xs font-semibold transition-colors"
              >
                ← Prev
              </button>

              <div className="text-center font-mono text-xs text-zinc-300">
                <span className="font-bold text-amber-400">{currentPageIndex + 1}</span>
                <span className="opacity-50"> / {totalPages}</span>
              </div>

              <button
                onClick={() => setCurrentPageIndex(Math.min(totalPages - 1, currentPageIndex + 1))}
                disabled={currentPageIndex >= totalPages - 1}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-30 text-zinc-950 font-bold text-xs transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Chapters Drawer Modal */}
      {showChapterMenu && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full max-w-sm h-full bg-[#18181B] text-zinc-100 p-5 shadow-2xl flex flex-col border-l border-zinc-800">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="font-serif font-bold text-base">Pilihan Bab Komik</h3>
                <p className="text-[11px] text-zinc-400 font-mono">{comicInfo?.title}</p>
              </div>
              <button
                onClick={() => setShowChapterMenu(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-1.5">
              {comicInfo?.chapters?.map((ch) => {
                const isCurrent = currentChapterId === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setCurrentChapterId(ch.id);
                      setShowChapterMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-amber-600 text-zinc-950 font-bold shadow-md'
                        : 'hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <span className="truncate pr-2">{ch.title}</span>
                    <span className="text-[10px] opacity-75 font-mono shrink-0">
                      {ch.pages_count} hal
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
