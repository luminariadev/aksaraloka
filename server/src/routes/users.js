import { Router } from 'express';
import User from '../models/User.js';

const router = Router();

// GET /api/users
router.get('/', async (req, res, next) => {
  try {
    const { role } = req.query;
    const users = await User.findAll({ role });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// POST /api/users
router.post('/', async (req, res, next) => {
  try {
    const { member_code, name, email, phone, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Nama dan email wajib diisi' });
    }
    const newUser = await User.create({ member_code, name, email, phone, role });
    res.status(201).json({ success: true, message: 'Anggota berhasil didaftarkan', data: newUser });
  } catch (error) {
    next(error);
  }
});

export default router;
