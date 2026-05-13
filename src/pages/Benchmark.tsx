import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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

const accent   = '#02392C';
const lavender = '#6b54b8';
const bg       = '#fafaf7';
const border   = '#e6e4dd';
const textMain = '#1a2e29';
const textMuted = '#3d4a47';
const textSub  = '#6b7470';

const lightMode: React.CSSProperties = {
  '--background': bg,
  '--foreground': textMain,
  '--card': '#ffffff',
  '--card-foreground': textMain,
  '--muted': '#f3f4f0',
  '--muted-foreground': textSub,
  '--border': border,
  '--primary': lavender,
  '--primary-foreground': '#ffffff',
  '--accent': accent,
  '--accent-foreground': '#ffffff',
  '--destructive': '#b94a3d',
  '--destructive-foreground': '#ffffff',
  '--radius': '0.5rem',
  backgroundColor: bg,
  color: textMain,
  fontFamily: "'DM Sans', sans-serif",
  minHeight: '100vh',
} as React.CSSProperties;

type ReportData = {
  b: BenchmarkResult;
  sus: SustainabilityResult;
  watchouts: Watchout[];
  opps: Opportunity[];
};

const STAR_DISPLAY: Record<string, { stars: string; name: string; desc: string }> = {
  '1': { stars: '★★',      name: '1–2 Stars', desc: 'Budget / Economy' },
  '3': { stars: '★★★',    name: '3 Stars',    desc: 'Midscale' },
  '4': { stars: '★★★★',   name: '4 Stars',    desc: 'Upscale' },
  '5': { stars: '★★★★★',  name: '5 Stars',    desc: 'Luxury' },
};

