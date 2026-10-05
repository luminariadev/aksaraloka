import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    closeAuthModal,
    prefilledCredentials,
    login,
    register,
  } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDemoHints, setShowDemoHints] = useState(true);

  // Apply prefilled credentials if passed
  useEffect(() => {
    if (prefilledCredentials) {
      setFormData(prev => ({
        ...prev,
        email: prefilledCredentials.email || '',
        password: prefilledCredentials.password || '',
      }));
    }
  }, [prefilledCredentials]);

  if (!isAuthModalOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const fillDemoAccount = (role) => {
    if (role === 'ADMIN') {
      setFormData(prev => ({
        ...prev,
        email: 'admin@mylibrary.local',
        password: 'password123',
      }));
    } else if (role === 'LIBRARIAN') {
      setFormData(prev => ({
        ...prev,
        email: 'pustakawan@mylibrary.local',
        password: 'password123',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        email: 'rizkia@example.com',
        password: 'password123',
      }));
    }
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.email || !formData.password) {
      setError('Harap lengkapi email dan kata sandi.');
      return;
    }

    if (authModalTab === 'register') {
      if (!formData.name.trim()) {
        setError('Nama lengkap wajib diisi.');
        return;
      }
      if (formData.password.length < 6) {
        setError('Kata sandi minimal 6 karakter.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Konfirmasi kata sandi tidak cocok.');
        return;
      }
    }

    setLoading(true);

    try {
      if (authModalTab === 'login') {
        await login(formData.email.trim(), formData.password);
      } else {
        await register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
        });
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Gagal memproses otentikasi akun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-[#FAF8F5] rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-8">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-6 right-6 text-stone-400 hover:text-stone-700 transition-colors p-1"
          aria-label="Tutup"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="space-y-1 mb-6">
          <img
            src="/favicon.svg"
            alt="Logo AksaraLoka"
            className="w-10 h-10 rounded-xl shadow-sm mb-3"
          />
          <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
            {authModalTab === 'login' ? 'Masuk ke AksaraLoka' : 'Pendaftaran Anggota Baru'}
          </h2>
          <p className="text-xs text-stone-500">
            {authModalTab === 'login'
              ? 'Silakan masukkan kredensial akun Anda untuk mengakses koleksi dan meja kerja.'
              : 'Daftarkan data diri Anda untuk mendapatkan nomor keanggotaan digital AksaraLoka.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-stone-200/70 rounded-xl mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setAuthModalTab('login'); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authModalTab === 'login'
                ? 'bg-white text-stone-900 shadow-sm font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Masuk Akun
          </button>
          <button
            type="button"
            onClick={() => { setAuthModalTab('register'); setError(null); }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authModalTab === 'register'
                ? 'bg-white text-stone-900 shadow-sm font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Daftar Anggota
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="misal: Siti Nurhaliza"
                required
                className="library-input"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Alamat Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              required
              className="library-input"
            />
          </div>

          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0812xxxxxxxx"
                className="library-input"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Kata Sandi *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="library-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Ulangi Kata Sandi *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="library-input"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full library-btn-primary py-3 font-semibold text-sm mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin text-amber-200" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Memproses...</span>
              </>
            ) : (
              <span>{authModalTab === 'login' ? 'Masuk ke Akun' : 'Daftar Sekarang'}</span>
            )}
          </button>
        </form>

        {/* Demo Account Helper (Prefills form fields cleanly for evaluation) */}
        {authModalTab === 'login' && (
          <div className="mt-6 pt-5 border-t border-stone-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-stone-600 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Kredensial Demo (3 Peran)
              </span>
              <button
                type="button"
                onClick={() => setShowDemoHints(!showDemoHints)}
                className="text-[10px] text-stone-400 hover:text-stone-700"
              >
                {showDemoHints ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>

            {showDemoHints && (
              <div className="space-y-1.5 text-left">
                <p className="text-[10px] text-stone-500 mb-2">
                  Pilih salah satu tombol di bawah untuk mengisi formulir secara otomatis, kemudian klik tombol <b>Masuk ke Akun</b>:
                </p>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('ADMIN')}
                    className="p-2 rounded-xl border border-stone-200 hover:border-stone-900 bg-white hover:bg-stone-50 transition-all text-left"
                    title="admin@mylibrary.local"
                  >
                    <div className="text-[10px] uppercase font-bold text-slate-800">1. Admin</div>
                    <div className="text-[9px] text-stone-500 truncate">Budi Santoso</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemoAccount('LIBRARIAN')}
                    className="p-2 rounded-xl border border-stone-200 hover:border-amber-700 bg-white hover:bg-amber-50/40 transition-all text-left"
                    title="pustakawan@mylibrary.local"
                  >
                    <div className="text-[10px] uppercase font-bold text-amber-800">2. Pustakawan</div>
                    <div className="text-[9px] text-stone-500 truncate">Siti Rahmah</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemoAccount('MEMBER')}
                    className="p-2 rounded-xl border border-stone-200 hover:border-emerald-700 bg-white hover:bg-emerald-50/40 transition-all text-left"
                    title="rizkia@example.com"
                  >
                    <div className="text-[10px] uppercase font-bold text-emerald-800">3. Anggota</div>
                    <div className="text-[9px] text-stone-500 truncate">Rizkia Nuari</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
