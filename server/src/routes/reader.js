import { Router } from 'express';
import gutenbergService from '../services/gutenbergService.js';
import db from '../config/database.js';

const router = Router();

// GET /api/reader/curated - List curated full-text readable open-source books
router.get('/curated', (req, res) => {
  const { category } = req.query;
  res.json({
    success: true,
    data: gutenbergService.getCuratedBooks(category || ''),
  });
});

// GET /api/reader/search - Search Gutendex / Project Gutenberg
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    const result = await gutenbergService.searchGutendex(q || '');
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reader/gutenberg/:id - Direct in-browser readable content by Gutenberg ID
router.get('/gutenberg/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookContent = await gutenbergService.getBookContent(id);
    res.json({
      success: true,
      data: bookContent,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reader/book/:id - Direct in-browser readable content for any catalog book
router.get('/book/:id', async (req, res, next) => {
  try {
    const bookId = parseInt(req.params.id);
    const bookRes = await db.query('SELECT * FROM books WHERE id = $1', [bookId]);

    if (bookRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan di katalog.' });
    }

    const book = bookRes.rows[0];

    // Case 1: Linked to a Gutenberg open-source book
    if (book.gutenberg_id) {
      const gutenbergContent = await gutenbergService.getBookContent(book.gutenberg_id);
      return res.json({
        success: true,
        data: {
          ...gutenbergContent,
          book_id: book.id,
          title: book.title || gutenbergContent.title,
          author: book.author || gutenbergContent.author,
          rack_location: book.rack_location,
        },
      });
    }

    // Case 2: Has local readable chapters / excerpt in database
    if (book.readable_content) {
      try {
        const parsed = JSON.parse(book.readable_content);
        return res.json({
          success: true,
          data: {
            book_id: book.id,
            title: book.title,
            author: book.author,
            cover_url: book.cover_url,
            language: book.language || 'Indonesia',
            total_chapters: parsed.chapters?.length || 1,
            chapters: parsed.chapters || [],
            source: 'Koleksi Naskah Terpilih AksaraLoka',
          },
        });
      } catch (e) {
        // Fall through to plain text
      }
    }

    // Case 3: Create rich multi-chapter monograph excerpt from book details
    const sampleChapters = [
      {
        chapter_number: 1,
        title: 'Bab I: Pengantar & Konteks Karya',
        paragraphs: [
          `Selamat datang di ruang baca naskah terpilih AksaraLoka untuk karya "${book.title}".`,
          `Buku karangan ${book.author} ini terbit pertama kali pada tahun ${book.published_year || 'koleksi modern'} dan telah menjadi salah satu rujukan berharga dalam kategori literatur perpustakaan.`,
          book.description || `Karya ini menghadirkan pembahasan mendalam dan perspektif komprehensif mengenai tema-tema utama yang diangkat oleh ${book.author}.`,
          `Bagi para pembaca yang menaruh minat pada kajian ini, karya ini menyajikan jalinan pemikiran yang runut dan mengalir, memadukan observasi mendalam dengan narasi yang menggugah nalar.`,
          `Eksemplar naskah cetak dapat ditemukan di ${book.rack_location || 'Rak Utama Perpustakaan'}, sementara format digital ini disajikan untuk kemudahan telaah awal dan pembacaan mandiri.`
        ],
        word_count: 240,
      },
      {
        chapter_number: 2,
        title: 'Bab II: Intisari Gagasan & Pokok Pembahasan',
        paragraphs: [
          `Inti sari dari pemikiran yang termuat dalam "${book.title}" berpijak pada eksplorasi gagasan yang relevan dengan perkembangan zaman.`,
          `${book.author} mengajak pembaca untuk tidak sekadar menerima informasi secara pasif, melainkan mengkaji setiap konsep dengan daya kritis dan keterbukaan intelektual.`,
          `Dalam bab-bab utamanya, karya ini menguraikan argumentasi bertahap: mulai dari landasan filosofis atau teoretis, tinjauan terhadap fenomena nyata, hingga pendekatan praktis yang dapat diterapkan oleh pembaca dalam kehidupan keseharian maupun kerja profesional.`,
          `Kekuatan buku ini terletak pada kemampuannya menyederhanakan gagasan-gagasan kompleks menjadi analogi dan narasi yang mudah dipahami tanpa kehilangan kedalaman substansinya.`
        ],
        word_count: 260,
      },
      {
        chapter_number: 3,
        title: 'Bab III: Refleksi & Relevansi Kontemporer',
        paragraphs: [
          `Menutup telaah naskah ini, relevansi pemikiran ${book.author} tetap bergema kuat dalam dinamika masyarakat modern saat ini.`,
          `Di tengah derasnya arus disrupsi dan banjir informasi, membaca karya-karya bermutu seperti "${book.title}" menjadi sebuah jeda reflektif yang mengasah kepekaan nalar dan ketenangan berpikir.`,
          `Setiap lembar karya ini mengajak kita untuk terus memupuk rasa ingin tahu (intellectual curiosity) dan memegang teguh integritas dalam berkarya.`,
          `Semoga pembacaan naskah ini di AksaraLoka memberikan inspirasi segar dan memperkaya khazanah wawasan Anda.`
        ],
        word_count: 230,
      },
    ];

    res.json({
      success: true,
      data: {
        book_id: book.id,
        title: book.title,
        author: book.author,
        cover_url: book.cover_url,
        language: book.language || 'Indonesia',
        total_chapters: sampleChapters.length,
        chapters: sampleChapters,
        source: 'Katalog Koleksi AksaraLoka',
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/reader/progress - Save member's reading progress
router.post('/progress', async (req, res, next) => {
  try {
    const { user_id, book_id, last_chapter, progress_percent } = req.body;
    if (!book_id) {
      return res.status(400).json({ success: false, message: 'book_id wajib diisi.' });
    }

    const userId = req.user ? req.user.id : (user_id || 2); // Default to member

    await db.query(`
      INSERT INTO reading_logs (user_id, book_id, last_page, progress_percent, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    `, [userId, book_id, last_chapter || 1, progress_percent || 0]);

    res.json({
      success: true,
      message: 'Progres membaca berhasil dicatat.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
