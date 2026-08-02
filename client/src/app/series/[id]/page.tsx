'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSeriesById } from '@/lib/api';

export default function SeriesDetailPage() {
  const params = useParams<{ id: string }>();
  const [series, setSeries] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [selectedServer, setSelectedServer] = useState<number>(0);

  const SERIES_SERVERS = [
    { name: 'VidSrc (HD)', url: (id: string, s: number, e: number) => `https://vidsrc.net/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
    { name: 'VidSrc ME (HD)', url: (id: string, s: number, e: number) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
    { name: 'EmbedSU (HD)', url: (id: string, s: number, e: number) => `https://embed.su/embed/tv/${id}/${s}/${e}` },
    { name: 'SuperEmbed (HD)', url: (id: string, s: number, e: number) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
    { name: 'MultiEmbed (HD)', url: (id: string, s: number, e: number) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
    { name: 'AutoEmbed (HD)', url: (id: string, s: number, e: number) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}` },
    { name: '2Embed (HD)', url: (id: string, s: number, e: number) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
  ];

  useEffect(() => {
    if (!params?.id) return;
    getSeriesById(params.id).then((data) => {
      setSeries(data);
      if (data.seasons && data.seasons.length > 0) {
        setSelectedSeason(data.seasons[0].season_number);
      }
    });
  }, [params?.id]);

  // Reset episode to 1 when season changes
  const handleSeasonChange = (seasonNum: number) => {
    setSelectedSeason(seasonNum);
    setSelectedEpisode(1);
  };

  if (!series) {
    return (
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--muted)' }}>Loading series details...</p>
      </main>
    );
  }

  const airRange = series.last_air_year && series.last_air_year !== series.first_air_year
    ? `${series.first_air_year} – ${series.last_air_year}`
    : String(series.first_air_year || '');

  const currentSeasonInfo = series.seasons?.find((s: any) => s.season_number === selectedSeason);
  const episodesInSeason = currentSeasonInfo ? currentSeasonInfo.episode_count : 10;

  return (
    <main>
      <div className="detail-grid">
        <div className="detail-poster-container">
          <img src={series.poster_url} alt={series.title} className="detail-poster" />
        </div>

        <div className="detail-info">
          <div>
            <h1 style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{series.title}</h1>

            <div className="detail-meta-row" style={{ marginBottom: '1.5rem' }}>
              <span className="meta-badge">📺 Series</span>
              {airRange && <span className="meta-badge">{airRange}</span>}
              {series.season_count > 0 && (
                <span className="meta-badge">{series.season_count} Season{series.season_count > 1 ? 's' : ''}</span>
              )}
              {series.episode_count > 0 && (
                <span className="meta-badge">{series.episode_count} Episodes</span>
              )}
              {series.status && <span className="meta-badge" style={{ color: series.status === 'Ended' ? '#f87171' : '#4ade80' }}>{series.status}</span>}
              {series.genres.map((g: string) => (
                <span key={g} className="meta-badge meta-badge-genre">{g}</span>
              ))}
            </div>

            <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: '1.7', marginBottom: '2.5rem' }}>
              {series.description}
            </p>
          </div>

          <div className="detail-stats-grid">
            {series.creator && (
              <div className="stat-card">
                <div className="stat-label">Creator</div>
                <div className="stat-value">{series.creator}</div>
              </div>
            )}
            {series.cast_list?.length > 0 && (
              <div className="stat-card">
                <div className="stat-label">Cast</div>
                <div className="stat-value" style={{ fontSize: '0.95rem' }}>{series.cast_list.join(', ')}</div>
              </div>
            )}
          </div>
          
          {/* Episode Selection UI */}
          {series.seasons && series.seasons.length > 0 && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Select Episode</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>Season</label>
                  <select 
                    value={selectedSeason} 
                    onChange={(e) => handleSeasonChange(Number(e.target.value))}
                    style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--bg2)', color: 'white', border: '1px solid var(--border)', minWidth: '120px' }}
                  >
                    {series.seasons.map((s: any) => (
                      <option key={s.season_number} value={s.season_number}>Season {s.season_number}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>Episode</label>
                  <select 
                    value={selectedEpisode} 
                    onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                    style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--bg2)', color: 'white', border: '1px solid var(--border)', minWidth: '120px' }}
                  >
                    {Array.from({ length: episodesInSeason }, (_, i) => i + 1).map((ep) => (
                      <option key={ep} value={ep}>Episode {ep}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="rating-widget" style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                {series.avg_rating.toFixed(1)}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>TMDB Rating</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Community average</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* vidlink.pro embed for TV series */}
      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Select Server:</label>
          <select 
            value={selectedServer} 
            onChange={(e) => setSelectedServer(Number(e.target.value))}
            style={{ padding: '0.5rem', borderRadius: '6px', background: 'var(--bg2)', color: 'white', border: '1px solid var(--border)', minWidth: '150px' }}
          >
            {SERIES_SERVERS.map((server, idx) => (
              <option key={idx} value={idx}>{server.name}</option>
            ))}
          </select>
        </div>
        <div className="video-container" style={{ marginTop: 0 }}>
          <iframe
            src={SERIES_SERVERS[selectedServer].url(series.id, selectedSeason, selectedEpisode)}
            className="video-player"
            allowFullScreen={true}
            allow="autoplay; fullscreen; picture-in-picture"
            referrerPolicy="origin"
            title={`Watch ${series.title}`}
            style={{ border: 'none', width: '100%', height: '100%', minHeight: '500px', borderRadius: '12px' }}
          />
        </div>
      </div>
    </main>
  );
}
