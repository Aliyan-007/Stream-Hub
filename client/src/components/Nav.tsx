'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Nav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <Link href="/" className="nav-brand">
        <span className="nav-logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </span>
        StreamHub
      </Link>
      
      <div className="nav-links">
        <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
          Home
        </Link>
        <Link href="/browse" className={`nav-item ${pathname === '/browse' ? 'active' : ''}`}>
          Movies
        </Link>
        <Link href="/series" className={`nav-item ${pathname.startsWith('/series') ? 'active' : ''}`}>
          Series
        </Link>
        <Link href="/search" className={`nav-item ${pathname === '/search' ? 'active' : ''}`}>
          Search
        </Link>
        <Link href="/watchlist" className={`nav-item ${pathname === '/watchlist' ? 'active' : ''}`}>
          Watchlist
        </Link>
        <Link href="/about" className={`nav-item ${pathname === '/about' ? 'active' : ''}`}>
          About
        </Link>
      </div>

      <div className="nav-auth">
        {user ? (
          <>
            <Link href="/profile" className="nav-item" style={{ fontWeight: 600 }}>
              {user.username || user.email}
            </Link>
            <button onClick={() => logout()} className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-item">
              Login
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

