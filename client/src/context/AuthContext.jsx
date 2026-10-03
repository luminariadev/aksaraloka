import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem('aksaraloka_token') || localStorage.getItem('mylibrary_token') || null
  );
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'
  const [prefilledCredentials, setPrefilledCredentials] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('aksaraloka_token') || localStorage.getItem('mylibrary_token');
      if (savedToken) {
        try {
          const res = await authAPI.getMe();
          if (res?.user) {
            setUser(res.user);
            setToken(savedToken);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Sesi pengguna kedaluwarsa atau tidak valid:', err?.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res?.token && res?.user) {
      localStorage.setItem('aksaraloka_token', res.token);
      localStorage.setItem('mylibrary_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
      setPrefilledCredentials(null);
      return res.user;
    }
    throw new Error(res?.message || 'Gagal masuk akun.');
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res?.token && res?.user) {
      localStorage.setItem('aksaraloka_token', res.token);
      localStorage.setItem('mylibrary_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
      return res.user;
    }
    throw new Error(res?.message || 'Gagal mendaftar akun.');
  };

  const logout = () => {
    localStorage.removeItem('aksaraloka_token');
    localStorage.removeItem('mylibrary_token');
    setToken(null);
    setUser(null);
    setPrefilledCredentials(null);
  };

  const openLogin = (preset = null) => {
    setAuthModalTab('login');
    if (preset) {
      setPrefilledCredentials(preset);
    }
    setIsAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthModalTab('register');
    setPrefilledCredentials(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPrefilledCredentials(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        // 3 distinct roles
        isAdmin: user?.role === 'ADMIN',
        isLibrarian: user?.role === 'LIBRARIAN',
        isMember: user?.role === 'MEMBER',
        isStaff: user?.role === 'ADMIN' || user?.role === 'LIBRARIAN',
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        prefilledCredentials,
        openLogin,
        openRegister,
        closeAuthModal,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
