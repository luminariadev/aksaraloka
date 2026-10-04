import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { readerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Reader() {
  const { id, gutenbergId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bookData, setBookData] = useState(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reader Preferences (Persisted in localStorage)
  const [theme, setTheme] = useState(localStorage.getItem('reader_theme') || 'sepia'); // 'sepia' | 'paper' | 'dark' | 'forest'
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem('reader_font_size')) || 18);
  const [fontFamily, setFontFamily] = useState(localStorage.getItem('reader_font_family') || 'serif'); // 'serif' | 'sans'
  const [textAlign, setTextAlign] = useState(localStorage.getItem('reader_text_align') || 'justify'); // 'justify' | 'left'
  const [lineHeight, setLineHeight] = useState(localStorage.getItem('reader_line_height') || 'relaxed'); // 'relaxed' | 'loose'
  const [showToc, setShowToc] = useState(false);
  const [tocFilter, setTocFilter] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const contentRef = useRef(null);

  // Load book content
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);

        let res;
        if (gutenbergId) {
          res = await readerAPI.getGutenbergBook(gutenbergId);
        } else {
          res = await readerAPI.getBookContent(id);
        }

        if (res?.data && res.data.chapters && res.data.chapters.length > 0) {
          setBookData(res.data);
          setCurrentChapterIndex(0);
        } else {
          setError('Naskah buku tidak memiliki bab yang dapat dibaca.');
        }
      } catch (err) {
        console.error('Gagal memuat buku digital:', err);
        setError(err?.response?.data?.message || err?.message || 'Gagal memuat naskah buku digital.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id, gutenbergId]);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem('reader_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('reader_font_size', String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('reader_font_family', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('reader_text_align', textAlign);
  }, [textAlign]);

  useEffect(() => {
    localStorage.setItem('reader_line_height', lineHeight);
  }, [lineHeight]);

  // Auto scroll to top of chapter on chapter change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Save reading progress to database
    if (bookData && bookData.chapters && bookData.chapters.length > 0) {
      const progressPercent = Math.round(((currentChapterIndex + 1) / bookData.chapters.length) * 100);
      readerAPI.saveProgress({
        user_id: user?.id,
        book_id: bookData.book_id || id || gutenbergId,
        last_chapter: currentChapterIndex + 1,
        progress_percent: progressPercent,
      }).catch(() => {});
    }
  }, [currentChapterIndex, bookData]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (bookData?.chapters && currentChapterIndex < bookData.chapters.length - 1) {
          setCurrentChapterIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentChapterIndex > 0) {
          setCurrentChapterIndex(prev => prev - 1);
        }
      } else if (e.key.toLowerCase() === 't') {
        setShowToc(prev => !prev);
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bookData, currentChapterIndex]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const currentChapter = bookData?.chapters?.[currentChapterIndex] || null;
  const totalChapters = bookData?.chapters?.length || 1;
  const progressPercent = Math.round(((currentChapterIndex + 1) / totalChapters) * 100);

  // Theme styling configurations
  const themeStyles = {
    sepia: {
      bg: 'bg-[#FBF0D9]',
      text: 'text-[#3B2D20]',
      border: 'border-[#E6D5BD]',
      toolbarBg: 'bg-[#F5E6CC]/95',
      toolbarBorder: 'border-[#E2CEB0]',
      cardBg: 'bg-[#F3E3C7]',
      accent: 'text-amber-900',
      activeTab: 'bg-amber-900 text-amber-50',
      dropCapColor: 'text-amber-900',
      divider: 'border-amber-950/15',
    },
    paper: {
      bg: 'bg-[#FAFAF9]',
      text: 'text-[#1C1917]',
      border: 'border-stone-200',
      toolbarBg: 'bg-white/95',
      toolbarBorder: 'border-stone-200',
      cardBg: 'bg-stone-100',
      accent: 'text-stone-900',
      activeTab: 'bg-stone-900 text-stone-50',
      dropCapColor: 'text-stone-900',
      divider: 'border-stone-200',
    },
    dark: {
      bg: 'bg-[#121214]',
      text: 'text-[#E4E4E7]',
      border: 'border-zinc-800',
      toolbarBg: 'bg-[#18181B]/95',
      toolbarBorder: 'border-zinc-800',
      cardBg: 'bg-[#202024]',
      accent: 'text-amber-300',
      activeTab: 'bg-amber-500 text-zinc-950 font-bold',
      dropCapColor: 'text-amber-400',
      divider: 'border-zinc-800',
    },
    forest: {
      bg: 'bg-[#0F1714]',
      text: 'text-[#D5E3DC]',
      border: 'border-[#1C2C26]',
      toolbarBg: 'bg-[#14201C]/95',
      toolbarBorder: 'border-[#1E332B]',
      cardBg: 'bg-[#182823]',
      accent: 'text-emerald-300',
      activeTab: 'bg-emerald-600 text-white font-bold',
      dropCapColor: 'text-emerald-400',
      divider: 'border-emerald-900/40',
    },
  }[theme] || themeStyles.sepia;

  // Filtered TOC list
  const filteredChapters = (bookData?.chapters || []).filter((ch, idx) => {
    if (!tocFilter.trim()) return true;
    const q = tocFilter.toLowerCase();
    return ch.title.toLowerCase().includes(q) || String(idx + 1).includes(q);
  });

  if (loading) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center space-y-5 animate-fade-in">
        <div className="w-14 h-14 rounded-full border-4 border-amber-800/20 border-t-amber-800 animate-spin" />
        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-bold text-stone-900">Menyusun Naskah Lengkap...</h2>
          <p className="text-stone-500 text-xs max-w-md mx-auto leading-relaxed">
            Mengambil teks asli, memecah bab dan paragraf secara utuh dari repositori publik (Project Gutenberg / Open Library).
          </p>
        </div>
      </div>
    );
  }

  if (error || !bookData) {
    return (
      <div className="max-w-md mx-auto my-16 library-card p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900">Naskah Tidak Tersedia</h2>
        <p className="text-stone-600 text-xs leading-relaxed">{error || 'Data naskah tidak ditemukan.'}</p>
        <div className="pt-2">
          <button
            onClick={() => navigate('/books')}
            className="library-btn-primary px-5 py-2.5 text-xs font-semibold"
          >
            Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeStyles.bg} ${themeStyles.text} transition-colors duration-300 pb-24 -mx-4 sm:-mx-6 lg:-mx-8 -my-8 sm:-my-10 px-4 sm:px-6 lg:px-8`}>
      {/* Sticky Top Toolbar */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${themeStyles.toolbarBorder} ${themeStyles.toolbarBg} transition-colors`}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Back & Title info */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
              title="Kembali ke Halaman Sebelumnya"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="font-serif font-bold text-xs sm:text-base leading-tight truncate">
                {bookData.title}
              </h1>
              <p className="text-[10px] sm:text-xs opacity-70 truncate">
                {bookData.author}
              </p>
            </div>
          </div>

          {/* Center / Quick Chapter Dropdown (on desktop and tablet) */}
          <div className="hidden md:flex items-center">
            <select
              value={currentChapterIndex}
              onChange={(e) => setCurrentChapterIndex(parseInt(e.target.value))}
              className={`text-xs font-serif font-semibold py-1 px-2 rounded-lg bg-black/5 dark:bg-white/5 border ${themeStyles.border} focus:outline-none focus:ring-1 focus:ring-amber-700 cursor-pointer max-w-[220px] truncate`}
            >
              {bookData.chapters.map((ch, idx) => (
                <option key={idx} value={idx} className="bg-stone-50 text-stone-900 dark:bg-stone-900 dark:text-stone-100">
                  Bab {idx + 1}: {ch.title}
                </option>
              ))}
            </select>
          </div>

          {/* Right: Quick Controls Bar */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Table of Contents Button */}
            <button
              onClick={() => setShowToc(true)}
              className="px-2.5 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Buka Daftar Isi Bab (Tekan T)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span className="hidden sm:inline">Daftar Bab</span>
              <span className="text-[10px] opacity-60 font-mono">({currentChapterIndex + 1}/{totalChapters})</span>
            </button>

            {/* Reading Settings Toggle Button */}
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className={`p-2 rounded-xl transition-colors ${showSettingsMenu ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              title="Pengaturan Tampilan Baca (Font, Ukuran, Tema)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors hidden sm:block"
              title="Layar Penuh (Tekan F)"
            >
              {isFullscreen ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Reading Progress Line */}
        <div className="w-full h-1 bg-black/10 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full bg-amber-700 dark:bg-amber-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Dropdown Settings Menu */}
        {showSettingsMenu && (
          <div className={`max-w-4xl mx-auto px-4 py-3 border-t ${themeStyles.border} bg-black/5 dark:bg-black/30 backdrop-blur-md animate-fade-in flex flex-wrap items-center justify-between gap-3 text-xs`}>
            {/* Theme switcher */}
            <div className="flex items-center gap-1.5">
              <span className="opacity-70 text-[11px] font-mono mr-1">Tema:</span>
              <button
                onClick={() => setTheme('sepia')}
                className={`px-2.5 py-1 rounded-lg border text-xs font-serif transition-transform ${theme === 'sepia' ? 'bg-[#FBF0D9] text-[#3B2D20] border-amber-900 font-bold ring-2 ring-amber-800' : 'bg-[#FBF0D9] text-[#3B2D20] border-[#E6D5BD] opacity-70'}`}
              >
                Sepia
              </button>
              <button
                onClick={() => setTheme('paper')}
                className={`px-2.5 py-1 rounded-lg border text-xs font-serif transition-transform ${theme === 'paper' ? 'bg-white text-stone-900 border-stone-800 font-bold ring-2 ring-stone-800' : 'bg-white text-stone-900 border-stone-200 opacity-70'}`}
              >
                Putih
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-2.5 py-1 rounded-lg border text-xs font-serif transition-transform ${theme === 'dark' ? 'bg-[#121214] text-zinc-100 border-zinc-500 font-bold ring-2 ring-amber-400' : 'bg-[#121214] text-zinc-100 border-zinc-800 opacity-70'}`}
              >
                Malam
              </button>
              <button
                onClick={() => setTheme('forest')}
                className={`px-2.5 py-1 rounded-lg border text-xs font-serif transition-transform ${theme === 'forest' ? 'bg-[#0F1714] text-emerald-100 border-emerald-600 font-bold ring-2 ring-emerald-400' : 'bg-[#0F1714] text-emerald-100 border-emerald-900 opacity-70'}`}
              >
                Hutan
              </button>
            </div>

            {/* Font Family & Alignment */}
            <div className="flex items-center gap-2">
              <span className="opacity-70 text-[11px] font-mono mr-1">Huruf:</span>
              <button
                onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
                className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 font-bold"
              >
                {fontFamily === 'serif' ? 'Serif (Lora)' : 'Sans (Inter)'}
              </button>

              <button
                onClick={() => setTextAlign(textAlign === 'justify' ? 'left' : 'justify')}
                className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 font-mono text-[11px]"
                title="Rata Kiri vs Rata Kanan-Kiri"
              >
                {textAlign === 'justify' ? 'Rata Kiri-Kanan' : 'Rata Kiri'}
              </button>

              <button
                onClick={() => setLineHeight(lineHeight === 'relaxed' ? 'loose' : 'relaxed')}
                className="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 font-mono text-[11px]"
                title="Kerapatan Spasi Baris"
              >
                Spasi: {lineHeight === 'relaxed' ? 'Normal' : 'Lapang'}
              </button>
            </div>

            {/* Font Size Adjuster */}
            <div className="flex items-center gap-1.5">
              <span className="opacity-70 text-[11px] font-mono mr-1">Ukuran:</span>
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                disabled={fontSize <= 14}
                className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 font-bold disabled:opacity-30 flex items-center justify-center text-xs"
              >
                A-
              </button>
              <span className="font-mono text-xs w-6 text-center">{fontSize}</span>
              <button
                onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                disabled={fontSize >= 28}
                className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 font-bold disabled:opacity-30 flex items-center justify-center text-xs"
              >
                A+
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Reading Canvas */}
      <main
        ref={contentRef}
        className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16"
      >
        {currentChapter ? (
          <article className="space-y-8 animate-fade-in">
            {/* Chapter Header Card */}
            <div className={`space-y-3 border-b ${themeStyles.divider} pb-6 text-center`}>
              <div className="flex items-center justify-center gap-2">
                <span className="text-[11px] uppercase tracking-widest opacity-60 font-mono font-bold">
                  Bab {currentChapter.chapter_number} dari {totalChapters}
                </span>
                <span className="text-[11px] opacity-40">•</span>
                <span className="text-[11px] opacity-60 font-mono">
                  {progressPercent}% Naskah
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight leading-tight">
                {currentChapter.title}
              </h2>

              <div className="flex items-center justify-center gap-4 text-[11px] opacity-60 font-mono pt-1">
                {currentChapter.word_count && (
                  <span>~{Math.ceil(currentChapter.word_count / 200)} menit baca ({currentChapter.word_count.toLocaleString()} kata)</span>
                )}
                <span>{currentChapter.paragraphs?.length || 0} paragraf</span>
              </div>
            </div>

            {/* Chapter Paragraphs Body */}
            <div
              className={`space-y-6 ${
                textAlign === 'justify' ? 'text-justify sm:text-justify' : 'text-left'
              } ${
                lineHeight === 'loose' ? 'leading-[2.1]' : 'leading-[1.85]'
              } ${
                fontFamily === 'serif' ? 'font-serif' : 'font-sans'
              }`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {currentChapter.paragraphs && currentChapter.paragraphs.length > 0 ? (
                currentChapter.paragraphs.map((para, pIdx) => {
                  // Drop cap on first paragraph
                  if (pIdx === 0 && para.length > 20) {
                    const firstChar = para.charAt(0);
                    const restText = para.slice(1);
                    return (
                      <p key={pIdx} className="first:indent-0">
                        <span className={`float-left text-4xl sm:text-5xl font-serif font-bold pr-2.5 pt-0.5 leading-none ${themeStyles.dropCapColor}`}>
                          {firstChar}
                        </span>
                        {restText}
                      </p>
                    );
                  }

                  return (
                    <p key={pIdx} className="indent-6 sm:indent-8">
                      {para}
                    </p>
                  );
                })
              ) : (
                <p className="text-center py-10 opacity-60 text-sm">Naskah bab ini sedang disiapkan.</p>
              )}
            </div>

            {/* Chapter Bottom Navigation */}
            <div className={`pt-10 border-t ${themeStyles.divider} flex items-center justify-between gap-4`}>
              <button
                onClick={() => setCurrentChapterIndex(Math.max(0, currentChapterIndex - 1))}
                disabled={currentChapterIndex === 0}
                className="library-btn-secondary px-4 py-2.5 text-xs font-semibold disabled:opacity-30 flex items-center gap-1.5 transition-all"
              >
                <span>← Bab Sebelumnya</span>
              </button>

              <div className="text-xs opacity-70 font-mono text-center hidden sm:block">
                <span>Bab {currentChapterIndex + 1} dari {totalChapters}</span>
              </div>

              <button
                onClick={() => setCurrentChapterIndex(Math.min(totalChapters - 1, currentChapterIndex + 1))}
                disabled={currentChapterIndex >= totalChapters - 1}
                className="library-btn-primary px-4 py-2.5 text-xs font-semibold disabled:opacity-30 flex items-center gap-1.5 transition-all"
              >
                <span>Bab Berikutnya →</span>
              </button>
            </div>
          </article>
        ) : (
          <div className="text-center py-20 space-y-4">
            <p className="text-sm opacity-60">Tidak ada konten pada bab ini.</p>
            <button
              onClick={() => setCurrentChapterIndex(0)}
              className="library-btn-secondary px-4 py-2 text-xs"
            >
              Kembali ke Bab 1
            </button>
          </div>
        )}
      </main>

      {/* Mobile Floating Bottom Bar for Quick Navigation */}
      <div className={`fixed bottom-0 inset-x-0 z-30 sm:hidden border-t ${themeStyles.toolbarBorder} ${themeStyles.toolbarBg} backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-2 shadow-lg`}>
        <button
          onClick={() => setCurrentChapterIndex(Math.max(0, currentChapterIndex - 1))}
          disabled={currentChapterIndex === 0}
          className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 text-xs font-semibold disabled:opacity-25"
        >
          ← Prev
        </button>

        <button
          onClick={() => setShowToc(true)}
          className="text-xs font-mono font-bold truncate max-w-[170px] text-center"
        >
          Bab {currentChapterIndex + 1}/{totalChapters} ▼
        </button>

        <button
          onClick={() => setCurrentChapterIndex(Math.min(totalChapters - 1, currentChapterIndex + 1))}
          disabled={currentChapterIndex >= totalChapters - 1}
          className="px-3 py-1.5 rounded-lg bg-amber-800 text-amber-50 text-xs font-semibold disabled:opacity-25"
        >
          Next →
        </button>
      </div>

      {/* Table of Contents Drawer Modal */}
      {showToc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className={`w-full max-w-sm h-full ${themeStyles.bg} ${themeStyles.text} p-5 shadow-2xl flex flex-col border-l ${themeStyles.border} overflow-hidden`}>
            {/* Drawer Header */}
            <div className={`flex items-center justify-between pb-3 border-b ${themeStyles.divider}`}>
              <div>
                <h3 className="font-serif font-bold text-base">Daftar Bab & Cerita</h3>
                <p className="text-[11px] opacity-60 font-mono">{totalChapters} Bab Naskah Utuh</p>
              </div>
              <button
                onClick={() => setShowToc(false)}
                className="w-8 h-8 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick search/filter in TOC */}
            <div className="pt-3 pb-2">
              <input
                type="text"
                placeholder="Cari judul bab atau nomor..."
                value={tocFilter}
                onChange={(e) => setTocFilter(e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border ${themeStyles.border} focus:outline-none focus:ring-1 focus:ring-amber-700`}
              />
            </div>

            {/* Chapters List */}
            <div className="flex-1 overflow-y-auto py-2 space-y-1 pr-1">
              {filteredChapters.length > 0 ? (
                filteredChapters.map((ch, idx) => {
                  const actualIdx = (bookData.chapters || []).indexOf(ch);
                  const isCurrent = currentChapterIndex === actualIdx;
                  return (
                    <button
                      key={actualIdx}
                      onClick={() => {
                        setCurrentChapterIndex(actualIdx);
                        setShowToc(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-2 ${
                        isCurrent
                          ? `${themeStyles.activeTab} shadow-sm font-bold`
                          : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-serif">{ch.title}</p>
                        {ch.word_count && (
                          <p className="text-[10px] opacity-60 font-mono mt-0.5">
                            ~{Math.ceil(ch.word_count / 200)} mnt ({ch.word_count.toLocaleString()} kata)
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] opacity-60 font-mono shrink-0">
                        #{actualIdx + 1}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="text-center py-8 text-xs opacity-50">Tidak ada bab yang cocok.</p>
              )}
            </div>

            {/* Drawer Footer */}
            <div className={`pt-3 border-t ${themeStyles.divider} text-[11px] opacity-60 text-center font-mono`}>
              Sumber: {bookData.source || 'Project Gutenberg (Open Access)'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
