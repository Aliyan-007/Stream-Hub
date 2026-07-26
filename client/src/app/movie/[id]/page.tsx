'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getMovieById, getRating, submitRating } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function MovieDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [movie, setMovie] = useState<any>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [average, setAverage] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedServer, setSelectedServer] = useState<number>(1);

  const MOVIE_SERVERS = [
    { name: 'VidLink', url: (id: string) => `https://vidlink.pro/movie/${id}` },
    { name: 'VidSrc.me', url: (id: string) => `https://vidsrc.me/embed/movie?tmdb=${id}` },
    { name: 'VidSrc.to', url: (id: string) => `https://vidsrc.to/embed/movie/${id}` },
    { name: 'SmashyStream', url: (id: string) => `https://embed.smashystream.com/playere.php?tmdb=${id}` },
  ];

  useEffect(() => {
    if (!params?.id) return;
    getMovieById(params.id).then(setMovie);
    getRating(params.id).then((data) => {
      setAverage(data.average);
      setRating(data.userRating);
    });
  }, [params?.id]);

  const handleRate = async (score: number) => {
    if (!user) {
      alert('Please log in to rate movies!');
      return;
    }
    if (!movie) return;
    const data = await submitRating(movie.id, score);
    setAverage(data.average);
    setRating(data.userRating);
  };

  if (!movie) return <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>Loading details...</main>;

  return (
    <main>
      <div className="detail-grid">
        <div className="detail-poster-container">
          <img src={movie.poster_url} alt={movie.title} className="detail-poster" />
        </div>
        
        <div className="detail-info">
          <div>
            <h1 style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{movie.title}</h1>
            
            <div className="detail-meta-row" style={{ marginBottom: '1.5rem' }}>
              <span className="meta-badge">{movie.release_year}</span>
              <span className="meta-badge">{movie.runtime_minutes} min</span>
              {movie.genres.map((genre: string) => (
                <span key={genre} className="meta-badge meta-badge-genre">{genre}</span>
              ))}
            </div>

            <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: '1.7', marginBottom: '2.5rem' }}>
              {movie.description}
            </p>
          </div>

          <div className="detail-stats-grid">
            <div className="stat-card">
              <div className="stat-label">Director</div>
              <div className="stat-value">{movie.director}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Cast</div>
              <div className="stat-value" style={{ fontSize: '0.95rem' }}>{movie.cast_list.join(', ')}</div>
            </div>
          </div>

          <div className="rating-widget" style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                {average.toFixed(1)}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>Community Rating</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Average score out of 5</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
              <div className="rating-stars">
                {([1, 2, 3, 4, 5] as number[]).map((score) => (
                  <button 
                    key={score} 
                    onClick={() => handleRate(score)} 
                    onMouseEnter={() => setHoveredStar(score)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="star-btn"
                    style={{ 
                      color: score <= (hoveredStar ?? rating ?? 0) ? '#fbbf24' : undefined 
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" fill={score <= (hoveredStar ?? rating ?? 0) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </button>
                ))}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {rating ? `Your rating: ${rating}/5` : user ? 'Click a star to rate' : 'Log in to rate this film'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Select Server:</label>
          <select 
            value={selectedServer} 
            onChange={(e) => setSelectedServer(Number(e.target.value))}
            style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--bg2)', color: 'white', border: '1px solid var(--border)', minWidth: '150px' }}
          >
            {MOVIE_SERVERS.map((server, idx) => (
              <option key={idx} value={idx}>{server.name}</option>
            ))}
          </select>
        </div>
        <div className="video-container" style={{ marginTop: 0 }}>
          <iframe
            src={MOVIE_SERVERS[selectedServer].url(movie.id)}
            className="video-player"
            allowFullScreen={true}
            webkitAllowFullScreen={true}
            mozAllowFullScreen={true}
            allow="autoplay; fullscreen; picture-in-picture"
            referrerPolicy="no-referrer"
            title={`Watch ${movie.title}`}
            style={{ border: 'none', width: '100%', height: '100%', minHeight: '500px', borderRadius: '12px' }}
          />
        </div>
      </div>
    </main>
  );
}

