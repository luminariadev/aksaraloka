import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { 
  getAllBooks, 
  getBookById, 
  createBook, 
  updateBook, 
  deleteBook,
  updateBookCondition,
  getConditionStats
} from '../controllers/bookController.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Public: Condition stats summary for physical collection
router.get('/stats/condition', getConditionStats);

// Public: Browse & View
router.get('/',
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('format').optional().isIn(['all', 'physical', 'digital']),
  query('condition').optional().isIn(['BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT', 'PERBAIKAN', 'HILANG']),
  validate,
  getAllBooks
);

router.get('/:id',
  param('id').isInt({ min: 1 }).toInt(),
  validate,
  getBookById
);

// Protected: Only Admin/Librarian can mutate catalog
router.post('/',
  requireAuth,
  requireRole('ADMIN', 'LIBRARIAN'),
  body('title').trim().notEmpty().withMessage('Judul buku wajib diisi'),
  body('author').trim().notEmpty().withMessage('Penulis wajib diisi'),
  body('isbn').optional().trim(),
  body('description').optional().trim(),
  body('category_id').optional().isInt({ min: 1 }).toInt(),
  body('published_year').optional().isInt({ min: 1000, max: 9999 }).toInt(),
  body('pages').optional().isInt({ min: 1 }).toInt(),
  body('language').optional().trim(),
  body('stock').optional().isInt({ min: 0 }).toInt(),
  body('is_physical').optional().isBoolean().toBoolean(),
  body('rack_location').optional().trim(),
  body('is_digital').optional().isBoolean().toBoolean(),
  body('ebook_url').optional().trim(),
  body('ebook_format').optional().trim(),
  body('physical_condition').optional().isIn(['BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT', 'PERBAIKAN', 'HILANG']),
  body('condition_notes').optional().trim(),
  validate,
  createBook
);

// Dedicated condition update / Stock Opname check
router.patch('/:id/condition',
  requireAuth,
  requireRole('ADMIN', 'LIBRARIAN'),
  param('id').isInt({ min: 1 }).toInt(),
  body('physical_condition').isIn(['BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT', 'PERBAIKAN', 'HILANG']).withMessage('Status kondisi fisik tidak valid'),
  body('condition_notes').optional().trim(),
  validate,
  updateBookCondition
);

router.put('/:id',
  requireAuth,
  requireRole('ADMIN', 'LIBRARIAN'),
  param('id').isInt({ min: 1 }).toInt(),
  body('title').optional().trim().notEmpty(),
  body('author').optional().trim().notEmpty(),
  body('isbn').optional().trim(),
  body('description').optional().trim(),
  body('category_id').optional().isInt({ min: 1 }).toInt(),
  body('published_year').optional().isInt({ min: 1000, max: 9999 }).toInt(),
  body('pages').optional().isInt({ min: 1 }).toInt(),
  body('language').optional().trim(),
  body('stock').optional().isInt({ min: 0 }).toInt(),
  body('is_physical').optional().isBoolean().toBoolean(),
  body('rack_location').optional().trim(),
  body('is_digital').optional().isBoolean().toBoolean(),
  body('ebook_url').optional().trim(),
  body('ebook_format').optional().trim(),
  body('physical_condition').optional().isIn(['BAIK', 'RUSAK_RINGAN', 'RUSAK_BERAT', 'PERBAIKAN', 'HILANG']),
  body('condition_notes').optional().trim(),
  validate,
  updateBook
);

router.delete('/:id',
  requireAuth,
  requireRole('ADMIN', 'LIBRARIAN'),
  param('id').isInt({ min: 1 }).toInt(),
  validate,
  deleteBook
);

export default router;
