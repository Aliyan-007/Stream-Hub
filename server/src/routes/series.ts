import { Router, Request, Response } from 'express';

const router = Router();

// ─── TMDB config ─────────────────────────────────────────────────────────────
const TMDB_KEY  = process.env.TMDB_API_KEY  || '';
const TMDB_BASE = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const IMG_BASE  = process.env.TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Series {
  id: string;
  title: string;
  description: string;
  poster_url: string;
  backdrop_url: string;
  first_air_year: number;
  last_air_year: number | null;
  episode_count: number;
  season_count: number;
  status: string;           // "Returning Series", "Ended", etc.
  creator: string;
  cast_list: string[];
  avg_rating: number;
  genres: string[];
  type: 'series';           // discriminant for the client
  seasons: { season_number: number; episode_count: number }[];
}

// ─── Genre cache ─────────────────────────────────────────────────────────────
let genreCache: Record<number, string> = {};
let genreCacheTime = 0;

async function getGenreMap(): Promise<Record<number, string>> {
  if (Date.now() - genreCacheTime < 1000 * 60 * 60) return genreCache;
  const res  = await fetch(`${TMDB_BASE}/genre/tv/list?api_key=${TMDB_KEY}&language=en-US`);
  const data = await res.json();
  genreCache = Object.fromEntries(
    (data.genres || []).map((g: { id: number; name: string }) => [g.id, g.name])
  );
  genreCacheTime = Date.now();
  return genreCache;
}

// ─── Normalise a raw TMDB TV object into our Series shape ────────────────────
function normaliseSeries(raw: any, genreMap: Record<number, string>): Series {
  const genres: string[] = raw.genres
    ? raw.genres.map((g: any) => g.name)
    : (raw.genre_ids || []).map((id: number) => genreMap[id] || 'Unknown');

  const firstYear = raw.first_air_date ? parseInt(raw.first_air_date.slice(0, 4), 10) : 0;
  const lastYear  = raw.last_air_date  ? parseInt(raw.last_air_date.slice(0, 4),  10) : null;

  return {
    id:            String(raw.id),
    title:         raw.name || raw.original_name || 'Untitled',
    description:   raw.overview || '',
    poster_url:    raw.poster_path
      ? `${IMG_BASE}/w500${raw.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Poster',
    backdrop_url:  raw.backdrop_path
      ? `${IMG_BASE}/w1280${raw.backdrop_path}`
      : 'https://via.placeholder.com/1280x720?text=No+Backdrop',
    first_air_year: firstYear,
    last_air_year:  lastYear,
    episode_count:  raw.number_of_episodes || 0,
    season_count:   raw.number_of_seasons  || 0,
    status:         raw.status || '',
    creator:        raw._creator || (raw.created_by?.[0]?.name) || '',
    cast_list:      raw._cast || [],
    avg_rating:     raw.vote_average ? parseFloat(raw.vote_average.toFixed(1)) : 0,
    genres,
    type:           'series',
    seasons:        (raw.seasons || [])
                      .filter((s: any) => s.season_number > 0)
                      .map((s: any) => ({
                        season_number: s.season_number,
                        episode_count: s.episode_count || 10
                      }))
  };
}

// ─── Fetch creator + top-5 cast ───────────────────────────────────────────────
async function fetchCredits(id: string | number) {
  try {
    const res  = await fetch(`${TMDB_BASE}/tv/${id}/credits?api_key=${TMDB_KEY}&language=en-US`);
    const data = await res.json();
    const creator = (data.crew || []).find((p: any) => p.job === 'Executive Producer')?.name
                 || (data.crew || [])[0]?.name
                 || '';
    const cast = (data.cast || []).slice(0, 5).map((p: any) => p.name);
    return { creator, cast };
  } catch {
    return { creator: '', cast: [] };
  }
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/series  →  popular TV shows
router.get('/', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  try {
    const [tmdbRes, genreMap] = await Promise.all([
      fetch(`${TMDB_BASE}/tv/popular?api_key=${TMDB_KEY}&language=en-US&page=${page}`),
      getGenreMap(),
    ]);
    const data   = await tmdbRes.json();
    const series = (data.results || []).map((s: any) => normaliseSeries(s, genreMap));
    res.json({ results: series, page: data.page || 1, total_pages: data.total_pages || 1 });
  } catch (err) {
    console.error('TMDB /tv/popular error:', err);
    res.status(502).json({ error: 'Failed to fetch series from TMDB' });
  }
});

// GET /api/series/trending  →  weekly trending TV
router.get('/trending', async (_req: Request, res: Response) => {
  try {
    const [tmdbRes, genreMap] = await Promise.all([
      fetch(`${TMDB_BASE}/trending/tv/week?api_key=${TMDB_KEY}&language=en-US`),
      getGenreMap(),
    ]);
    const data   = await tmdbRes.json();
    const series = (data.results || []).slice(0, 10).map((s: any) => normaliseSeries(s, genreMap));
    res.json(series);
  } catch (err) {
    console.error('TMDB /trending/tv error:', err);
    res.status(502).json({ error: 'Failed to fetch trending series from TMDB' });
  }
});

// GET /api/series/search?q=&page=  →  TMDB TV search
router.get('/search', async (req: Request, res: Response) => {
  const q = ((req.query.q as string) || '').trim();
  const page = parseInt(req.query.page as string) || 1;
  if (!q) {
    try {
      const [tmdbRes, genreMap] = await Promise.all([
        fetch(`${TMDB_BASE}/tv/popular?api_key=${TMDB_KEY}&language=en-US&page=${page}`),
        getGenreMap(),
      ]);
      const data = await tmdbRes.json();
      return res.json({
        results: (data.results || []).map((s: any) => normaliseSeries(s, genreMap)),
        page: data.page || 1,
        total_pages: data.total_pages || 1
      });
    } catch {
      return res.json({ results: [], page: 1, total_pages: 1 });
    }
  }
  try {
    const [tmdbRes, genreMap] = await Promise.all([
      fetch(`${TMDB_BASE}/search/tv?api_key=${TMDB_KEY}&language=en-US&query=${encodeURIComponent(q)}&page=${page}`),
      getGenreMap(),
    ]);
    const data   = await tmdbRes.json();
    const series = (data.results || []).map((s: any) => normaliseSeries(s, genreMap));
    return res.json({ results: series, page: data.page || 1, total_pages: data.total_pages || 1 });
  } catch (err) {
    console.error('TMDB /search/tv error:', err);
    return res.status(502).json({ error: 'Failed to search series on TMDB' });
  }
});

// GET /api/series/:id  →  full series detail with credits
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [detailRes, credits, genreMap] = await Promise.all([
      fetch(`${TMDB_BASE}/tv/${id}?api_key=${TMDB_KEY}&language=en-US`),
      fetchCredits(id),
      getGenreMap(),
    ]);
    if (!detailRes.ok) return res.status(404).json({ error: 'Series not found' });

    const raw       = await detailRes.json();
    raw._creator    = credits.creator;
    raw._cast       = credits.cast;

    return res.json(normaliseSeries(raw, genreMap));
  } catch (err) {
    console.error('TMDB /tv/:id error:', err);
    return res.status(502).json({ error: 'Failed to fetch series details from TMDB' });
  }
});

export default router;
