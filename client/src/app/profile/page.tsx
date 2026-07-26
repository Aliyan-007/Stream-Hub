'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <main style={{ maxWidth: '800px' }}>
      <div className="browse-header" style={{ marginBottom: '2.5rem' }}>
        <h1>My Profile</h1>
        <p>Manage your StreamHub account and preferences.</p>
      </div>

      <div className="glass-panel" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800,
            color: '#fff',
            boxShadow: '0 4px 15px rgba(244, 63, 94, 0.25)'
          }}>
            {(user?.username || user?.email || 'D')[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '2rem' }}>{user?.username || 'Demo User'}</h2>
            <p style={{ marginTop: '0.25rem', fontSize: '1rem', color: 'var(--color-text-muted)' }}>{user?.email || 'demo@example.com'}</p>
          </div>
        </div>

        <div className="detail-stats-grid" style={{ marginTop: '3rem' }}>
          <div className="stat-card">
            <div className="stat-label">Account Status</div>
            <div className="stat-value" style={{ color: 'var(--color-accent)' }}>Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Watchlist</div>
            <Link href="/watchlist" style={{ display: 'block', marginTop: '0.25rem', color: 'var(--color-primary-hover)', fontWeight: 600 }}>
              View watchlist →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

