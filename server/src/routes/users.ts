import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  res.json({ user: { id: req.user?.id, email: req.user?.email } });
});

router.patch('/me', authMiddleware, (req: AuthRequest, res) => {
  res.json({ message: 'Profile updated', user: { id: req.user?.id, email: req.user?.email } });
});

export default router;
