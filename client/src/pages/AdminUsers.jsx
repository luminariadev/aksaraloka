import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'MEMBER',
  });
  const [actionMessage, setActionMessage] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getUsers({
        role: roleFilter,
        search,
      });
      setUsers(res.data || []);

      const statsRes = await adminAPI.getStats();
      setStats(statsRes.data || null);
    } catch (err) {
      console.error('Gagal memuat pengguna:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await adminAPI.updateUserRole(userId, newRole);
      setActionMessage({ type: 'success', text: res.message });
      fetchUsers();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Gagal mengubah peran pengguna.',
      });
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const res = await adminAPI.updateUserStatus(userId, !currentStatus);
      setActionMessage({ type: 'success', text: res.message });
      fetchUsers();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Gagal mengubah status pengguna.',
      });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.createUser(newUser);
      setActionMessage({ type: 'success', text: res.message });
      setModalOpen(false);
      setNewUser({ name: '', email: '', password: '', phone: '', role: 'MEMBER' });
      fetchUsers();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Gagal membuat akun baru.',
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-stone-500 font-mono font-bold mb-1">
            <svg className="w-3.5 h-3.5 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Portal Administrator</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
            Manajemen Pengguna & Penetapan Peran
          </h1>
          <p className="text-stone-600 text-sm mt-0.5">
            Kelola otoritas sistem, pantau keaktifan anggota, dan tunjuk staf Pustakawan secara terpusat.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="library-btn-primary flex items-center gap-2 self-start text-xs font-semibold"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pengguna Baru
        </button>
      </div>

      {/* Role Counts Overview */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="library-card p-4">
            <span className="text-xs text-stone-500 font-medium">Total Akun Terdaftar</span>
            <div className="font-serif text-2xl font-bold text-stone-900 mt-1">{stats.users.total}</div>
          </div>
          <div className="library-card p-4 border-l-4 border-l-stone-900">
            <span className="text-xs text-stone-500 font-medium">Administrator</span>
            <div className="font-serif text-2xl font-bold text-stone-900 mt-1">{stats.users.ADMIN}</div>
          </div>
          <div className="library-card p-4 border-l-4 border-l-amber-700">
            <span className="text-xs text-stone-500 font-medium">Pustakawan</span>
            <div className="font-serif text-2xl font-bold text-amber-900 mt-1">{stats.users.LIBRARIAN}</div>
          </div>
          <div className="library-card p-4 border-l-4 border-l-emerald-700">
            <span className="text-xs text-stone-500 font-medium">Anggota Aktif</span>
            <div className="font-serif text-2xl font-bold text-emerald-900 mt-1">{stats.users.MEMBER}</div>
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {actionMessage && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between ${
          actionMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="font-bold ml-4">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="library-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Role Filter Chips */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Semua Peran' },
            { id: 'ADMIN', label: 'Admin' },
            { id: 'LIBRARIAN', label: 'Pustakawan' },
            { id: 'MEMBER', label: 'Anggota' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                roleFilter === tab.id
                  ? 'bg-stone-900 text-amber-100 shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama / email / kode..."
            className="library-input py-1.5 text-xs"
          />
          <button type="submit" className="library-btn-secondary px-3 py-1.5 text-xs font-semibold shrink-0">
            Cari
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="library-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-stone-700 uppercase font-mono tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="p-4 font-bold">Pengguna</th>
                <th className="p-4 font-bold">Kontak</th>
                <th className="p-4 font-bold">Peran (Role)</th>
                <th className="p-4 font-bold">Pinjaman Aktif</th>
                <th className="p-4 font-bold">Status Akun</th>
                <th className="p-4 font-bold text-right">Ubah Peran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-stone-500">
                    Memuat data pengguna perpustakaan...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-stone-500">
                    Tidak ada pengguna yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          u.role === 'ADMIN'
                            ? 'bg-stone-900 text-amber-200'
                            : u.role === 'LIBRARIAN'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-stone-900">{u.name}</div>
                          <div className="font-mono text-[10px] text-stone-400">{u.member_code}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-stone-600">
                      <div>{u.email}</div>
                      <div className="text-stone-400 text-[11px]">{u.phone || '-'}</div>
                    </td>

                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        u.role === 'ADMIN'
                          ? 'bg-stone-900 text-amber-200 border border-stone-800'
                          : u.role === 'LIBRARIAN'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {u.role === 'ADMIN' ? 'Administrator' : u.role === 'LIBRARIAN' ? 'Pustakawan' : 'Anggota'}
                      </span>
                    </td>

                    <td className="p-4 font-mono font-semibold text-stone-700">
                      {u.active_loans} buku
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleStatusToggle(u.id, u.is_active)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                          u.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800'
                            : 'bg-stone-200 text-stone-600 hover:bg-emerald-100 hover:text-emerald-800'
                        }`}
                        title="Klik untuk ubah status"
                      >
                        {u.is_active ? '● Aktif' : '○ Nonaktif'}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs font-semibold text-stone-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-stone-400"
                      >
                        <option value="MEMBER">Anggota</option>
                        <option value="LIBRARIAN">Pustakawan</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Pengguna */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl w-full max-w-md p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-bold text-stone-900">Tambah Akun Baru</h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser(p => ({ ...p, name: e.target.value }))}
                  className="library-input"
                  placeholder="Nama staf atau anggota"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser(p => ({ ...p, email: e.target.value }))}
                  className="library-input"
                  placeholder="staf@aksaraloka.local"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Kata Sandi Awal *</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser(p => ({ ...p, password: e.target.value }))}
                  className="library-input"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Telepon</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser(p => ({ ...p, phone: e.target.value }))}
                  className="library-input"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Pilih Peran *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(p => ({ ...p, role: e.target.value }))}
                  className="library-input cursor-pointer"
                >
                  <option value="MEMBER">Anggota Perpustakaan</option>
                  <option value="LIBRARIAN">Staf Pustakawan (Meja Sirkulasi)</option>
                  <option value="ADMIN">Administrator Sistem (Akses Penuh)</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="library-btn-secondary px-4 py-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="library-btn-primary px-4 py-2 font-semibold"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
