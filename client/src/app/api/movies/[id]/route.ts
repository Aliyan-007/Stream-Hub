import { NextRequest, NextResponse } from 'next/server';

const TMDB_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

async function fetchCredits(id: string) {
  try {
    const res = await fetch(`${TMDB_BASE}/movie/${id}/credits?api_key=${TMDB_KEY}&language=en-US`);
    const data = await res.json();
    const director = (data.crew || []).find((p: any) => p.job === 'Director')?.name || '';
    const cast = (data.cast || []).slice(0, 5).map((p: any) => p.name);
    return { director, cast };
  } catch {
    return { director: '', cast: [] };
  }
}

function normaliseMovie(raw: any, director: string, cast: string[]) {
  const genres = raw.genres ? raw.genres.map((g: any) => g.name) : [];
  return {
    id: String(raw.id),
    title: raw.title || raw.original_title || 'Untitled',
    description: raw.overview || '',
    poster_url: raw.poster_path ? `${IMG_BASE}/w500${raw.poster_path}` : '',
    backdrop_url: raw.backdrop_path ? `${IMG_BASE}/w1280${raw.backdrop_path}` : '',
    video_url: '',
    release_year: raw.release_date ? parseInt(raw.release_date.slice(0, 4), 10) : 0,
    runtime_minutes: raw.runtime || 0,
    director,
    cast_list: cast,
    avg_rating: raw.vote_average ? parseFloat(raw.vote_average.toFixed(1)) : 0,
    genres,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const [detailRes, credits] = await Promise.all([
      fetch(`${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}&language=en-US`),
      fetchCredits(id),
    ]);
    if (!detailRes.ok) return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    const raw = await detailRes.json();
    return NextResponse.json(normaliseMovie(raw, credits.director, credits.cast));
  } catch {
    return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 502 });
  }
}
