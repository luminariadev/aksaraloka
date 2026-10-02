import Book from '../models/Book.js';

export const getAllBooks = async (req, res, next) => {
  try {
    const { page, limit, search, category_id, sort_by, sort_order, format, condition } = req.query;
    const result = await Book.findAll({
      page: parseInt(page) || 1,
      limit: Math.min(parseInt(limit) || 12, 100),
      search,
      categoryId: category_id,
      format: format || 'all',
      condition: condition || null,
      sortBy: sort_by,
      sortOrder: sort_order,
    });
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
    }
    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

export const createBook = async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, message: 'Buku berhasil ditambahkan', data: book });
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const book = await Book.update(req.params.id, req.body);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
    }
    res.json({ success: true, message: 'Buku berhasil diperbarui', data: book });
  } catch (error) {
    next(error);
  }
};

export const updateBookCondition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { physical_condition, condition_notes } = req.body;
    if (!physical_condition) {
      return res.status(400).json({ success: false, message: 'Status kondisi fisik buku wajib disertakan.' });
    }
    const book = await Book.updateCondition(id, physical_condition, condition_notes);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
    }
    res.json({
      success: true,
      message: `Audit kondisi buku berhasil disimpan (${physical_condition}).`,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

export const getConditionStats = async (req, res, next) => {
  try {
    const stats = await Book.getConditionStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.delete(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
    }
    res.json({ success: true, message: 'Buku berhasil dihapus', data: book });
  } catch (error) {
    next(error);
  }
};
