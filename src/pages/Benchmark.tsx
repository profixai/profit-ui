import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
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

const lightMode: React.CSSProperties = {
  '--background': '#fafaf7',
  '--foreground': '#1a2e29',
  '--card': '#ffffff',
  '--card-foreground': '#1a2e29',
  '--muted': '#f3f4f0',
  '--muted-foreground': '#6b7470',
  '--border': '#e6e4dd',
  '--primary': '#6b54b8',
  '--primary-foreground': '#ffffff',
  '--accent': '#02392C',
  '--accent-foreground': '#ffffff',
  '--destructive': '#b94a3d',
  '--destructive-foreground': '#ffffff',
  '--radius': '0.5rem',
  backgroundColor: '#fafaf7',
  color: '#1a2e29',
  fontFamily: "'DM Sans', sans-serif",
  minHeight: '100vh',
} as React.CSSProperties;

type ReportData = {
  b: BenchmarkResult;
  sus: SustainabilityResult;
  watchouts: Watchout[];
  opps: Opportunity[];
};

export default function Benchmark() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 state
  const [rooms, setRooms] = useState(35);
  const [starCode, setStarCode] = useState('3');
  const [regionId, setRegionId] = useState('');

  // Step 2 state
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Step 3 state
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const roomsLabel = rooms >= 300 ? '300+' : String(rooms);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionId) return;
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setEmailError('Please enter your email address.');
      return;
    }
    setEmailError('');

    // Non-blocking Supabase insert
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('benchmark_leads').insert({
        email,
        rooms,
        star_category: starCode,
        region_id: regionId,
      });
    } catch (err) {
      console.error('benchmark_leads insert error:', err);
    }

    // Compute and go to step 3 regardless
    const b = calculateBenchmark(rooms, starCode, regionId);
    setReportData({
      b,
      sus: generateSustainability(b),
      watchouts: generateWatchouts(b),
      opps: generateOpportunities(b),
    });
    setStep(3);
  };

  const handleBack = () => {
    setStep(1);
    setReportData(null);
  };

  return (
    <div style={lightMode}>
      {step === 1 && (
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 16px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <img src="/profix-logo.svg" alt="Profix" style={{ height: '32px' }} />
            <span style={{
              backgroundColor: '#f0edfa',
              color: '#6b54b8',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}>
              Hotel Benchmark
            </span>
          </div>

          {/* Hero */}
          <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '12px' }}>
            Know your numbers before your competitors do.
          </h1>
          <p style={{ color: '#3d4a47', marginBottom: '32px', lineHeight: 1.6 }}>
            Built on the latest INE, Banco de Portugal, DREM, SREA, AHP and Horwath HTL data — get a complete view of how a hotel of your size, category and region should be performing in 2025. Just three inputs.
          </p>

          <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Rooms slider */}
            <div>
              <Label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                Number of rooms: <span style={{ color: '#6b54b8' }}>{roomsLabel}</span>
              </Label>
              <Slider
                min={10}
                max={300}
                step={5}
                value={[rooms]}
                onValueChange={([v]) => setRooms(v)}
                style={{ marginTop: '8px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b7470', marginTop: '4px' }}>
                <span>10</span>
                <span>300+</span>
              </div>
            </div>

            {/* Star category */}
            <div>
              <Label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Hotel category</Label>
              <RadioGroup value={starCode} onValueChange={setStarCode} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {Object.entries(STAR_CATEGORIES).map(([key, cat]) => (
                  <div
                    key={key}
                    style={{
                      border: starCode === key ? '2px solid #6b54b8' : '1px solid #e6e4dd',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      backgroundColor: starCode === key ? '#f0edfa' : '#ffffff',
                    }}
                    onClick={() => setStarCode(key)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RadioGroupItem value={key} id={`star-${key}`} />
                      <Label htmlFor={`star-${key}`} style={{ cursor: 'pointer', fontWeight: starCode === key ? 600 : 400 }}>
                        {cat.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Region */}
            <div>
              <Label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Region</Label>
              <Select value={regionId} onValueChange={setRegionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your region" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REGIONS).map(([key, region]) => (
                    <SelectItem key={key} value={key}>{region.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <button
              type="submit"
              disabled={!regionId}
              style={{
                backgroundColor: '#02392C',
                color: '#ffffff',
                padding: '14px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: regionId ? 'pointer' : 'not-allowed',
                opacity: regionId ? 1 : 0.6,
              }}
            >
              Get my benchmark →
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '60px 16px' }}>
          {/* Property summary */}
          <div style={{
            backgroundColor: '#f0edfa',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '24px',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#6b54b8',
          }}>
            {rooms >= 300 ? '300+' : rooms}-room {STAR_CATEGORIES[starCode]?.name} in {REGIONS[regionId]?.name}
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
            Your personalised report is ready.
          </h2>
          <p style={{ color: '#3d4a47', marginBottom: '24px' }}>
            Enter your email to see your benchmark.
          </p>

          <form onSubmit={handleStep2Submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <Input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ fontSize: '1rem', padding: '10px 14px', height: 'auto' }}
              />
              {emailError && <p style={{ color: '#b94a3d', fontSize: '0.85rem', marginTop: '4px' }}>{emailError}</p>}
            </div>

            <p style={{ fontSize: '0.8rem', color: '#6b7470', lineHeight: 1.5 }}>
              By continuing you agree to receive your benchmark report and occasional Profix insights. Unsubscribe anytime.
            </p>

            <button
              type="submit"
              style={{
                backgroundColor: '#02392C',
                color: '#ffffff',
                padding: '14px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              See my report →
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                background: 'none',
                border: 'none',
                color: '#3d4a47',
                cursor: 'pointer',
                fontSize: '0.9rem',
                padding: '4px 0',
                textAlign: 'left',
              }}
            >
              ← Back
            </button>
          </form>
        </div>
      )}

      {step === 3 && reportData && (
        <BenchmarkReport
          b={reportData.b}
          sus={reportData.sus}
          watchouts={reportData.watchouts}
          opps={reportData.opps}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
