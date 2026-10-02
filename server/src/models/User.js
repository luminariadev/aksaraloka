import db from '../config/database.js';

class User {
  static async findAll({ role = '' } = {}) {
    let query = 'SELECT id, member_code, name, email, phone, role, avatar_url, is_active, created_at FROM users';
    const params = [];
    if (role) {
      query += ' WHERE role = $1';
      params.push(role);
    }
    query += ' ORDER BY name ASC';
    const res = await db.query(query, params);
    return res.rows;
  }

  static async findById(id) {
    const res = await db.query(
      'SELECT id, member_code, name, email, phone, role, avatar_url, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  }

  static async findByMemberCode(code) {
    const res = await db.query(
      'SELECT id, member_code, name, email, phone, role, avatar_url, is_active, created_at FROM users WHERE member_code = $1',
      [code]
    );
    return res.rows[0] || null;
  }

  static async create({ member_code, name, email, password, phone, role = 'MEMBER' }) {
    const code = member_code || `LIB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const query = `
      INSERT INTO users (member_code, name, email, password_hash, phone, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, member_code, name, email, phone, role, created_at
    `;
    const res = await db.query(query, [code, name, email, password || 'password123', phone || null, role]);
    return res.rows[0];
  }
}

export default User;
