import { Router, Request, Response } from 'express';

const router = Router();

// ─── TMDB config ─────────────────────────────────────────────────────────────
const TMDB_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const IMG_BASE = process.env.TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Movie {
  id: string;
  title: string;
  description: string;
  poster_url: string;
  backdrop_url: string;
  video_url: string;
  release_year: number;
  runtime_minutes: number;
  director: string;
  cast_list: string[];
  avg_rating: number;
  genres: string[];
}

// ─── Genre cache (avoids repeated genre list requests) ───────────────────────
let genreCache: Record<number, string> = {};
let genreCacheTime = 0;

async function getGenreMap(): Promise<Record<number, string>> {
  if (Date.now() - genreCacheTime < 1000 * 60 * 60) return genreCache; // 1 hr TTL
  const res = await fetch(
    `${TMDB_BASE}/genre/movie/list?api_key=${TMDB_KEY}&language=en-US`
  );
  const data = await res.json();
  genreCache = Object.fromEntries(
    (data.genres || []).map((g: { id: number; name: string }) => [g.id, g.name])
  );
  genreCacheTime = Date.now();
  return genreCache;
}

// ─── Normalise a raw TMDB movie object into our Movie shape ──────────────────
function normaliseMovie(raw: any, genreMap: Record<number, string>): Movie {
  const genres: string[] = raw.genres
    ? raw.genres.map((g: any) => g.name)           // from /movie/:id
    : (raw.genre_ids || []).map((id: number) => genreMap[id] || 'Unknown');

  return {
    id: String(raw.id),
    title: raw.title || raw.original_title || 'Untitled',
    description: raw.overview || '',
    poster_url: raw.poster_path
      ? `${IMG_BASE}/w500${raw.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Poster',
    backdrop_url: raw.backdrop_path
      ? `${IMG_BASE}/w1280${raw.backdrop_path}`
      : 'https://via.placeholder.com/1280x720?text=No+Backdrop',
    video_url: '',                                  // TMDB doesn't serve video files
    release_year: raw.release_date ? parseInt(raw.release_date.slice(0, 4), 10) : 0,
    runtime_minutes: raw.runtime || 0,
    director: raw._director || '',
    cast_list: raw._cast || [],
    avg_rating: raw.vote_average ? parseFloat(raw.vote_average.toFixed(1)) : 0,
    genres,
  };
}

// ─── Fetch director + top-5 cast from TMDB credits ───────────────────────────
async function fetchCredits(movieId: string | number): Promise<{ director: string; cast: string[] }> {
  try {
    const res = await fetch(
      `${TMDB_BASE}/movie/${movieId}/credits?api_key=${TMDB_KEY}&language=en-US`
    );
    const data = await res.json();
    const director =
      (data.crew || []).find((p: any) => p.job === 'Director')?.name || '';
    const cast = (data.cast || []).slice(0, 5).map((p: any) => p.name);
    return { director, cast };
  } catch {
    return { director: '', cast: [] };
  }
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/movies  →  popular movies
router.get('/', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  try {
    const [tmdbRes, genreMap] = await Promise.all([
      fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=${page}`),
      getGenreMap(),
    ]);
    const data = await tmdbRes.json();
    const movies = (data.results || []).map((m: any) => normaliseMovie(m, genreMap));
    res.json({ results: movies, page: data.page || 1, total_pages: data.total_pages || 1 });
  } catch (err) {
    console.error('TMDB /popular error:', err);
    res.status(502).json({ error: 'Failed to fetch movies from TMDB' });
  }
});

// GET /api/movies/trending  →  weekly trending
router.get('/trending', async (_req: Request, res: Response) => {
  try {
    const [tmdbRes, genreMap] = await Promise.all([
      fetch(`${TMDB_BASE}/trending/movie/week?api_key=${TMDB_KEY}&language=en-US`),
      getGenreMap(),
    ]);
    const data = await tmdbRes.json();
    const movies = (data.results || []).slice(0, 10).map((m: any) =>
      normaliseMovie(m, genreMap)
    );
    res.json(movies);
  } catch (err) {
    console.error('TMDB /trending error:', err);
    res.status(502).json({ error: 'Failed to fetch trending from TMDB' });
  }
});

// GET /api/movies/search?q=&page=  →  TMDB search
router.get('/search', async (req: Request, res: Response) => {
  const q = ((req.query.q as string) || '').trim();
  const page = parseInt(req.query.page as string) || 1;
  if (!q) {
    // Return popular if no query
    try {
      const [tmdbRes, genreMap] = await Promise.all([
        fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=${page}`),
        getGenreMap(),
      ]);
      const data = await tmdbRes.json();
      return res.json({
        results: (data.results || []).map((m: any) => normaliseMovie(m, genreMap)),
        page: data.page || 1,
        total_pages: data.total_pages || 1
      });
    } catch {
      return res.json({ results: [], page: 1, total_pages: 1 });
    }
  }

  try {
    const [tmdbRes, genreMap] = await Promise.all([
      fetch(
        `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&language=en-US&query=${encodeURIComponent(q)}&page=${page}`
      ),
      getGenreMap(),
    ]);
    const data = await tmdbRes.json();
    const movies = (data.results || []).map((m: any) => normaliseMovie(m, genreMap));
    return res.json({ results: movies, page: data.page || 1, total_pages: data.total_pages || 1 });
  } catch (err) {
    console.error('TMDB /search error:', err);
    return res.status(502).json({ error: 'Failed to search TMDB' });
  }
});

// GET /api/movies/sync  →  keep for compatibility
router.get('/sync', (_req: Request, res: Response) => {
  res.json({ synced: true, message: 'Powered by TMDB API.' });
});

// GET /api/movies/:id  →  full movie detail with credits
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [detailRes, credits, genreMap] = await Promise.all([
      fetch(`${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}&language=en-US`),
      fetchCredits(id),
      getGenreMap(),
    ]);

    if (!detailRes.ok) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const raw = await detailRes.json();
    raw._director = credits.director;
    raw._cast = credits.cast;

    return res.json(normaliseMovie(raw, genreMap));
  } catch (err) {
    console.error('TMDB /:id error:', err);
    return res.status(502).json({ error: 'Failed to fetch movie details from TMDB' });
  }
});

export default router;
