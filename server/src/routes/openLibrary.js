import { Router } from 'express';
import openLibraryService from '../services/openLibraryService.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/open-library/search - Public search across millions of books via Open Library
router.get('/search', async (req, res, next) => {
  try {
    const { q, limit } = req.query;
    const result = await openLibraryService.searchBooks(q || '', parseInt(limit) || 16);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/open-library/trending - Get trending books by subject from Open Library
router.get('/trending', async (req, res, next) => {
  try {
    const { subject, limit } = req.query;
    const result = await openLibraryService.getTrendingBooks(subject || 'literature', parseInt(limit) || 16);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/open-library/import - Librarian/Admin 1-click import into AksaraLoka database
router.post('/import', requireAuth, requireRole('LIBRARIAN', 'ADMIN'), async (req, res, next) => {
  try {
    const { book, options } = req.body;
    if (!book || !book.title) {
      return res.status(400).json({
        success: false,
        message: 'Data buku Open Library tidak valid.',
      });
    }

    const result = await openLibraryService.importBook(book, options || {});
    res.status(result.alreadyExists ? 200 : 201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
