import db from '../config/database.js';

class OpenLibraryService {
  /**
   * Search books directly from the official Open Library REST API
   * (Top open-source book API in public-apis)
   */
  async searchBooks(query, limit = 16) {
    if (!query || !query.trim()) {
      return this.getTrendingBooks('literature', limit);
    }

    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query.trim())}&limit=${limit}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AksaraLoka-App/2.0 (education-project; contact: info@aksaraloka.local)',
        },
      });

      if (!response.ok) {
        throw new Error(`Open Library API responded with status ${response.status}`);
      }

      const data = await response.json();
      const docs = data.docs || [];

      const formatted = docs.map((doc) => {
        const coverId = doc.cover_i;
        const workKey = (doc.key || '').replace('/works/', '');
        const isbn = Array.isArray(doc.isbn) && doc.isbn.length > 0 ? doc.isbn[0] : null;

        return {
          openlibrary_work_id: workKey,
          title: doc.title,
          author: Array.isArray(doc.author_name) ? doc.author_name.join(', ') : 'Penulis Tidak Diketahui',
          isbn: isbn || (workKey ? `OL-${workKey}` : null),
          published_year: doc.first_publish_year || null,
          pages: doc.number_of_pages_median || null,
          language: Array.isArray(doc.language) ? doc.language[0] : 'Indonesia',
          cover_url: coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
            : `https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600`,
          cover_thumbnail: coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
            : null,
          subjects: Array.isArray(doc.subject) ? doc.subject.slice(0, 4) : [],
          edition_count: doc.edition_count || 1,
          openlibrary_url: `https://openlibrary.org${doc.key}`,
          has_fulltext: !!doc.has_fulltext,
        };
      });

      return {
        totalFound: data.numFound || 0,
        query,
        source: 'Open Library (Internet Archive)',
        books: formatted,
      };
    } catch (error) {
      console.error('Error fetching from Open Library API:', error.message);
      throw error;
    }
  }

  /**
   * Get trending/curated subject books from Open Library
   */
  async getTrendingBooks(subject = 'literature', limit = 16) {
    try {
      const url = `https://openlibrary.org/subjects/${encodeURIComponent(subject.toLowerCase())}.json?limit=${limit}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'AksaraLoka-App/2.0 (education-project; contact: info@aksaraloka.local)',
        },
      });

      if (!response.ok) {
        throw new Error(`Open Library API responded with status ${response.status}`);
      }

      const data = await response.json();
      const works = data.works || [];

      const formatted = works.map((work) => {
        const coverId = work.cover_id;
        const workKey = (work.key || '').replace('/works/', '');

        const authorNames = Array.isArray(work.authors)
          ? work.authors.map(a => a.name).join(', ')
          : 'Penulis Klasik';

        return {
          openlibrary_work_id: workKey,
          title: work.title,
          author: authorNames,
          isbn: `OL-${workKey}`,
          published_year: work.first_publish_year || null,
          pages: null,
          language: 'Indonesia / English',
          cover_url: coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
            : `https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600`,
          cover_thumbnail: coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
            : null,
          subjects: Array.isArray(work.subject) ? work.subject.slice(0, 4) : [subject],
          edition_count: work.edition_count || 1,
          openlibrary_url: `https://openlibrary.org${work.key}`,
          has_fulltext: !!work.has_fulltext,
        };
      });

      return {
        totalFound: data.work_count || works.length,
        subject,
        source: 'Open Library (Internet Archive)',
        books: formatted,
      };
    } catch (error) {
      console.error('Error fetching trending from Open Library:', error.message);
      throw error;
    }
  }

  /**
   * Import book metadata from Open Library directly into AksaraLoka database
   */
  async importBook(bookData, { rackLocation = 'Rak Terbuka OL-01', stock = 3, isPhysical = true, isDigital = true } = {}) {
    // 1. Resolve or create category
    let categoryId = 1; // Default
    if (bookData.subjects && bookData.subjects.length > 0) {
      const sub = bookData.subjects[0].toLowerCase();
      let catName = 'Sastra';
      if (sub.includes('sci')) catName = 'Sains';
      else if (sub.includes('hist')) catName = 'Sejarah';
      else if (sub.includes('tech') || sub.includes('comput')) catName = 'Teknologi';
      else if (sub.includes('bio')) catName = 'Biografi';
      else if (sub.includes('fict') || sub.includes('novel')) catName = 'Fiksi';

      const catCheck = await db.query('SELECT id FROM categories WHERE LOWER(name) = $1', [catName.toLowerCase()]);
      if (catCheck.rows.length > 0) {
        categoryId = catCheck.rows[0].id;
      }
    }

    // 2. Check if already imported by ISBN or title
    const existing = await db.query(
      'SELECT id, title FROM books WHERE title = $1 OR (isbn IS NOT NULL AND isbn = $2)',
      [bookData.title, bookData.isbn || '']
    );

    if (existing.rows.length > 0) {
      return {
        alreadyExists: true,
        book: existing.rows[0],
        message: `Buku "${bookData.title}" sudah terdaftar dalam katalog perpustakaan.`,
      };
    }

    // 3. Insert into books table
    const query = `
      INSERT INTO books (
        title, author, isbn, description, category_id, cover_url,
        published_year, pages, language, stock, is_physical, rack_location,
        is_digital, ebook_url, ebook_format, gutenberg_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;

    const description = bookData.description ||
      `Koleksi karya "${bookData.title}" oleh ${bookData.author}. Metadata dikurasi dan diimpor melalui Open Library (Internet Archive).`;

    const ebookUrl = isDigital
      ? (bookData.openlibrary_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf')
      : null;

    const values = [
      bookData.title,
      bookData.author || 'Anonim',
      bookData.isbn || null,
      description,
      categoryId,
      bookData.cover_url,
      bookData.published_year ? parseInt(bookData.published_year) : null,
      bookData.pages ? parseInt(bookData.pages) : 320,
      bookData.language || 'Indonesia',
      isPhysical ? parseInt(stock) : 0,
      isPhysical ? 1 : 0,
      rackLocation,
      isDigital ? 1 : 0,
      ebookUrl,
      'PDF',
      bookData.gutenberg_id || null,
    ];

    const result = await db.query(query, values);
    return {
      alreadyExists: false,
      book: result.rows[0],
      message: `Buku "${bookData.title}" berhasil diimpor ke katalog perpustakaan.`,
    };
  }
}

export default new OpenLibraryService();
