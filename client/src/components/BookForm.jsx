import { useState, useEffect } from 'react';

const defaultFormData = {
  title: '',
  author: '',
  isbn: '',
  description: '',
  category_id: '',
  published_year: '',
  pages: '',
  language: 'Indonesia',
  stock: 1,
  is_physical: true,
  rack_location: 'Rak Sastra A-01',
  is_digital: false,
  ebook_url: '',
  ebook_format: 'PDF',
  physical_condition: 'BAIK',
  condition_notes: '',
};

export default function BookForm({ book, categories, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        description: book.description || '',
        category_id: book.category_id || '',
        published_year: book.published_year || '',
        pages: book.pages || '',
        language: book.language || 'Indonesia',
        stock: book.stock ?? 1,
        is_physical: book.is_physical !== undefined ? Boolean(book.is_physical) : true,
        rack_location: book.rack_location || 'Rak Umum',
        is_digital: book.is_digital !== undefined ? Boolean(book.is_digital) : false,
        ebook_url: book.ebook_url || '',
        ebook_format: book.ebook_format || 'PDF',
        physical_condition: book.physical_condition || 'BAIK',
        condition_notes: book.condition_notes || '',
      });
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Judul wajib diisi';
    if (!formData.author.trim()) newErrors.author = 'Penulis wajib diisi';
    if (formData.published_year && (formData.published_year < 1000 || formData.published_year > 9999)) {
      newErrors.published_year = 'Tahun harus antara 1000-9999';
    }
    if (formData.stock < 0) newErrors.stock = 'Stok tidak boleh negatif';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = { ...formData };
    if (payload.category_id && payload.category_id !== '') payload.category_id = parseInt(payload.category_id);
    else if (payload.category_id === '') delete payload.category_id;
    if (payload.published_year !== '' && payload.published_year !== null && payload.published_year !== undefined) payload.published_year = parseInt(payload.published_year);
    else if (payload.published_year === '') delete payload.published_year;
    if (payload.pages !== '' && payload.pages !== null && payload.pages !== undefined) payload.pages = parseInt(payload.pages);
    else if (payload.pages === '') delete payload.pages;
    payload.stock = parseInt(payload.stock) || 0;

    onSubmit?.(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-1">Judul Buku *</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="library-input"
            placeholder="Masukkan judul buku"
          />
          {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Author */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Penulis *</label>
          <input
            name="author"
            value={formData.author}
            onChange={handleChange}
            className="library-input"
            placeholder="Nama penulis"
          />
          {errors.author && <p className="text-rose-500 text-xs mt-1">{errors.author}</p>}
        </div>

        {/* ISBN */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">ISBN</label>
          <input
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            className="library-input"
            placeholder="978-xxx-xxx-xxx-x"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Kategori</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="library-input appearance-none cursor-pointer"
          >
            <option value="">Pilih Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Published Year */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Tahun Terbit</label>
          <input
            name="published_year"
            type="number"
            value={formData.published_year}
            onChange={handleChange}
            className="library-input"
            placeholder="2024"
            min="1000"
            max="9999"
          />
          {errors.published_year && <p className="text-rose-500 text-xs mt-1">{errors.published_year}</p>}
        </div>

        {/* Pages */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Jumlah Halaman</label>
          <input
            name="pages"
            type="number"
            value={formData.pages}
            onChange={handleChange}
            className="library-input"
            placeholder="300"
            min="1"
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Bahasa</label>
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="library-input appearance-none cursor-pointer"
          >
            <option value="Indonesia">Indonesia</option>
            <option value="Inggris">Inggris</option>
            <option value="Jepang">Jepang</option>
            <option value="Arab">Arab</option>
          </select>
        </div>
      </div>

      {/* Hybrid Section: Fisik & E-Book */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
        {/* Physical Settings */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800">
            <input
              type="checkbox"
              name="is_physical"
              checked={formData.is_physical}
              onChange={handleChange}
              className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 border-stone-300"
            />
            <span className="flex items-center gap-1.5 text-sm">
              <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Tersedia Buku Fisik (Rak & Sirkulasi)
            </span>
          </label>
          {formData.is_physical && (
            <div className="space-y-2.5 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Stok Fisik</label>
                  <input
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleChange}
                    className="library-input py-2 text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Lokasi Rak</label>
                  <input
                    name="rack_location"
                    value={formData.rack_location}
                    onChange={handleChange}
                    className="library-input py-2 text-sm"
                    placeholder="Rak A-01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Kondisi Fisik (Stock Opname)</label>
                <select
                  name="physical_condition"
                  value={formData.physical_condition}
                  onChange={handleChange}
                  className="library-input py-2 text-xs appearance-none cursor-pointer"
                >
                  <option value="BAIK">Baik — Prima & Siap Pinjam</option>
                  <option value="RUSAK_RINGAN">Rusak Ringan — Masih Layak Baca</option>
                  <option value="PERBAIKAN">Dalam Konservasi — Meja Restorasi</option>
                  <option value="RUSAK_BERAT">Rusak Berat — Tidak Dipinjamkan</option>
                  <option value="HILANG">Hilang — Missing dari Rak Fisik</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Catatan Kondisi Fisik</label>
                <input
                  name="condition_notes"
                  value={formData.condition_notes}
                  onChange={handleChange}
                  className="library-input py-2 text-xs"
                  placeholder="Misal: Cover sudut terlipat, halaman komplit"
                />
              </div>
            </div>
          )}
        </div>

        {/* Digital Settings */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800">
            <input
              type="checkbox"
              name="is_digital"
              checked={formData.is_digital}
              onChange={handleChange}
              className="w-4 h-4 rounded text-sky-700 focus:ring-sky-600 border-stone-300"
            />
            <span className="flex items-center gap-1.5 text-sm">
              <svg className="w-4 h-4 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Tersedia E-Book (Digital Reader)
            </span>
          </label>
          {formData.is_digital && (
            <div className="space-y-2 pt-1">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">URL / Link Dokumen PDF</label>
                <input
                  name="ebook_url"
                  value={formData.ebook_url}
                  onChange={handleChange}
                  className="library-input py-2 text-sm"
                  placeholder="https://.../document.pdf"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Format</label>
                <select
                  name="ebook_format"
                  value={formData.ebook_format}
                  onChange={handleChange}
                  className="library-input py-2 text-sm appearance-none cursor-pointer"
                >
                  <option value="PDF">PDF</option>
                  <option value="EPUB">EPUB</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Deskripsi & Sinopsis</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="library-input resize-none"
          placeholder="Sinopsis singkat buku..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="library-btn-secondary" disabled={loading}>
            Batal
          </button>
        )}
        <button type="submit" className="library-btn-primary font-bold px-6" disabled={loading}>
          {loading ? 'Menyimpan...' : book ? 'Perbarui Buku' : 'Simpan Buku'}
        </button>
      </div>
    </form>
  );
}
