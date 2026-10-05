import { Router } from 'express';
import comicService from '../services/comicService.js';

const router = Router();

// GET /api/comics - List curated open-source manga & webcomics
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: comicService.getCuratedComics(),
  });
});

// GET /api/comics/:id - Get details and chapter list of a comic
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const detail = await comicService.getComicDetail(id);
    res.json({
      success: true,
      data: detail,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/comics/chapter/:chapterId - Get pages for in-browser visual comic reading
router.get('/chapter/:chapterId', async (req, res, next) => {
  try {
    const { chapterId } = req.params;
    const pagesData = await comicService.getChapterPages(chapterId);
    res.json({
      success: true,
      data: pagesData,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
