'use client';

export default function AboutPage() {
  return (
    <main style={{ maxWidth: '800px' }}>
      <div className="browse-header" style={{ marginBottom: '2.5rem' }}>
        <h1>About StreamHub</h1>
        <p>A modern full-stack streaming platform prototype built with performance and design in mind.</p>
      </div>

      <div className="glass-panel" style={{ padding: '3rem' }}>
        <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: 1.8, marginBottom: '2rem' }}>
          StreamHub is a fully featured streaming platform MVP showcasing dynamic film catalog exploration, 
          secure token-based authentication, watchlists persistence, and individual user rating capabilities.
        </p>

        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#fff' }}>Technical Stack</h3>
        <ul style={{ 
          listStyleType: 'none', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          padding: 0
        }}>
          <li style={{ 
            padding: '1rem', 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid var(--color-border)', 
            borderRadius: '10px' 
          }}>
            <strong style={{ color: 'var(--color-primary-hover)', display: 'block', marginBottom: '0.25rem' }}>Next.js 14</strong>
            Modern App Router frontend structure.
          </li>
          <li style={{ 
            padding: '1rem', 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid var(--color-border)', 
            borderRadius: '10px' 
          }}>
            <strong style={{ color: 'var(--color-secondary)', display: 'block', marginBottom: '0.25rem' }}>Express API</strong>
            Express backend handler with secure routes.
          </li>
          <li style={{ 
            padding: '1rem', 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid var(--color-border)', 
            borderRadius: '10px' 
          }}>
            <strong style={{ color: 'var(--color-accent)', display: 'block', marginBottom: '0.25rem' }}>OLED Styling</strong>
            Premium vanilla CSS with full responsive support.
          </li>
        </ul>
      </div>
    </main>
  );
}

