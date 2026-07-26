// ⚠️  Load .env FIRST before any module captures process.env values.
// Using require() (not import) so it runs synchronously in-order, not hoisted.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const _dotenv = require('dotenv');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const _path = require('path');
_dotenv.config({ path: _path.resolve(process.cwd(), '.env') });
console.log('[env] TMDB_API_KEY:', process.env.TMDB_API_KEY ? `✅ loaded` : '❌ MISSING – check .env at monorepo root');
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import movieRoutes from './routes/movies';
import seriesRoutes from './routes/series';
import watchlistRoutes from './routes/watchlist';
import ratingRoutes from './routes/ratings';
import userRoutes from './routes/users';
import genreRoutes from './routes/genres';

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api', authLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/genres', genreRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
