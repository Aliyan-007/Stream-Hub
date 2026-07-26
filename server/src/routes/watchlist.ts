import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const watchlist: Record<string, string[]> = {};

router.get('/', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  res.json({ items: userId ? watchlist[userId] || [] : [] });
});

router.post('/', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { movieId } = req.body as { movieId?: string };
  if (!userId || !movieId) {
    return res.status(400).json({ error: 'movieId is required' });
  }

  const items = watchlist[userId] || [];
  if (!items.includes(movieId)) {
    items.push(movieId);
    watchlist[userId] = items;
  }
  return res.json({ items: watchlist[userId] });
});

router.delete('/:movieId', authMiddleware, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const items = watchlist[userId] || [];
  watchlist[userId] = items.filter((movieId) => movieId !== req.params.movieId);
  res.json({ items: watchlist[userId] });
});

export default router;
