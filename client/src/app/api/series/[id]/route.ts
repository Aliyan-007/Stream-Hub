import { NextRequest, NextResponse } from 'next/server';

const TMDB_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

async function fetchCredits(id: string) {
  try {
    const res = await fetch(`${TMDB_BASE}/tv/${id}/credits?api_key=${TMDB_KEY}&language=en-US`);
    const data = await res.json();
    const creator = (data.crew || []).find((p: any) => p.job === 'Executive Producer')?.name || '';
    const cast = (data.cast || []).slice(0, 5).map((p: any) => p.name);
    return { creator, cast };
  } catch {
    return { creator: '', cast: [] };
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const [detailRes, credits] = await Promise.all([
      fetch(`${TMDB_BASE}/tv/${id}?api_key=${TMDB_KEY}&language=en-US`),
      fetchCredits(id),
    ]);
    if (!detailRes.ok) return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    const raw = await detailRes.json();
    raw._creator = credits.creator;
    raw._cast = credits.cast;

    const genres = (raw.genres || []).map((g: any) => g.name);
    return NextResponse.json({
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
      creator: raw._creator,
      cast_list: raw._cast,
      avg_rating: raw.vote_average ? parseFloat(raw.vote_average.toFixed(1)) : 0,
      genres,
      type: 'series',
      seasons: (raw.seasons || [])
        .filter((s: any) => s.season_number > 0)
        .map((s: any) => ({ season_number: s.season_number, episode_count: s.episode_count || 10 })),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch series' }, { status: 502 });
  }
}
