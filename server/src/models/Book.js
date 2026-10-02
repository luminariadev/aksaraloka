import db from '../config/database.js';

class Book {
  static async findAll({
    page = 1,
    limit = 12,
    search = '',
    categoryId = null,
    format = 'all', // 'all' | 'physical' | 'digital'
    condition = null, // 'BAIK' | 'RUSAK_RINGAN' | 'RUSAK_BERAT' | 'PERBAIKAN' | 'HILANG'
    sortBy = 'created_at',
    sortOrder = 'DESC',
  }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(
        `(b.title ILIKE $${paramIndex} OR b.author ILIKE $${paramIndex} OR b.isbn ILIKE $${paramIndex} OR b.description ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (categoryId) {
      conditions.push(`b.category_id = $${paramIndex}`);
      params.push(categoryId);
      paramIndex++;
    }

    if (condition) {
      conditions.push(`b.physical_condition = $${paramIndex}`);
      params.push(condition);
      paramIndex++;
    }

    if (format === 'physical') {
      conditions.push('b.is_physical = 1');
    } else if (format === 'digital') {
      conditions.push('b.is_digital = 1');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Whitelist valid sort fields to prevent SQL injection
    const validSortFields = {
      title: 'b.title',
      author: 'b.author',
      published_year: 'b.published_year',
      created_at: 'b.created_at',
      updated_at: 'b.updated_at',
      stock: 'b.stock',
    };
    const sortColumn = validSortFields[sortBy] || 'b.created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countQuery = `SELECT COUNT(*) as count FROM books b ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0]?.count || 0);

    const dataQuery = `
      SELECT b.*, c.name as category_name
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      ${whereClause}
      ORDER BY ${sortColumn} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);
    const dataResult = await db.query(dataQuery, params);

    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async findById(id) {
    const query = `
      SELECT b.*, c.name as category_name
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  static async create(bookData) {
    const {
      title,
      author,
      isbn,
      description,
      category_id,
      cover_url,
      published_year,
      pages,
      language,
      stock,
      is_physical,
      rack_location,
      is_digital,
      ebook_url,
      ebook_format,
    } = bookData;

    const query = `
      INSERT INTO books (
        title, author, isbn, description, category_id, cover_url,
        published_year, pages, language, stock, is_physical, rack_location,
        is_digital, ebook_url, ebook_format
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const values = [
      title,
      author,
      isbn || null,
      description || null,
      category_id || null,
      cover_url || null,
      published_year || null,
      pages || null,
      language || 'Indonesia',
      stock !== undefined ? parseInt(stock) : 1,
      is_physical !== undefined ? (is_physical ? 1 : 0) : 1,
      rack_location || 'Rak Umum',
      is_digital !== undefined ? (is_digital ? 1 : 0) : 0,
      ebook_url || null,
      ebook_format || 'PDF',
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async update(id, bookData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      'title',
      'author',
      'isbn',
      'description',
      'category_id',
      'cover_url',
      'published_year',
      'pages',
      'language',
      'stock',
      'is_physical',
      'rack_location',
      'is_digital',
      'ebook_url',
      'ebook_format',
      'physical_condition',
      'condition_notes',
      'last_inspected_at',
    ];

    for (const field of allowedFields) {
      if (bookData[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        let val = bookData[field];
        if (field === 'is_physical' || field === 'is_digital') {
          val = val ? 1 : 0;
        }
        values.push(val);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE books
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  static async updateCondition(id, condition, notes = '') {
    const query = `
      UPDATE books
      SET physical_condition = $1,
          condition_notes = $2,
          last_inspected_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const result = await db.query(query, [condition, notes || null, id]);
    return result.rows[0] || null;
  }

  static async getConditionStats() {
    const statsQuery = `
      SELECT 
        COUNT(CASE WHEN is_physical = 1 THEN 1 END) as total_physical,
        COUNT(CASE WHEN is_physical = 1 AND (physical_condition = 'BAIK' OR physical_condition IS NULL) THEN 1 END) as baik,
        COUNT(CASE WHEN is_physical = 1 AND physical_condition = 'RUSAK_RINGAN' THEN 1 END) as rusak_ringan,
        COUNT(CASE WHEN is_physical = 1 AND physical_condition = 'RUSAK_BERAT' THEN 1 END) as rusak_berat,
        COUNT(CASE WHEN is_physical = 1 AND physical_condition = 'PERBAIKAN' THEN 1 END) as perbaikan,
        COUNT(CASE WHEN is_physical = 1 AND physical_condition = 'HILANG' THEN 1 END) as hilang
      FROM books
    `;
    const res = await db.query(statsQuery);
    return res.rows[0] || { total_physical: 0, baik: 0, rusak_ringan: 0, rusak_berat: 0, perbaikan: 0, hilang: 0 };
  }

  static async delete(id) {
    const query = 'DELETE FROM books WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  static async getCategories() {
    const query = 'SELECT * FROM categories ORDER BY name';
    const result = await db.query(query);
    return result.rows;
  }
}

export default Book;
