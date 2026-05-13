import React, { useState } from 'react';
import { REGIONS, STAR_CATEGORIES } from '@/lib/benchmark/data';
import {
  calculateBenchmark,
  generateWatchouts,
  generateOpportunities,
  generateSustainability,
  BenchmarkResult,
  SustainabilityResult,
  Watchout,
  Opportunity,
} from '@/lib/benchmark/calculate';
import BenchmarkReport from '@/components/benchmark/BenchmarkReport';

type ReportData = {
  b: BenchmarkResult;
  sus: SustainabilityResult;
  watchouts: Watchout[];
  opps: Opportunity[];
};

export default function Benchmark() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rooms, setRooms] = useState(35);
  const [starCode, setStarCode] = useState('3');
  const [regionId, setRegionId] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const roomsLabel = rooms >= 300 ? '300+' : String(rooms);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionId) return;
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setEmailError('Please enter your email address.'); return; }
    setEmailError('');
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('benchmark_leads').insert({ email, rooms, star_category: starCode, region_id: regionId });
    } catch (err) {
      console.error('benchmark_leads insert error:', err);
    }
    const b = calculateBenchmark(rooms, starCode, regionId);
    setReportData({ b, sus: generateSustainability(b), watchouts: generateWatchouts(b), opps: generateOpportunities(b) });
    setStep(3);
  };

  const handleBack = () => { setStep(1); setReportData(null); };

  /* ══════════════ STEP 3 ══════════════ */
  if (step === 3 && reportData) {
    return <BenchmarkReport b={reportData.b} sus={reportData.sus} watchouts={reportData.watchouts} opps={reportData.opps} onBack={handleBack} />;
  }

  /* ══════════════ SHARED HEADER (steps 1 & 2) ══════════════ */
  const header = (
    <header className="site-header">
      <div className="container header-inner">
        <a href="https://www.myprofix.ai/" target="_blank" rel="noopener noreferrer" className="logo" aria-label="Profix home">
          <img src="/profix-wordmark.svg" alt="Profix" className="logo-img" />
          <span className="logo-divider" />
          <span className="logo-tag">Hotel Benchmark</span>
        </a>
        <nav className="header-nav">
          <a href="#methodology">Methodology</a>
          <a href="#sources">Sources</a>
          <a href="https://app.myprofix.ai" className="header-cta" target="_blank" rel="noopener noreferrer">Open app →</a>
        </nav>
      </div>
    </header>
  );

  /* ══════════════ STEP 1 ══════════════ */
  if (step === 1) return (
    <>
      {header}
      <main id="input-section">
        {/* Hero */}
        <section className="hero">
          <div className="container">
            <div className="eyebrow">Portugal · 2024–2025 hotel benchmarks</div>
            <h1 className="hero-title">
              Know your numbers <span className="title-accent">before</span> your competitors do.
            </h1>
            <p className="hero-lede">
              Built on the latest INE, Banco de Portugal, DREM, SREA, AHP and Horwath HTL data —
              get a complete view of how a hotel of your size, category and region should be performing
              in 2025. Just three inputs.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="form-section">
          <div className="container">
            <form id="benchmark-form" className="benchmark-form" autoComplete="off" onSubmit={handleStep1Submit}>

              {/* 01 — Rooms */}
              <div className="form-group">
                <label className="form-label">
                  <span className="form-step">01</span>
                  Number of rooms
                </label>
                <div className="slider-row">
                  <input
                    type="range"
                    min={10} max={300} step={5}
                    value={rooms}
                    onChange={e => setRooms(parseInt(e.target.value))}
                  />
                  <output className="slider-value">{roomsLabel}</output>
                </div>
                <p className="form-help">
                  Most Portuguese independents fall between 20 and 60 rooms. Select 300 to see benchmarks for hotels with 300+ rooms.
                </p>
              </div>

              {/* 02 — Star category */}
              <div className="form-group">
                <label className="form-label">
                  <span className="form-step">02</span>
                  Star category
                </label>
                <div className="star-grid">
                  {[
                    { key: '1', stars: '★★',     name: '1–2 Stars', desc: 'Budget / Economy' },
                    { key: '3', stars: '★★★',   name: '3 Stars',    desc: 'Midscale' },
                    { key: '4', stars: '★★★★',  name: '4 Stars',    desc: 'Upscale' },
                    { key: '5', stars: '★★★★★', name: '5 Stars',    desc: 'Luxury' },
                  ].map(({ key, stars, name, desc }) => (
                    <label key={key} className="star-option">
                      <input
                        type="radio"
                        name="star"
                        value={key}
                        checked={starCode === key}
                        onChange={() => setStarCode(key)}
                      />
                      <span className="star-label">
                        <span className="star-stars">{stars}</span>
                        <span className="star-name">{name}</span>
                        <span className="star-desc">{desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 03 — Region */}
              <div className="form-group">
                <label htmlFor="region-select" className="form-label">
                  <span className="form-step">03</span>
                  Region (NUTS II)
                </label>
                <select
                  id="region-select"
                  required
                  value={regionId}
                  onChange={e => setRegionId(e.target.value)}
                >
                  <option value="">Select your region…</option>
                  {Object.entries(REGIONS).map(([key, region]) => (
                    <option key={key} value={key}>{region.name}</option>
                  ))}
                </select>
                <p className="form-help">
                  Region drives over 70% of revenue performance differences in Portugal.
                </p>
              </div>

              <button type="submit" className="submit-button">
                Show my benchmarks
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 10h12m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>

            {/* Trust strip */}
            <aside className="trust-strip">
              {[
                { num: '82.1M', label: 'overnight stays 2025' },
                { num: '€7.2B', label: 'tourism revenue 2025' },
                { num: '+4.3%', label: 'RevPAR YoY growth' },
                { num: '28+',   label: 'data sources' },
              ].map(({ num, label }) => (
                <div key={label} className="trust-item">
                  <div className="trust-num">{num}</div>
                  <div className="trust-label">{label}</div>
                </div>
              ))}
            </aside>
          </div>
        </section>

        {/* How this works */}
        <section id="methodology" className="methodology-section">
          <div className="container methodology-grid">
            <div>
              <h2 className="section-title">How this works</h2>
            </div>
            <div className="methodology-text">
              <p>This tool combines three layers of benchmark data:</p>
              <ol>
                <li><strong>Regional KPIs</strong> from INE/TravelBI 2025 preliminary annual data, DREM Madeira and SREA Açores official releases, and quarterly Horwath HTL/BEONx analyses.</li>
                <li><strong>P&L structure</strong> from Banco de Portugal's Quadros do Sector for CAE 55111 (2,127 hotels), broken out by employee count size class.</li>
                <li><strong>Star-category multipliers</strong> calibrated against HotStats and Crowe Ireland European benchmarks, adjusted for Portuguese wage and IVA structure.</li>
              </ol>
              <p>The model assumes <strong>365 days operation</strong>, standard mix of room types, and average revenue management discipline. Your actual performance will vary by location quality, brand, distribution mix and management skill — typically by ±20% on each line.</p>
            </div>
          </div>
        </section>

        {/* Mini CTA */}
        <section style={{ background: 'var(--bg-alt)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '40px 0' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--foreground)', marginBottom: '4px' }}>Want to know more about Profix?</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--foreground-soft)' }}>See how we help independent hotels turn benchmarks into live P&L intelligence.</p>
            </div>
            <a href="https://www.myprofix.ai/" target="_blank" rel="noopener noreferrer" className="submit-button" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Visit our website →
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer id="sources" className="site-footer">
          <div className="container">
            <p>
              Built by <strong>Profix</strong> on the Portugal Hotel Benchmark Bible v2 — May 2026. Data sources:{' '}
              <a href="https://travelbi.turismodeportugal.pt" target="_blank" rel="noopener noreferrer">TravelBI/INE</a>,{' '}
              <a href="https://www.bportugal.pt/qesweb/" target="_blank" rel="noopener noreferrer">Banco de Portugal</a>,{' '}
              DREM Madeira, SREA Açores, Horwath HTL, BEONx, AHP, HotStats, HOTREC, EU BEMP, Shiji ReviewPro.
            </p>
            <p className="footer-disclaimer">For benchmarking guidance only. Not investment, accounting or operational advice.</p>
          </div>
        </footer>
      </main>
    </>
  );

  /* ══════════════ STEP 2 — EMAIL GATE ══════════════ */
  return (
    <>
      {header}
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          {/* Property summary pill */}
          <div style={{
            display: 'inline-block',
            backgroundColor: 'rgba(107,84,184,0.1)',
            color: '#6b54b8',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: 600,
            marginBottom: '28px',
          }}>
            {roomsLabel}-room {STAR_CATEGORIES[starCode]?.name} in {REGIONS[regionId]?.name}
          </div>

          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#02392C', marginBottom: '10px', letterSpacing: '-0.02em' }}>
            Your personalised report is ready.
          </h2>
          <p style={{ color: '#3d4a47', marginBottom: '28px', lineHeight: 1.6, fontSize: '1.05rem' }}>
            Enter your email to unlock your benchmark. We'll also send you a copy.
          </p>

          <form onSubmit={handleStep2Submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '14px 16px',
                fontSize: '1rem', fontFamily: 'var(--font-sans)',
                border: '1.5px solid #e6e4dd', borderRadius: '10px',
                outline: 'none', backgroundColor: '#ffffff',
                color: '#02392C',
              }}
            />
            {emailError && <p style={{ color: '#b94a3d', fontSize: '0.85rem', marginTop: '-6px' }}>{emailError}</p>}

            <p style={{ fontSize: '0.8rem', color: '#6b7470', lineHeight: 1.55 }}>
              By continuing you agree to receive your benchmark report and occasional Profix insights. Unsubscribe anytime.
            </p>

            <button type="submit" className="submit-button" style={{ alignSelf: 'stretch', justifyContent: 'center' }}>
              See my report →
            </button>

            <button type="button" onClick={() => setStep(1)}
              style={{ background: 'none', border: 'none', color: '#6b7470', cursor: 'pointer', fontSize: '0.9rem', padding: '4px 0', textAlign: 'left' }}>
              ← Back
            </button>
          </form>

          {/* Mini CTA */}
          <div style={{ marginTop: '48px', padding: '28px 32px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--foreground)', marginBottom: '6px' }}>Want to know more about Profix?</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--foreground-soft)', marginBottom: '16px' }}>See how we help independent hotels turn benchmarks into live P&L intelligence.</p>
            <a href="https://www.myprofix.ai/" target="_blank" rel="noopener noreferrer" className="submit-button" style={{ textDecoration: 'none', margin: '0 auto' }}>
              Visit our website →
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
