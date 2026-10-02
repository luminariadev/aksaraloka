import db from '../config/database.js';

class Loan {
  static async findAll({ status = '', page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`l.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as count FROM loans l ${whereClause}`;
    const countRes = await db.query(countQuery, params);
    const total = parseInt(countRes.rows[0]?.count || 0);

    const query = `
      SELECT l.*,
             u.name as user_name, u.member_code, u.email as user_email,
             b.title as book_title, b.isbn as book_isbn, b.cover_url as book_cover, b.rack_location
      FROM loans l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN books b ON l.book_id = b.id
      ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);
    const res = await db.query(query, params);

    return {
      data: res.rows,
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
      SELECT l.*,
             u.name as user_name, u.member_code, u.email as user_email, u.phone as user_phone,
             b.title as book_title, b.isbn as book_isbn, b.cover_url as book_cover, b.rack_location
      FROM loans l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN books b ON l.book_id = b.id
      WHERE l.id = $1
    `;
    const res = await db.query(query, [id]);
    return res.rows[0] || null;
  }

  static async create({ userId, bookId, borrowDate, dueDate, notes }) {
    // Generate loan code
    const loanCode = `TR-${Date.now().toString().slice(-6)}`;
    const bDate = borrowDate || new Date().toISOString().split('T')[0];
    const dDate = dueDate || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0];

    const insertQuery = `
      INSERT INTO loans (loan_code, user_id, book_id, borrow_date, due_date, status, notes)
      VALUES ($1, $2, $3, $4, $5, 'ACTIVE', $6)
      RETURNING *
    `;
    const loanRes = await db.query(insertQuery, [loanCode, userId, bookId, bDate, dDate, notes || null]);

    // Decrease book available stock
    await db.query(`UPDATE books SET stock = MAX(0, stock - 1) WHERE id = $1`, [bookId]);

    return loanRes.rows[0];
  }

  static async returnBook(loanId, notes = '') {
    const loan = await this.findById(loanId);
    if (!loan) return null;
    if (loan.status === 'RETURNED') return loan;

    const returnDate = new Date().toISOString().split('T')[0];

    // Calculate fine if overdue (Rp 1.000 / day)
    let fine = 0;
    const dueDateObj = new Date(loan.due_date);
    const retDateObj = new Date(returnDate);
    const diffTime = retDateObj - dueDateObj;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      fine = diffDays * 1000;
    }

    const updateQuery = `
      UPDATE loans
      SET return_date = $1, status = 'RETURNED', fine_amount = $2, notes = COALESCE($3, notes)
      WHERE id = $4
      RETURNING *
    `;
    const res = await db.query(updateQuery, [returnDate, fine, notes || loan.notes, loanId]);

    // Restore book stock
    await db.query(`UPDATE books SET stock = stock + 1 WHERE id = $1`, [loan.book_id]);

    return res.rows[0];
  }

  static async getStats() {
    const activeRes = await db.query(`SELECT COUNT(*) as count FROM loans WHERE status = 'ACTIVE'`);
    const returnedRes = await db.query(`SELECT COUNT(*) as count FROM loans WHERE status = 'RETURNED'`);
    const booksRes = await db.query(`SELECT COUNT(*) as total_books, SUM(stock) as total_stock FROM books`);
    const membersRes = await db.query(`SELECT COUNT(*) as count FROM users WHERE role = 'MEMBER'`);

    return {
      activeLoans: parseInt(activeRes.rows[0]?.count || 0),
      returnedLoans: parseInt(returnedRes.rows[0]?.count || 0),
      totalBooks: parseInt(booksRes.rows[0]?.total_books || 0),
      totalStock: parseInt(booksRes.rows[0]?.total_stock || 0),
      totalMembers: parseInt(membersRes.rows[0]?.count || 0),
    };
  }
}

export default Loan;
