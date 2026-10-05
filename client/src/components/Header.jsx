import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { systemAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, isLibrarian, isMember, logout, openLogin, openRegister } = useAuth();
  const [engineStatus, setEngineStatus] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    systemAPI.getStatus()
      .then(res => setEngineStatus(res.data?.data))
      .catch(() => setEngineStatus({ activeEngine: 'sqlite', mode: 'offline_local' }));
  }, []);

  // Close menus on route change
  useEffect(() => {
    setShowProfileMenu(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const getRoleBadge = () => {
    if (isAdmin) {
      return {
        label: 'Administrator Sistem',
        badgeClass: 'bg-stone-900 text-amber-200 border border-stone-700',
        avatarClass: 'bg-stone-900 text-amber-200',
      };
    }
    if (isLibrarian) {
      return {
        label: 'Pustakawan',
        badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300',
        avatarClass: 'bg-amber-700 text-white',
      };
    }
    return {
      label: 'Anggota Perpustakaan',
      badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      avatarClass: 'bg-emerald-800 text-white',
    };
  };

  const roleMeta = getRoleBadge();

  const getBrandHomeLink = () => {
    if (isAdmin) return '/admin/users';
    if (isLibrarian) return '/librarian/circulation';
    return '/';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Engine Indicator */}
          <div className="flex items-center gap-4">
            <Link to={getBrandHomeLink()} className="flex items-center gap-3 group" aria-label="AksaraLoka Beranda">
              <img
                src="/favicon.svg"
                alt="Logo AksaraLoka"
                className="w-10 h-10 rounded-xl shadow-sm group-hover:scale-105 transition-transform duration-200"
              />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl tracking-tight text-stone-900 group-hover:text-amber-900 transition-colors">
                  AksaraLoka
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-medium -mt-1">
                  {isAdmin ? 'Panel Administrator' : isLibrarian ? 'Meja Pustakawan' : 'Semesta Aksara & Arsip'}
                </span>
              </div>
            </Link>

            {/* Offline/Cloud Engine Indicator */}
            {engineStatus && (
              <div
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-stone-100 rounded-full border border-stone-200 text-[11px] font-mono text-stone-600"
                title={engineStatus.activeEngine === 'sqlite' ? 'Mode Offline Lokal Aktif (Data di SQLite)' : 'Mode Cloud PostgreSQL'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${engineStatus.activeEngine === 'sqlite' ? 'bg-emerald-600' : 'bg-sky-600'}`} />
                <span>{engineStatus.activeEngine === 'sqlite' ? 'Lokal: SQLite' : 'Cloud: Postgres'}</span>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links — Strictly Separated by Role */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            {/* 1. PUBLIC / MEMBER ONLY (Tamu & Anggota) */}
            {(!isAdmin && !isLibrarian) && (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-xl transition-all ${
                    location.pathname === '/'
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Beranda
                </Link>

                <Link
                  to="/books?tab=local"
                  className={`px-3 py-2 rounded-xl transition-all ${
                    location.pathname === '/books' && (!location.search || location.search.includes('tab=local'))
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Katalog Koleksi
                </Link>

                <Link
                  to="/books?tab=gutenberg"
                  className={`px-3 py-2 rounded-xl transition-all ${
                    location.search.includes('tab=gutenberg')
                      ? 'bg-amber-900 text-white shadow-sm font-bold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Naskah Terbuka
                </Link>

                <Link
                  to="/books?tab=comics"
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    location.search.includes('tab=comics')
                      ? 'bg-purple-900 text-purple-50 shadow-sm font-bold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <span>Komik & Manga</span>
                  <span className="text-[10px] px-1 rounded bg-purple-100 text-purple-800 font-mono font-bold">Baru</span>
                </Link>

                {isMember && (
                  <Link
                    to="/my-loans"
                    className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                      location.pathname === '/my-loans'
                        ? 'bg-emerald-800 text-white shadow-sm'
                        : 'text-emerald-900 bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-100'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Buku Saya & Kartu
                  </Link>
                )}
              </>
            )}

            {/* 2. ROLE: ADMIN ONLY */}
            {isAdmin && (
              <>
                <Link
                  to="/admin/users"
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    location.pathname.startsWith('/admin/users')
                      ? 'bg-stone-900 text-amber-200 shadow-sm font-bold'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Kelola Pengguna
                </Link>

                <Link
                  to="/librarian/books"
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    location.pathname.startsWith('/librarian/books')
                      ? 'bg-stone-900 text-amber-200 shadow-sm font-bold'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Inventaris & Stock Opname
                </Link>

                <Link
                  to="/librarian/circulation"
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    location.pathname.startsWith('/librarian/circulation')
                      ? 'bg-stone-900 text-amber-200 shadow-sm font-bold'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Meja Sirkulasi
                </Link>

                <Link
                  to="/admin/settings"
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    location.pathname.startsWith('/admin/settings')
                      ? 'bg-stone-900 text-amber-200 shadow-sm font-bold'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Pengaturan
                </Link>
              </>
            )}

            {/* 3. ROLE: LIBRARIAN (PUSTAKAWAN) ONLY */}
            {isLibrarian && (
              <>
                <Link
                  to="/librarian/circulation"
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    location.pathname.startsWith('/librarian/circulation')
                      ? 'bg-amber-800 text-white shadow-sm font-bold'
                      : 'text-amber-900 hover:bg-amber-50'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Meja Sirkulasi
                </Link>

                <Link
                  to="/librarian/books"
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    location.pathname.startsWith('/librarian/books')
                      ? 'bg-amber-800 text-white shadow-sm font-bold'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Kelola Rak & Stock Opname
                </Link>

                <Link
                  to="/librarian/import"
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    location.pathname.startsWith('/librarian/import')
                      ? 'bg-amber-800 text-white shadow-sm font-bold'
                      : 'text-amber-900 bg-amber-50/70 border border-amber-200/80 hover:bg-amber-100'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Impor Open Library
                </Link>
              </>
            )}
          </nav>

          {/* User Profile / Auth Actions */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openLogin()}
                  className="library-btn-secondary px-3.5 py-2 text-xs font-semibold"
                >
                  Masuk Akun
                </button>
                <button
                  type="button"
                  onClick={openRegister}
                  className="library-btn-primary px-3.5 py-2 text-xs font-semibold"
                >
                  Daftar
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(prev => !prev)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 shadow-sm hover:border-stone-300 transition-all text-xs"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${roleMeta.avatarClass}`}>
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-semibold text-stone-900 line-clamp-1">{user.name}</div>
                    <div className="text-[10px] text-stone-500 font-mono">
                      {roleMeta.label}
                    </div>
                  </div>
                  <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-stone-200 shadow-xl p-2 z-50 text-xs animate-scale-in">
                    <div className="p-3 border-b border-stone-100 mb-1">
                      <p className="font-bold text-stone-900">{user.name}</p>
                      <p className="text-[11px] text-stone-500">{user.email}</p>
                      <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${roleMeta.badgeClass}`}>
                        {roleMeta.label} ({user.member_code})
                      </span>
                    </div>

                    {/* Quick navigation based on role */}
                    {isAdmin && (
                      <>
                        <Link
                          to="/admin/users"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-stone-700 hover:bg-stone-50 font-medium"
                        >
                          Kelola Pengguna Sistem
                        </Link>
                        <Link
                          to="/admin/settings"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-stone-700 hover:bg-stone-50 font-medium"
                        >
                          Pengaturan Perpustakaan
                        </Link>
                      </>
                    )}

                    {isLibrarian && (
                      <>
                        <Link
                          to="/librarian/circulation"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-amber-900 hover:bg-amber-50 font-medium"
                        >
                          Meja Sirkulasi Buku
                        </Link>
                        <Link
                          to="/librarian/import"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-amber-900 hover:bg-amber-50 font-medium"
                        >
                          Impor dari Open Library
                        </Link>
                      </>
                    )}

                    {isMember && (
                      <Link
                        to="/my-loans"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-emerald-900 hover:bg-emerald-50 font-medium"
                      >
                        Kartu Anggota & Pinjaman Saya
                      </Link>
                    )}

                    <div className="border-t border-stone-100 my-1" />

                    <button
                      type="button"
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Keluar Akun
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200/80 space-y-1 animate-fade-in text-sm font-medium">
            {/* 1. PUBLIC / MEMBER ONLY (Tamu & Anggota Saja) */}
            {(!isAdmin && !isLibrarian) && (
              <>
                <Link to="/" className="block px-3 py-2 rounded-xl text-stone-700 hover:bg-stone-100">
                  Beranda
                </Link>
                <Link to="/books" className="block px-3 py-2 rounded-xl text-stone-700 hover:bg-stone-100">
                  Katalog Koleksi (Lokal)
                </Link>
                <Link to="/books?tab=gutenberg" className="flex items-center gap-2 px-3 py-2 rounded-xl text-amber-900 hover:bg-amber-50 font-medium">
                  <svg className="w-4 h-4 text-amber-800 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Naskah Terbuka (Sains, Pendidikan, Sastra)</span>
                </Link>
                <Link to="/books?tab=comics" className="flex items-center justify-between px-3 py-2 rounded-xl text-purple-900 hover:bg-purple-50 font-semibold">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-800 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Komik & Manga (MangaDex / XKCD)</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono font-bold">Baru</span>
                </Link>
                {isMember && (
                  <Link to="/my-loans" className="block px-3 py-2 rounded-xl text-emerald-900 hover:bg-emerald-50 font-semibold">
                    Buku Saya & Kartu Anggota
                  </Link>
                )}
              </>
            )}

            {/* 2. ADMIN ONLY */}
            {isAdmin && (
              <>
                <div className="px-3 py-1 text-[11px] uppercase tracking-wider text-stone-500 font-mono font-bold">
                  Menu Administrator
                </div>
                <Link to="/admin/users" className="block px-3 py-2 rounded-xl text-stone-900 hover:bg-stone-100 font-semibold">
                  Kelola Pengguna
                </Link>
                <Link to="/librarian/books" className="block px-3 py-2 rounded-xl text-stone-900 hover:bg-stone-100 font-semibold">
                  Inventaris & Stock Opname
                </Link>
                <Link to="/librarian/circulation" className="block px-3 py-2 rounded-xl text-stone-900 hover:bg-stone-100 font-semibold">
                  Meja Sirkulasi
                </Link>
                <Link to="/admin/settings" className="block px-3 py-2 rounded-xl text-stone-900 hover:bg-stone-100 font-semibold">
                  Pengaturan Sistem
                </Link>
              </>
            )}

            {/* 3. LIBRARIAN ONLY */}
            {isLibrarian && (
              <>
                <div className="px-3 py-1 text-[11px] uppercase tracking-wider text-amber-800 font-mono font-bold">
                  Menu Pustakawan
                </div>
                <Link to="/librarian/circulation" className="block px-3 py-2 rounded-xl text-amber-900 hover:bg-amber-50 font-semibold">
                  Meja Sirkulasi
                </Link>
                <Link to="/librarian/books" className="block px-3 py-2 rounded-xl text-amber-900 hover:bg-amber-50 font-semibold">
                  Kelola Rak & Stock Opname
                </Link>
                <Link to="/librarian/import" className="block px-3 py-2 rounded-xl text-amber-900 hover:bg-amber-50 font-semibold">
                  Impor Open Library
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
