'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMovies, getWatchlist } from '@/lib/api';
import MovieCard from '@/components/MovieCard';
import { useAuth } from '@/context/AuthContext';

export default function WatchlistPage() {
  const { user } = useAuth();
  const [movies, setMovies] = useState<any[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const [allMovies, watchlist] = await Promise.all([getMovies(), getWatchlist()]);
      setMovies(allMovies.results);
      setWatchlistIds(watchlist.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  if (!user) {
    return (
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '440px', width: '100%' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Your Watchlist</h1>
          <p style={{ marginBottom: '2rem' }}>Please log in to your account to save movies and view your personalized watchlist.</p>
          <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
            Log In
          </Link>
        </div>
      </main>
    );
  }

  const savedMovies = movies.filter((movie) => watchlistIds.includes(movie.id));

  return (
    <main>
      <div className="browse-header" style={{ marginBottom: '2.5rem' }}>
        <h1>My Watchlist</h1>
        <p>Your curated collection of films to watch next.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)' }}>
          <p>Loading watchlist...</p>
        </div>
      ) : savedMovies.length > 0 ? (
        <div className="movies-grid">
          {savedMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} isSaved onToggle={load} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--color-text-muted)' }}>
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.5rem', opacity: 0.5 }}>
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
            <line x1="7" y1="2" x2="7" y2="22"></line>
            <line x1="17" y1="2" x2="17" y2="22"></line>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="2" y1="7" x2="7" y2="7"></line>
            <line x1="2" y1="17" x2="7" y2="17"></line>
            <line x1="17" y1="17" x2="22" y2="17"></line>
            <line x1="17" y1="7" x2="22" y2="7"></line>
          </svg>
          <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff' }}>Your watchlist is empty</p>
          <p style={{ fontSize: '0.95rem', marginBottom: '2rem' }}>Explore our catalog and click "+ Watchlist" on movies you want to save.</p>
          <Link href="/browse" className="btn btn-primary">
            Browse Movies
          </Link>
        </div>
      )}
    </main>
  );
}

