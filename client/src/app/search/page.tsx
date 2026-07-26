'use client';

import { useEffect, useState } from 'react';
import { searchMovies, searchSeries } from '@/lib/api';
import MovieCard from '@/components/MovieCard';
import SeriesCard from '@/components/SeriesCard';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'movie' | 'series'>('movie');
  const [results, setResults] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset page on query or type change
    setPage(1);
  }, [query, type]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      const searchFn = type === 'movie' ? searchMovies : searchSeries;
      searchFn(query, page)
        .then((data) => {
          setResults(data.results);
          setTotalPages(data.total_pages);
        })
        .catch(() => {
          setResults([]);
          setTotalPages(1);
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query, type, page]);

  return (
    <main>
      <div className="search-header">
        <h1>Search Catalog</h1>
        <p style={{ marginBottom: '1.5rem' }}>Find your next cinematic adventure instantly by title.</p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
          <button 
            onClick={() => setType('movie')} 
            className={`btn ${type === 'movie' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Movies
          </button>
          <button 
            onClick={() => setType('series')} 
            className={`btn ${type === 'series' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Series
          </button>
        </div>

        <div className="search-input-container">
          <input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder={`Type a ${type} title...`} 
            style={{ paddingRight: '3rem' }}
          />
          <span className="search-icon-inside">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--muted)' }}>Loading...</div>
      ) : results.length > 0 ? (
        <>
          <div className="movies-grid">
            {results.map((item) => (
              type === 'movie' ? 
                <MovieCard key={item.id} movie={item} /> : 
                <SeriesCard key={item.id} series={item} />
            ))}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem', alignItems: 'center' }}>
            <button 
              className="btn btn-secondary" 
              disabled={page <= 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button 
              className="btn btn-secondary" 
              disabled={page >= totalPages} 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </>
      ) : query.trim() !== '' ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--muted)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No results found for "{query}"</p>
          <p style={{ fontSize: '0.95rem' }}>Check spelling or try browsing all titles.</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--muted)' }}>
          <p style={{ fontSize: '0.95rem' }}>Start typing above to search the StreamHub catalog.</p>
        </div>
      )}
    </main>
  );
}

