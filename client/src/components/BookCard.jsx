import { Link } from 'react-router-dom';

export default function BookCard({ book }) {
  const getCoverUrl = (book) => {
    if (book.cover_url) return book.cover_url;
    return `https://picsum.photos/seed/${book.isbn || book.id}/300/400.jpg`;
  };

  return (
    <article className="group library-card p-4 hover:border-amber-700/30 flex flex-col justify-between transition-all duration-300">
      <Link
        to={`/books/${book.id}`}
        className="block focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 rounded-xl"
        aria-label={`Lihat detail ${book.title}`}
      >
        {/* Book Cover with Spine Depth */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-r-xl rounded-l-sm shadow-book border-l-4 border-stone-900/25 bg-stone-100 mb-3.5">
          <img
            src={getCoverUrl(book)}
            alt={`Cover ${book.title}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* Badges on Cover */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {book.is_digital === 1 && (
              <span className="bg-sky-700/90 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-sm flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                E-Book
              </span>
            )}
            {book.is_physical === 1 && (
              <span className="bg-emerald-800/90 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-sm">
                Fisik
              </span>
            )}
            {book.is_physical === 1 && book.physical_condition === 'PERBAIKAN' && (
              <span className="bg-orange-600/95 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
                Konservasi
              </span>
            )}
          </div>

          {book.is_physical === 1 && book.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-2 text-center">
              <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                Stok Dipinjam
              </span>
            </div>
          )}
        </div>

        {/* Book Information */}
        <div className="space-y-1.5">
          <h3 className="font-serif font-bold text-base text-stone-900 line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors">
            {book.title}
          </h3>

          <p className="text-xs text-stone-500 font-medium line-clamp-1">
            {book.author}
          </p>

          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {book.category_name && (
              <span className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[11px] font-medium rounded-md border border-stone-200">
                {book.category_name}
              </span>
            )}
            {book.published_year && (
              <span className="text-[11px] text-stone-400 font-mono">
                {book.published_year}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Footer Info: Rack location / Stock */}
      <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t border-stone-100 text-stone-500">
        <span className="truncate max-w-[120px] flex items-center gap-1" title={book.rack_location}>
          {book.rack_location ? (
            <>
              <svg className="w-3 h-3 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{book.rack_location}</span>
            </>
          ) : (
            `${book.pages || '-'} hal`
          )}
        </span>
        {(book.is_digital === 1 || book.gutenberg_id) ? (
          <Link
            to={`/reader/${book.id}`}
            className="text-amber-900 font-semibold text-[11px] bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-200 transition-colors flex items-center gap-1"
          >
            <span>Baca Web</span>
            <span>→</span>
          </Link>
        ) : book.is_physical === 1 ? (
          <div className="text-right">
            <span className={`font-semibold ${book.stock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {book.stock > 0 ? `Stok: ${book.stock}` : 'Habis'}
            </span>
            {book.physical_condition && book.physical_condition !== 'BAIK' && (
              <span className="block text-[9px] text-orange-700 font-medium">
                {book.physical_condition === 'PERBAIKAN' ? 'Konservasi' :
                 book.physical_condition === 'RUSAK_RINGAN' ? 'Rusak Ringan' :
                 book.physical_condition === 'RUSAK_BERAT' ? 'Rusak Berat' : 'Hilang'}
              </span>
            )}
          </div>
        ) : (
          <span className="text-stone-400">Arsip</span>
        )}
      </div>
    </article>
  );
}