function StepCircle({ n }: { n: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '28px', height: '28px', borderRadius: '50%',
      backgroundColor: accent, color: '#fff',
      fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
      fontFamily: "'DM Mono', monospace",
    }}>{n}</span>
  );
}

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

  /* ── Shared header (steps 1 & 2) ── */
  const Header = () => (
    <header style={{ backgroundColor: '#ffffff', borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, zIndex: 10 }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img src="/profix-logo.svg" alt="Profix" style={{ height: '28px' }} />
          <span style={{ width: '1px', height: '20px', backgroundColor: border }} />
          <span style={{ color: textMuted, fontSize: '0.9rem', fontWeight: 500 }}>Hotel Benchmark</span>
        </a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px', fontSize: '0.88rem' }}>
          <a href="#methodology" style={{ color: textMuted, textDecoration: 'none' }}>Methodology</a>
          <a href="#sources" style={{ color: textMuted, textDecoration: 'none' }}>Sources</a>
          <a href="https://app.myprofix.ai" target="_blank" rel="noopener noreferrer"
            style={{ color: lavender, fontWeight: 600, textDecoration: 'none' }}>Open app →</a>
        </nav>
      </div>
    </header>
  );

  /* ══════════════════════════════════ STEP 1 ══════════════════════════════════ */
  if (step === 1) return (
    <div style={lightMode}>
      <Header />

      {/* Hero */}
      <section style={{ maxWidth: '1080px', margin: '0 auto', padding: '72px 32px 48px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: textSub, textTransform: 'uppercase', marginBottom: '18px' }}>
          Portugal · 2024–2025 Hotel Benchmarks
        </p>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 800, lineHeight: 1.1, color: accent, marginBottom: '20px', maxWidth: '740px' }}>
          Know your numbers <span style={{ color: lavender }}>before</span> your competitors do.
        </h1>
        <p style={{ fontSize: '1.05rem', color: textMuted, lineHeight: 1.7, maxWidth: '560px' }}>
          Built on the latest INE, Banco de Portugal, DREM, SREA, AHP and Horwath HTL data — get a complete view of how a hotel of your size, category and region should be performing in 2025. Just three inputs.
        </p>
      </section>

      {/* Form card */}
      <section style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 32px 48px' }}>
        <form onSubmit={handleStep1Submit}
          style={{ backgroundColor: '#ffffff', border: `1px solid ${border}`, borderRadius: '14px', padding: '40px 44px', display: 'flex', flexDirection: 'column', gap: '36px' }}>

          {/* 01 — Rooms */}
          <div>
            <Label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '1rem', marginBottom: '18px', cursor: 'default' }}>
              <StepCircle n="01" /> Number of rooms
            </Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <Slider min={10} max={300} step={5} value={[rooms]} onValueChange={([v]) => setRooms(v)} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.5rem', color: accent, minWidth: '58px', textAlign: 'right', fontFamily: "'DM Mono', monospace" }}>
                {roomsLabel}
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: textSub, marginTop: '10px', lineHeight: 1.5 }}>
              Most Portuguese independents fall between 20 and 60 rooms. Select 300 to see benchmarks for hotels with 300+ rooms.
            </p>
          </div>

          {/* 02 — Star category */}
          <div>
            <Label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '1rem', marginBottom: '18px', cursor: 'default' }}>
              <StepCircle n="02" /> Star category
            </Label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {Object.entries(STAR_DISPLAY).map(([key, d]) => (
                <button key={key} type="button" onClick={() => setStarCode(key)}
                  style={{
                    border: starCode === key ? `2px solid ${accent}` : `1px solid ${border}`,
                    borderRadius: '10px', padding: '18px 12px', cursor: 'pointer',
                    backgroundColor: starCode === key ? accent : '#ffffff',
                    color: starCode === key ? '#ffffff' : textMain,
                    textAlign: 'center', transition: 'all 0.15s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '1.1rem', letterSpacing: '2px', color: starCode === key ? '#ffd700' : lavender }}>{d.stars}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{d.name}</span>
                  <span style={{ fontSize: '0.76rem', opacity: 0.75 }}>{d.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 03 — Region */}
          <div>
            <Label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '1rem', marginBottom: '18px', cursor: 'default' }}>
              <StepCircle n="03" /> Region (NUTS II)
            </Label>
            <Select value={regionId} onValueChange={setRegionId}>
              <SelectTrigger style={{ fontSize: '1rem', height: '48px' }}>
                <SelectValue placeholder="Select your region…" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REGIONS).map(([key, region]) => (
                  <SelectItem key={key} value={key}>{region.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p style={{ fontSize: '0.84rem', color: textSub, marginTop: '10px' }}>
              Region drives over 70% of revenue performance differences in Portugal.
            </p>
          </div>

          <div>
            <button type="submit" disabled={!regionId}
              style={{
                backgroundColor: regionId ? lavender : '#c4bedd',
                color: '#ffffff', padding: '16px 32px', borderRadius: '8px',
                border: 'none', fontSize: '1rem', fontWeight: 700,
                cursor: regionId ? 'pointer' : 'not-allowed',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}>
              Show my benchmarks →
            </button>
          </div>
        </form>

        {/* Trust strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          marginTop: '16px', border: `1px solid ${border}`, borderRadius: '10px', overflow: 'hidden',
        }}>
          {[
            { num: '82.1M', label: 'overnight stays 2025' },
            { num: '€7.2B', label: 'tourism revenue 2025' },
            { num: '+4.3%', label: 'RevPAR YoY growth' },
            { num: '28+',   label: 'data sources' },
          ].map(({ num, label }, i) => (
            <div key={label} style={{
              backgroundColor: '#ffffff', padding: '20px 24px', textAlign: 'center',
              borderLeft: i > 0 ? `1px solid ${border}` : undefined,
            }}>
              <div style={{ fontSize: '1.55rem', fontWeight: 800, color: accent, fontFamily: "'DM Mono', monospace" }}>{num}</div>
              <div style={{ fontSize: '0.75rem', color: textSub, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How this works */}
      <section id="methodology" style={{ backgroundColor: '#ffffff', borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, padding: '64px 32px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'grid', gridTemplateColumns: '240px 1fr', gap: '56px', alignItems: 'start' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: accent }}>How this works</h2>
          <div style={{ color: textMuted, lineHeight: 1.75, fontSize: '0.95rem' }}>
            <p style={{ marginBottom: '16px' }}>This tool combines three layers of benchmark data:</p>
            <ol style={{ paddingLeft: '20px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><strong>Regional KPIs</strong> from INE/TravelBI 2025 preliminary annual data, DREM Madeira and SREA Açores official releases, and quarterly Horwath HTL/BEONx analyses.</li>
              <li><strong>P&L structure</strong> from Banco de Portugal's Quadros do Sector for CAE 55111 (2,127 hotels), broken out by employee count size class.</li>
              <li><strong>Star-category multipliers</strong> calibrated against HotStats and Crowe Ireland European benchmarks, adjusted for Portuguese wage and IVA structure.</li>
            </ol>
            <p>The model assumes <strong>365 days operation</strong>, standard mix of room types, and average revenue management discipline. Your actual performance will vary by location quality, brand, distribution mix and management skill — typically by ±20% on each line.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="sources" style={{ maxWidth: '1080px', margin: '0 auto', padding: '32px 32px 48px' }}>
        <p style={{ fontSize: '0.8rem', color: textSub, lineHeight: 1.6 }}>
          Built by <strong>Profix</strong> on the Portugal Hotel Benchmark Bible v2 — May 2026. Data sources:{' '}
          <a href="https://travelbi.turismodeportugal.pt" target="_blank" rel="noopener noreferrer" style={{ color: lavender }}>TravelBI/INE</a>,{' '}
          <a href="https://www.bportugal.pt/qesweb/" target="_blank" rel="noopener noreferrer" style={{ color: lavender }}>Banco de Portugal</a>,{' '}
          DREM Madeira, SREA Açores, Horwath HTL, BEONx, AHP, HotStats, HOTREC, EU BEMP, Shiji ReviewPro.
        </p>
        <p style={{ fontSize: '0.75rem', color: textSub, marginTop: '8px' }}>
          For benchmarking guidance only. Not investment, accounting or operational advice.
        </p>
      </footer>
    </div>
  );

  /* ══════════════════════════════════ STEP 2 ══════════════════════════════════ */
  if (step === 2) return (
    <div style={lightMode}>
      <Header />
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ backgroundColor: '#f0edfa', borderRadius: '8px', padding: '14px 18px', marginBottom: '28px', fontSize: '0.95rem', fontWeight: 600, color: lavender }}>
          {roomsLabel}-room {STAR_CATEGORIES[starCode]?.name} in {REGIONS[regionId]?.name}
        </div>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: accent, marginBottom: '10px' }}>
          Your personalised report is ready.
        </h2>
        <p style={{ color: textMuted, marginBottom: '28px', lineHeight: 1.6 }}>
          Enter your email to unlock your benchmark. We'll also send you a copy.
        </p>
        <form onSubmit={handleStep2Submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input type="email" required placeholder="your@email.com" value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ fontSize: '1rem', height: '48px' }} />
          {emailError && <p style={{ color: '#b94a3d', fontSize: '0.85rem', marginTop: '-8px' }}>{emailError}</p>}
          <p style={{ fontSize: '0.8rem', color: textSub, lineHeight: 1.55 }}>
            By continuing you agree to receive your benchmark report and occasional Profix insights. Unsubscribe anytime.
          </p>
          <button type="submit" style={{ backgroundColor: lavender, color: '#ffffff', padding: '15px 24px', borderRadius: '8px', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
            See my report →
          </button>
          <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: textSub, cursor: 'pointer', fontSize: '0.9rem', padding: '4px 0', textAlign: 'left' }}>
            ← Back
          </button>
        </form>
      </div>
    </div>
  );

  /* ══════════════════════════════════ STEP 3 ══════════════════════════════════ */
  return (
    <div style={lightMode}>
      {reportData && (
        <BenchmarkReport b={reportData.b} sus={reportData.sus} watchouts={reportData.watchouts} opps={reportData.opps} onBack={handleBack} />
      )}
    </div>
  );
}
