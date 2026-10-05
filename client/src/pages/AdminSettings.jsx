import { useState, useEffect } from 'react';
import { adminAPI, systemAPI } from '../services/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    fine_per_day: '1000',
    max_borrow_limit: '3',
    loan_duration_days: '14',
    library_name: 'AksaraLoka Pustaka & Arsip',
  });
  const [engineStatus, setEngineStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    Promise.all([
      adminAPI.getSettings(),
      systemAPI.getStatus(),
    ])
      .then(([settingsRes, sysRes]) => {
        if (settingsRes.data) {
          setSettings(prev => ({ ...prev, ...settingsRes.data }));
        }
        setEngineStatus(sysRes.data?.data || null);
      })
      .catch(err => {
        console.error('Gagal memuat pengaturan:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await adminAPI.updateSettings(settings);
      setFeedback({ type: 'success', text: res.message || 'Pengaturan berhasil disimpan!' });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err?.response?.data?.message || 'Gagal menyimpan pengaturan.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-stone-500 font-mono font-bold mb-1">
          <svg className="w-3.5 h-3.5 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
          <span>Konfigurasi Induk</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
          Pengaturan Sistem & Kebijakan Perpustakaan
        </h1>
        <p className="text-stone-600 text-sm mt-0.5">
          Tentukan parameter sirkulasi peminjaman, besaran denda, dan pantau status mesin pangkalan data.
        </p>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between ${
          feedback.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="library-card p-6 sm:p-8 space-y-6">
        <h2 className="font-serif text-xl font-bold text-stone-900 pb-3 border-b border-stone-100">
          Kebijakan Peminjaman & Sirkulasi Buku
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Nama Resmi Perpustakaan
            </label>
            <input
              type="text"
              name="library_name"
              value={settings.library_name || ''}
              onChange={handleChange}
              className="library-input"
              placeholder="AksaraLoka Pustaka & Arsip"
            />
            <p className="text-[11px] text-stone-400 mt-1">Ditampilkan pada kop kartu anggota & dokumen sirkulasi.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Tarif Denda Keterlambatan per Hari (Rp)
            </label>
            <input
              type="number"
              name="fine_per_day"
              value={settings.fine_per_day || '1000'}
              onChange={handleChange}
              min="0"
              step="500"
              className="library-input font-mono font-semibold"
            />
            <p className="text-[11px] text-stone-400 mt-1">Dihitung otomatis saat anggota melewati tanggal jatuh tempo.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Durasi Standar Masa Pinjam (Hari)
            </label>
            <input
              type="number"
              name="loan_duration_days"
              value={settings.loan_duration_days || '14'}
              onChange={handleChange}
              min="1"
              max="60"
              className="library-input font-mono font-semibold"
            />
            <p className="text-[11px] text-stone-400 mt-1">Lama peminjaman sebelum buku wajib dikembalikan ke rak.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Batas Maksimal Buku per Anggota
            </label>
            <input
              type="number"
              name="max_borrow_limit"
              value={settings.max_borrow_limit || '3'}
              onChange={handleChange}
              min="1"
              max="10"
              className="library-input font-mono font-semibold"
            />
            <p className="text-[11px] text-stone-400 mt-1">Kapasitas peminjaman aktif bersamaan per kartu anggota.</p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-stone-100">
          <button
            type="submit"
            disabled={saving}
            className="library-btn-primary px-6 py-2.5 text-xs font-semibold flex items-center gap-2"
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan Kebijakan'}
          </button>
        </div>
      </form>

      {/* Database Engine Status Monitor */}
      <div className="library-card p-6 sm:p-8 space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-900 pb-3 border-b border-stone-100">
          Pusat Kendali Mesin Data (Dual-Engine Monitor)
        </h2>

        {engineStatus && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold block">
                Mesin Aktif
              </span>
              <div className="font-serif text-lg font-bold text-stone-900 mt-1 uppercase">
                {engineStatus.activeEngine}
              </div>
              <span className="text-xs text-stone-500">
                {engineStatus.activeEngine === 'sqlite' ? 'Penyimpanan lokal tanpa dependensi eksternal' : 'Tersambung ke pangkalan cloud'}
              </span>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold block">
                Kondisi Mesin
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="font-semibold text-stone-900 text-sm">Operasional Normal</span>
              </div>
              <span className="text-xs text-stone-500">Auto-recovery & seed otomatis aktif</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold block">
                Failover Siap Pakai
              </span>
              <div className="font-serif text-lg font-bold text-stone-900 mt-1">
                SQLite ⇋ Postgres
              </div>
              <span className="text-xs text-stone-500">
                Dukungan beralih otomatis jika pangkalan cloud offline
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
