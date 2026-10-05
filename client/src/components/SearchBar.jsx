import { useState } from 'react';

export default function SearchBar({ onSearch, categories, initialValues = {} }) {
  const [searchValue, setSearchValue] = useState(initialValues.search || '');
  const [selectedCategory, setSelectedCategory] = useState(initialValues.category_id || '');
  const [selectedFormat, setSelectedFormat] = useState(initialValues.format || 'all');
  const [sortBy, setSortBy] = useState(initialValues.sort_by || 'created_at');
  const [sortOrder, setSortOrder] = useState(initialValues.sort_order || 'DESC');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(searchValue, selectedCategory, sortBy, sortOrder, selectedFormat);
  };

  const clearFilters = () => {
    setSearchValue('');
    setSelectedCategory('');
    setSelectedFormat('all');
    setSortBy('created_at');
    setSortOrder('DESC');
    onSearch?.('', '', 'created_at', 'DESC', 'all');
  };

  return (
    <div className="library-card p-6 mb-8 shadow-sm">
      <form onSubmit={handleSearch} className="space-y-4 lg:space-y-0 lg:flex lg:gap-3 lg:items-end flex-wrap">
        {/* Search Input */}
        <div className="flex-1 min-w-[220px]">
          <label htmlFor="search" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Cari Judul / Penulis / ISBN
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Contoh: Laskar Pelangi, Andrea Hirata, React..."
              className="library-input pl-10"
            />
            <svg
              className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Format Filter */}
        <div className="w-full sm:w-44">
          <label htmlFor="format" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Format Koleksi
          </label>
          <select
            id="format"
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="library-input font-medium appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%208l3%203%203-3%22%20stroke%3D%22%2378716c%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-8"
          >
            <option value="all">Semua Format Koleksi</option>
            <option value="physical">Buku Fisik (Tersedia di Rak)</option>
            <option value="digital">E-Book Digital (PDF)</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="w-full sm:w-44">
          <label htmlFor="category" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Kategori
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="library-input appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%208l3%203%203-3%22%20stroke%3D%22%2378716c%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-8"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="w-full sm:w-36">
          <label htmlFor="sort" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
            Urutan
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="library-input appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%208l3%203%203-3%22%20stroke%3D%22%2378716c%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-8"
          >
            <option value="created_at">Terbaru</option>
            <option value="title">Judul (A-Z)</option>
            <option value="author">Penulis (A-Z)</option>
            <option value="published_year">Tahun</option>
          </select>
        </div>

        {/* Submit & Reset Buttons */}
        <div className="flex gap-2 sm:w-auto w-full pt-2 lg:pt-0">
          <button type="submit" className="library-btn-primary flex-1 sm:flex-none px-6">
            Cari Buku
          </button>
          {(searchValue || selectedCategory || selectedFormat !== 'all' || sortBy !== 'created_at' || sortOrder !== 'DESC') && (
            <button
              type="button"
              onClick={clearFilters}
              className="library-btn-secondary px-4 text-xs"
              title="Reset Filter"
            >
              Reset
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
