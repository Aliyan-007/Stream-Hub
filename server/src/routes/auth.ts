import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const users = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@example.com',
    passwordHash: bcrypt.hashSync('password123', 10),
  },
];

router.post('/register', (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { username, email, password } = parsed.data;
  const exists = users.some((user) => user.email === email || user.username === username);

  if (exists) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const user = {
    id: String(users.length + 1),
    username,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
  };

  users.push(user);

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  return res.status(201).json({ token, user: { id: user.id, username, email } });
});

router.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;
  const user = users.find((entry) => entry.email === email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

router.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out' });
});

export default router;
