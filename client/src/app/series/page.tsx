'use client';

import { useEffect, useState } from 'react';
import { getSeries, getTrendingSeries } from '@/lib/api';
import SeriesCard from '@/components/SeriesCard';
import HeroBanner from '@/components/HeroBanner';

export default function SeriesPage() {
  const [series, setSeries]     = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    Promise.all([getSeries(page), page === 1 ? getTrendingSeries() : Promise.resolve([])])
      .then(([all, trend]) => {
        setSeries((prev) => (page === 1 ? all.results : [...prev, ...all.results]));
        setTotalPages(all.total_pages);
        if (page === 1) setTrending(trend);
      })
      .finally(() => setLoading(false));
  }, [page]);

  if (loading && page === 1) {
    return (
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📺</div>
          <p>Loading series...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* Hero banner reuses HeroBanner — series objects have compatible fields */}
      {trending[0] && (
        <HeroBanner
          movie={{
            ...trending[0],
            // HeroBanner reads movie.id for the link; route it to /series/:id
            _href: `/series/${trending[0].id}`,
          }}
          href={`/series/${trending[0].id}`}
        />
      )}

      <section style={{ marginBottom: '3rem' }}>
        <h2>Trending Series</h2>
        <div className="trending-slider">
          {trending.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <div className="browse-header" style={{ paddingTop: 0 }}>
          <h2>Popular Series</h2>
          <p>Top-rated TV shows from around the world.</p>
        </div>
        <div className="movies-grid">
          {series.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
        
        {page < totalPages && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setPage(p => p + 1)}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More Series'}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
