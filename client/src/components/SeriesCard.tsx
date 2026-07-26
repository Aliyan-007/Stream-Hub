'use client';

import Link from 'next/link';
import { addToWatchlist, removeFromWatchlist } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function SeriesCard({
  series,
  isSaved = false,
  onToggle,
}: {
  series: any;
  isSaved?: boolean;
  onToggle?: () => void;
}) {
  const { user } = useAuth();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      if (isSaved) {
        await removeFromWatchlist(series.id);
      } else {
        await addToWatchlist(series.id);
      }
      onToggle?.();
    } catch (err) {
      console.error(err);
    }
  };

  const airRange = series.last_air_year && series.last_air_year !== series.first_air_year
    ? `${series.first_air_year}–${series.last_air_year}`
    : String(series.first_air_year || '');

  return (
    <div className="movie-card-wrap">
      <div className="movie-card">
        <Link href={`/series/${series.id}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="movie-card-img-wrapper">
            <img src={series.poster_url} alt={series.title} className="movie-card-img" />
            {/* TV badge overlay */}
            <span style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              background: 'rgba(99,102,241,0.9)',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '4px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>TV</span>
          </div>
          <div className="movie-card-content">
            <h3 className="movie-card-title">{series.title}</h3>
            <p className="movie-card-desc" style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
              {series.season_count > 0 ? `${series.season_count} Season${series.season_count > 1 ? 's' : ''}` : ''}{airRange ? ` · ${airRange}` : ''}
            </p>
            <p className="movie-card-desc">{series.description}</p>
            <div className="movie-card-actions">
              <span className="movie-card-rating">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                {series.avg_rating || '—'}
              </span>
              {user && (
                <button
                  onClick={handleToggle}
                  className={`btn ${isSaved ? 'btn-secondary' : 'btn-primary'}`}
                  style={{
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    boxShadow: 'none',
                    background:   isSaved ? 'rgba(239,68,68,0.15)' : undefined,
                    borderColor:  isSaved ? 'rgba(239,68,68,0.3)'  : undefined,
                    color:        isSaved ? '#f87171'              : undefined,
                  }}
                >
                  {isSaved ? 'Remove' : '+ Watchlist'}
                </button>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
