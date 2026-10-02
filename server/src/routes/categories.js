import { Router } from 'express';
import Category from '../models/Category.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
});

export default router;
