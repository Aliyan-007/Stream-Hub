'use client';

import { useEffect, useState } from 'react';
import { getMovies } from '@/lib/api';
import MovieCard from '@/components/MovieCard';

export default function BrowsePage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMovies(page).then((res) => {
      setMovies((prev) => (page === 1 ? res.results : [...prev, ...res.results]));
      setTotalPages(res.total_pages);
    }).finally(() => setLoading(false));
  }, [page]);

  return (
    <main>
      <div className="browse-header">
        <h1>Browse all titles</h1>
        <p>Explore our full catalog of curated stories, cinematic hits, and hidden gems.</p>
      </div>
      
      <div className="movies-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {page < totalPages && (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setPage(p => p + 1)}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Movies'}
          </button>
        </div>
      )}
    </main>
  );
}

