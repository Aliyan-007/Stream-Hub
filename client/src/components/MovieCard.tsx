'use client';

import Link from 'next/link';
import { addToWatchlist, removeFromWatchlist } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function MovieCard({ movie, isSaved = false, onToggle }: { movie: any; isSaved?: boolean; onToggle?: () => void }) {
  const { user } = useAuth();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      if (isSaved) {
        await removeFromWatchlist(movie.id);
      } else {
        await addToWatchlist(movie.id);
      }
      onToggle?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="movie-card-wrap">
    <div className="movie-card">
      <Link href={`/movie/${movie.id}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="movie-card-img-wrapper">
          <img src={movie.poster_url} alt={movie.title} className="movie-card-img" />
        </div>
        <div className="movie-card-content">
          <h3 className="movie-card-title">{movie.title}</h3>
          <p className="movie-card-desc">{movie.description}</p>
          <div className="movie-card-actions">
            <span className="movie-card-rating">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              {movie.avg_rating || '4.0'}
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
                  background: isSaved ? 'rgba(239, 68, 68, 0.15)' : undefined,
                  borderColor: isSaved ? 'rgba(239, 68, 68, 0.3)' : undefined,
                  color: isSaved ? '#f87171' : undefined
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

