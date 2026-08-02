import { NextRequest, NextResponse } from 'next/server';

const TMDB_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

let genreCache: Record<number, string> = {};
let genreCacheTime = 0;

async function getGenreMap() {
  if (Date.now() - genreCacheTime < 1000 * 60 * 60) return genreCache;
  const res = await fetch(`${TMDB_BASE}/genre/tv/list?api_key=${TMDB_KEY}&language=en-US`);
  const data = await res.json();
  genreCache = Object.fromEntries((data.genres || []).map((g: any) => [g.id, g.name]));
  genreCacheTime = Date.now();
  return genreCache;
}

function normaliseSeries(raw: any, genreMap: Record<number, string>) {
  const genres = raw.genres
    ? raw.genres.map((g: any) => g.name)
    : (raw.genre_ids || []).map((id: number) => genreMap[id] || 'Unknown');
  return {
    id: String(raw.id),
    title: raw.name || raw.original_name || 'Untitled',
    description: raw.overview || '',
    poster_url: raw.poster_path ? `${IMG_BASE}/w500${raw.poster_path}` : '',
    backdrop_url: raw.backdrop_path ? `${IMG_BASE}/w1280${raw.backdrop_path}` : '',
    first_air_year: raw.first_air_date ? parseInt(raw.first_air_date.slice(0, 4), 10) : 0,
    last_air_year: raw.last_air_date ? parseInt(raw.last_air_date.slice(0, 4), 10) : null,
    episode_count: raw.number_of_episodes || 0,
    season_count: raw.number_of_seasons || 0,
    status: raw.status || '',
    creator: raw._creator || (raw.created_by?.[0]?.name) || '',
    cast_list: raw._cast || [],
    avg_rating: raw.vote_average ? parseFloat(raw.vote_average.toFixed(1)) : 0,
    genres,
    type: 'series',
    seasons: (raw.seasons || [])
      .filter((s: any) => s.season_number > 0)
      .map((s: any) => ({ season_number: s.season_number, episode_count: s.episode_count || 10 })),
  };
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  const page = req.nextUrl.searchParams.get('page') || '1';
  try {
    const [tmdbRes, genreMap] = await Promise.all([
      q
        ? fetch(`${TMDB_BASE}/search/tv?api_key=${TMDB_KEY}&language=en-US&query=${encodeURIComponent(q)}&page=${page}`)
        : fetch(`${TMDB_BASE}/tv/popular?api_key=${TMDB_KEY}&language=en-US&page=${page}`),
      getGenreMap(),
    ]);
    const data = await tmdbRes.json();
    return NextResponse.json({
      results: (data.results || []).map((s: any) => normaliseSeries(s, genreMap)),
      page: data.page || 1,
      total_pages: data.total_pages || 1,
    });
  } catch {
    return NextResponse.json({ results: [], page: 1, total_pages: 1 });
  }
}
