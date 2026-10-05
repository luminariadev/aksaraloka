export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total } = pagination;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav className="library-card p-4 mt-8" aria-label="Pagination">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs sm:text-sm text-stone-500">
          Menampilkan <span className="font-semibold text-stone-800">{Math.min((page - 1) * 12 + 1, total)}</span> –{' '}
          <span className="font-semibold text-stone-800">{Math.min(page * 12, total)}</span> dari{' '}
          <span className="font-semibold text-stone-800">{total}</span> koleksi buku
        </p>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="library-btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
            aria-label="Halaman sebelumnya"
          >
            &laquo; Sebelumnya
          </button>

          <div className="flex items-center gap-1 px-1">
            {getPageNumbers().map((pageNum, idx) =>
              pageNum === '...' ? (
                <span key={`dots-${idx}`} className="px-2 py-1 text-stone-400 text-xs">...</span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                    page === pageNum
                      ? 'bg-stone-900 text-amber-100 shadow-sm'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                  aria-current={page === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="library-btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
            aria-label="Halaman berikutnya"
          >
            Selanjutnya &raquo;
          </button>
        </div>
      </div>
    </nav>
  );
}
