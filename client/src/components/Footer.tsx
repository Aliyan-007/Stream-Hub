'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-brand-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="nav-logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', boxShadow: 'none' }}>
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </span>
            StreamHub
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            A premium cinematic streaming starter built as a complete and modern university project.
          </p>
        </div>
        <div className="footer-links-grid">
          <div className="footer-links-col">
            <span className="footer-link-header">Navigation</span>
            <Link href="/" className="footer-link">Home</Link>
            <Link href="/browse" className="footer-link">Browse</Link>
            <Link href="/search" className="footer-link">Search</Link>
          </div>
          <div className="footer-links-col">
            <span className="footer-link-header">Legal</span>
            <Link href="/about" className="footer-link">About Us</Link>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Privacy Policy</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div>© {new Date().getFullYear()} StreamHub. All rights reserved.</div>
        <div>Designed with ♥ for cinematic excellence.</div>
      </div>
    </footer>
  );
}

