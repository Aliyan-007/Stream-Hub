import { Router } from 'express';

const router = Router();

const genres = ['Action', 'Adventure', 'Drama', 'Mystery', 'Sci-Fi', 'Thriller'];

router.get('/', (_req, res) => {
  res.json(genres.map((name) => ({ name })));
});

export default router;
