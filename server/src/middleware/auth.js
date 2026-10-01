import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mylibrary-editorial-secret-2026';

/**
 * Middleware to extract and verify JWT from Authorization header
 */
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userRes = await db.query(
      'SELECT id, member_code, name, email, phone, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userRes.rows.length === 0 || !userRes.rows[0].is_active) {
      req.user = null;
      return next();
    }

    req.user = userRes.rows[0];
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

/**
 * Middleware to require authenticated user
 */
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Sesi tidak valid atau telah berakhir. Silakan masuk terlebih dahulu.',
    });
  }
  next();
};

/**
 * Middleware to restrict by roles (e.g. requireRole('ADMIN', 'LIBRARIAN'))
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Silakan masuk untuk mengakses fitur ini.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak: Akun Anda tidak memiliki wewenang untuk tindakan ini.',
        requiredRoles: roles,
        yourRole: req.user.role,
      });
    }

    next();
  };
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      member_code: user.member_code,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export default {
  authenticate,
  requireAuth,
  requireRole,
  generateToken,
};
