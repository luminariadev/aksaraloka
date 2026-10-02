import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect ALL admin routes with requireAuth AND requireRole('ADMIN')
router.use(requireAuth, requireRole('ADMIN'));

// GET /api/admin/stats - System-wide administrative overview
router.get('/stats', async (req, res, next) => {
  try {
    const usersCountRes = await db.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);

    const usersByRole = {
      ADMIN: 0,
      LIBRARIAN: 0,
      MEMBER: 0,
      total: 0,
    };

    usersCountRes.rows.forEach(r => {
      if (usersByRole[r.role] !== undefined) {
        usersByRole[r.role] = parseInt(r.count);
      }
      usersByRole.total += parseInt(r.count);
    });

    const booksRes = await db.query(`
      SELECT 
        COUNT(*) as total_titles,
        SUM(stock) as total_stock,
        SUM(CASE WHEN is_digital = 1 THEN 1 ELSE 0 END) as digital_titles,
        SUM(CASE WHEN is_physical = 1 THEN 1 ELSE 0 END) as physical_titles
      FROM books
    `);

    const loansRes = await db.query(`
      SELECT 
        COUNT(*) as total_loans,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_loans,
        SUM(CASE WHEN status = 'RETURNED' THEN 1 ELSE 0 END) as returned_loans,
        SUM(fine_amount) as total_fines
      FROM loans
    `);

    res.json({
      success: true,
      data: {
        users: usersByRole,
        catalog: booksRes.rows[0] || {},
        circulation: loansRes.rows[0] || {},
        engine: db.getActiveEngine ? db.getActiveEngine() : 'sqlite',
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users - List users with optional role filtering
router.get('/users', async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let query = `
      SELECT u.id, u.member_code, u.name, u.email, u.phone, u.role, u.is_active, u.created_at,
             (SELECT COUNT(*) FROM loans WHERE user_id = u.id AND status = 'ACTIVE') as active_loans
      FROM users u
      WHERE 1=1
    `;
    const params = [];

    if (role && role !== 'ALL') {
      params.push(role);
      query += ` AND u.role = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(u.name) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length} OR LOWER(u.member_code) LIKE $${params.length})`;
    }

    query += ' ORDER BY u.created_at DESC';

    const result = await db.query(query, params);
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/users - Create new user account (Admin can create Librarian, Member, or another Admin)
router.post('/users', async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan kata sandi wajib diisi.',
      });
    }

    const validRoles = ['ADMIN', 'LIBRARIAN', 'MEMBER'];
    const targetRole = validRoles.includes(role) ? role : 'MEMBER';

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email tersebut telah terdaftar dalam sistem.',
      });
    }

    const prefix = targetRole === 'ADMIN' ? 'ADM' : targetRole === 'LIBRARIAN' ? 'LIB' : 'MBR';
    const memberCode = `${prefix}-${Date.now().toString().slice(-6)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (member_code, name, email, password_hash, phone, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, 1)
      RETURNING id, member_code, name, email, phone, role, is_active, created_at
    `;

    const result = await db.query(query, [
      memberCode,
      name.trim(),
      email.toLowerCase().trim(),
      hashedPassword,
      phone ? phone.trim() : null,
      targetRole,
    ]);

    res.status(201).json({
      success: true,
      message: `Akun baru dengan peran ${targetRole} berhasil dibuat.`,
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:id/role - Update user's role (ADMIN, LIBRARIAN, MEMBER)
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    const userId = parseInt(req.params.id);

    const validRoles = ['ADMIN', 'LIBRARIAN', 'MEMBER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Peran tidak valid. Pilihan: ADMIN, LIBRARIAN, MEMBER',
      });
    }

    // Prevent changing own role to avoid lockout
    if (req.user.id === userId && role !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat menurunkan peran akun Anda sendiri untuk mencegah terkunci dari sistem.',
      });
    }

    const result = await db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: `Peran pengguna "${result.rows[0].name}" berhasil diubah menjadi ${role}.`,
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:id/status - Toggle user active / suspended status
router.put('/users/:id/status', async (req, res, next) => {
  try {
    const { is_active } = req.body;
    const userId = parseInt(req.params.id);

    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat menonaktifkan akun Anda sendiri.',
      });
    }

    const result = await db.query(
      'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, name, email, is_active',
      [is_active ? 1 : 0, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: `Status akun "${result.rows[0].name}" berhasil diperbarui.`,
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/settings - Read library system configuration
router.get('/settings', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM settings ORDER BY key ASC');
    const settingsMap = {};
    result.rows.forEach(r => {
      settingsMap[r.key] = r.value;
    });

    res.json({
      success: true,
      data: settingsMap,
      raw: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/settings - Update library system configuration
router.put('/settings', async (req, res, next) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Format pengaturan tidak valid.' });
    }

    for (const [key, value] of Object.entries(settings)) {
      await db.query(
        'INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP',
        [key, String(value)]
      );
    }

    res.json({
      success: true,
      message: 'Pengaturan perpustakaan berhasil disimpan.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
