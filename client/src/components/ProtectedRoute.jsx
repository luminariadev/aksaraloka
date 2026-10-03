import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, openLogin } = useAuth();

  if (loading) {
    return (
      <div className="py-20 text-center text-stone-500">
        <div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-3" />
        <p className="text-xs uppercase tracking-wider font-mono">Memeriksa Hak Akses...</p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 library-card p-8 text-center space-y-4 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center justify-center mx-auto text-xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900">Perlu Masuk Akun</h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          Fitur ini memerlukan otentikasi akun terdaftar. Silakan masukkan kredensial akun Anda untuk melanjutkan.
        </p>
        <div className="pt-2">
          <button
            onClick={() => openLogin()}
            className="library-btn-primary w-full py-2.5 text-xs font-semibold"
          >
            Masuk ke Akun
          </button>
        </div>
      </div>
    );
  }

  // Logged in but not allowed role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const requiredRolesLabel = allowedRoles.map(r => {
      if (r === 'ADMIN') return 'Administrator Sistem';
      if (r === 'LIBRARIAN') return 'Pustakawan';
      return 'Anggota';
    }).join(' atau ');

    return (
      <div className="max-w-lg mx-auto my-12 library-card p-8 sm:p-10 text-center space-y-4 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center justify-center mx-auto text-xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900">Otoritas Akses Dibatasi</h2>
        <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
          Halaman ini dikhususkan untuk <b>{requiredRolesLabel}</b>. Anda saat ini masuk dengan peran{' '}
          <span className="font-semibold text-stone-900 bg-stone-100 px-2 py-0.5 rounded font-mono">{user.role}</span>.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="library-btn-secondary w-full sm:w-auto text-xs">
            Kembali ke Beranda
          </Link>
          <button
            onClick={() => openLogin()}
            className="library-btn-primary w-full sm:w-auto text-xs font-semibold"
          >
            Beralih Akun Lain
          </button>
        </div>
      </div>
    );
  }

  return children;
}
