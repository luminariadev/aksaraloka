import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan kata sandi wajib diisi.',
      });
    }

    const userRes = await db.query(
      'SELECT id, member_code, name, email, password_hash, phone, role, is_active FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Kombinasi email atau kata sandi tidak ditemukan.',
      });
    }

    const user = userRes.rows[0];

    // Check password (bcrypt or fallback)
    let isMatch = false;
    if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    } else {
      isMatch = (user.password_hash === password);
      // Auto-upgrade plain hash to bcrypt
      if (isMatch) {
        const hashed = await bcrypt.hash(password, 10);
        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashed, user.id]);
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Kombinasi email atau kata sandi salah.',
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: `Selamat datang kembali, ${user.name}!`,
      token,
      user: {
        id: user.id,
        member_code: user.member_code,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan kata sandi wajib diisi.',
      });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email tersebut telah terdaftar dalam sistem.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const memberCode = `LIB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const insertQuery = `
      INSERT INTO users (member_code, name, email, password_hash, phone, role)
      VALUES ($1, $2, $3, $4, $5, 'MEMBER')
      RETURNING id, member_code, name, email, phone, role, created_at
    `;
    const newRes = await db.query(insertQuery, [
      memberCode,
      name.trim(),
      email.toLowerCase().trim(),
      hashedPassword,
      phone ? phone.trim() : null,
    ]);

    const newUser = newRes.rows[0];
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Pendaftaran anggota berhasil! Selamat bergabung di AksaraLoka.',
      token,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me (Get authenticated profile)
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    // Get active loans count for member
    const loansRes = await db.query(
      'SELECT COUNT(*) as count FROM loans WHERE user_id = $1 AND status = \'ACTIVE\'',
      [req.user.id]
    );

    res.json({
      success: true,
      user: {
        ...req.user,
        activeLoansCount: parseInt(loansRes.rows[0]?.count || 0),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/demo-accounts (Preset accounts for presentation)
router.get('/demo-accounts', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        email: 'admin@mylibrary.local',
        password: 'password123',
        name: 'Budi Santoso',
        role: 'ADMIN',
        roleLabel: 'Administrator Sistem (Kelola User & Pengaturan)',
        memberCode: 'ADM-001',
      },
      {
        email: 'pustakawan@mylibrary.local',
        password: 'password123',
        name: 'Siti Rahmah, S.I.Pust',
        role: 'LIBRARIAN',
        roleLabel: 'Pustakawan (Meja Sirkulasi & Impor Koleksi)',
        memberCode: 'LIB-001',
      },
      {
        email: 'rizkia@example.com',
        password: 'password123',
        name: 'Rizkia Nuari',
        role: 'MEMBER',
        roleLabel: 'Anggota Resmi Perpustakaan',
        memberCode: 'MBR-2026-001',
      },
    ],
  });
});

export default router;
