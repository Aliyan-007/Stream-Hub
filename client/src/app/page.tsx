'use client';

import { useEffect, useState } from 'react';
import HeroBanner from '@/components/HeroBanner';
import MovieCard from '@/components/MovieCard';
import { getMovies, getTrendingMovies } from '@/lib/api';

export default function HomePage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([getMovies(), getTrendingMovies()]).then(([moviesResponse, trendingResponse]) => {
      setMovies(moviesResponse.results);
      setTrending(trendingResponse);
    });
  }, []);

  return (
    <main>
      <HeroBanner movie={trending[0]} />
      
      <section style={{ marginBottom: '3rem' }}>
        <h2>Trending now</h2>
        <div className="trending-slider">
          {trending.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>All movies</h2>
        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </main>
  );
}

