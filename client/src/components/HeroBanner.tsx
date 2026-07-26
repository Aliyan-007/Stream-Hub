'use client';

import Link from 'next/link';

export default function HeroBanner({ movie, href }: { movie: any; href?: string }) {
  if (!movie) return null;

  const linkTarget = href || `/movie/${movie.id}`;

  return (
    <section className="hero-container">
      <img src={movie.backdrop_url} alt={movie.title} className="hero-backdrop" />
      <div className="hero-gradient"></div>
      <div className="hero-content">
        <span className="hero-tag">Trending Feature</span>
        <h1 className="hero-title">{movie.title}</h1>
        <p className="hero-desc">{movie.description}</p>
        <Link href={linkTarget} className="btn btn-primary" style={{ width: 'fit-content', padding: '0.85rem 2rem' }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Watch now
        </Link>
      </div>
    </section>
  );
}

