import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const ratings: Record<string, Record<string, number>> = {};

router.post('/', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { movieId, score } = req.body as { movieId?: string; score?: number };
  if (!userId || !movieId || !score) {
    return res.status(400).json({ error: 'movieId and score are required' });
  }

  if (!ratings[movieId]) ratings[movieId] = {};
  ratings[movieId][userId] = score;

  const values = Object.values(ratings[movieId]);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  res.json({ average: Number(average.toFixed(1)), userRating: score });
});

router.get('/:movieId', (_req, res) => {
  const movieId = _req.params.movieId;
  const values = Object.values(ratings[movieId] || {});
  const average = values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : 0;
  res.json({ average, userRating: null });
});

export default router;
