import { Router } from 'express';
import Loan from '../models/Loan.js';
import db from '../config/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/loans/my-loans - Member personal loans (Protected)
router.get('/my-loans', requireAuth, async (req, res, next) => {
  try {
    const query = `
      SELECT l.*,
             b.title as book_title, b.author as book_author, b.isbn as book_isbn,
             b.cover_url as book_cover, b.rack_location, b.ebook_url, b.is_digital
      FROM loans l
      LEFT JOIN books b ON l.book_id = b.id
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC
    `;
    const result = await db.query(query, [req.user.id]);
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/loans - List loans (Librarian/Admin only)
router.get('/', requireAuth, requireRole('ADMIN', 'LIBRARIAN'), async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await Loan.findAll({
      status,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// GET /api/loans/stats - Summary statistics (Librarian/Admin)
router.get('/stats', requireAuth, requireRole('ADMIN', 'LIBRARIAN'), async (req, res, next) => {
  try {
    const stats = await Loan.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// GET /api/loans/:id - Detail loan
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Data peminjaman tidak ditemukan' });
    }

    // Members can only see their own loan unless librarian/admin
    if (req.user.role === 'MEMBER' && loan.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    res.json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
});

// POST /api/loans - Create new physical borrowing (Protected)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { book_id, borrow_date, due_date, notes } = req.body;
    let targetUserId = req.body.user_id;

    // If logged in as member, targetUserId is strictly their own ID
    if (req.user.role === 'MEMBER') {
      targetUserId = req.user.id;
    } else if (!targetUserId) {
      targetUserId = req.user.id;
    }

    if (!book_id) {
      return res.status(400).json({ success: false, message: 'book_id wajib diisi' });
    }

    // Verify book stock
    const bookCheck = await db.query('SELECT stock, title FROM books WHERE id = $1', [book_id]);
    if (bookCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
    }
    if (bookCheck.rows[0].stock <= 0) {
      return res.status(400).json({ success: false, message: 'Stok fisik buku saat ini sedang habis dipinjam.' });
    }

    const newLoan = await Loan.create({
      userId: targetUserId,
      bookId: book_id,
      borrowDate: borrow_date,
      dueDate: due_date,
      notes,
    });

    res.status(201).json({
      success: true,
      message: `Peminjaman buku "${bookCheck.rows[0].title}" berhasil diajukan.`,
      data: newLoan,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/loans/:id/return - Return a book (Librarian/Admin only)
router.post('/:id/return', requireAuth, requireRole('ADMIN', 'LIBRARIAN'), async (req, res, next) => {
  try {
    const { notes } = req.body;
    const returned = await Loan.returnBook(req.params.id, notes);
    if (!returned) {
      return res.status(404).json({ success: false, message: 'Transaksi peminjaman tidak ditemukan' });
    }
    res.json({
      success: true,
      message: 'Buku berhasil diverifikasi dan dikembalikan ke rak.',
      data: returned,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
