import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import BookList from './pages/BookList';
import BookDetail from './pages/BookDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';
import LibrarianCirculation from './pages/LibrarianCirculation';
import LibrarianImport from './pages/LibrarianImport';
import MyLoans from './pages/MyLoans';
import Reader from './pages/Reader';
import ComicReader from './pages/ComicReader';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#FAF8F5] text-stone-800 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<BookList />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/reader/:id" element={<Reader />} />
            <Route path="/reader/gutenberg/:gutenbergId" element={<Reader />} />
            <Route path="/reader/comic/:comicId" element={<ComicReader />} />
            <Route path="/reader/comic/chapter/:chapterId" element={<ComicReader />} />

            {/* 1. Member Area */}
            <Route
              path="/my-loans"
              element={
                <ProtectedRoute allowedRoles={['MEMBER', 'LIBRARIAN', 'ADMIN']}>
                  <MyLoans />
                </ProtectedRoute>
              }
            />

            {/* 2. Librarian Area (Pustakawan & Admin) */}
            <Route
              path="/librarian/circulation"
              element={
                <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']}>
                  <LibrarianCirculation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/librarian/books"
              element={
                <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/librarian/import"
              element={
                <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']}>
                  <LibrarianImport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/librarian"
              element={
                <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']}>
                  <LibrarianCirculation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/librarian/*"
              element={
                <ProtectedRoute allowedRoles={['LIBRARIAN', 'ADMIN']}>
                  <LibrarianCirculation />
                </ProtectedRoute>
              }
            />

            {/* 3. Administrator Area (Admin Only) */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {/* Global Auth Modal */}
        <AuthModal />

        <footer className="border-t border-stone-200/80 bg-white/70 py-8 text-center text-xs text-stone-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-stone-900 text-sm">AksaraLoka</span>
              <span>—</span>
              <span>Semesta Aksara & Arsip Pengetahuan Terbuka</span>
            </div>
            <div className="flex items-center gap-3 text-stone-400 font-mono text-[11px]">
              <span>Powered by Open Library REST API</span>
              <span>•</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
