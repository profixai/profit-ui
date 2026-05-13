import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import {
  BenchmarkResult,
  SustainabilityResult,
  Watchout,
  Opportunity,
  fmtEur,
  fmtEurExact,
  fmtPct,
  fmtNum,
} from '@/lib/benchmark/calculate';

interface Props {
  b: BenchmarkResult;
  sus: SustainabilityResult;
  watchouts: Watchout[];
  opps: Opportunity[];
  onBack: () => void;
}

const PIE_COLORS = ['#02392C', '#6b54b8', '#a8b3ad'];

export default function BenchmarkReport({ b, sus, watchouts, opps, onBack }: Props) {
  const heroLabel = b.inputs.rooms >= 300
    ? `300+ room ${b.star.name} in ${b.region.name}`
    : `${b.inputs.rooms}-room ${b.star.name} in ${b.region.name}`;

  const pieData = [
    { name: 'Rooms', value: b.revenue.rooms },
    { name: 'F&B',   value: b.revenue.fb },
    { name: 'Other', value: b.revenue.other },
  ];

  const pnlRows = [
    { label: 'Total Revenue',                value: b.pnl.revenue,    pct: 1.0,                               cls: 'pnl-revenue', isCost: false },
    { label: 'Suppliers / COGS',             value: -b.pnl.suppliers,  pct: b.pnl.suppliers / b.pnl.revenue,  cls: '',            isCost: true },
    { label: 'Payroll (incl. social charges)',value: -b.pnl.payroll,   pct: b.pnl.payroll / b.pnl.revenue,    cls: '',            isCost: true },
    { label: 'Energy & Utilities',            value: -b.pnl.energy,    pct: b.pnl.energy / b.pnl.revenue,     cls: '',            isCost: true },
    { label: 'Maintenance & Repairs',         value: -b.pnl.maintenance,pct: b.pnl.maintenance / b.pnl.revenue,cls: '',            isCost: true },
    { label: 'Sales & Marketing',             value: -b.pnl.sm,        pct: b.pnl.sm / b.pnl.revenue,         cls: '',            isCost: true },
    { label: 'Admin & General',               value: -b.pnl.admin,     pct: b.pnl.admin / b.pnl.revenue,      cls: '',            isCost: true },
    { label: 'EBITDA',                        value: b.pnl.ebitda,     pct: b.pnl.ebitdaMargin,               cls: 'pnl-ebitda',  isCost: false },
    { label: 'EBIT (Operating Profit)',        value: b.pnl.ebit,       pct: b.pnl.ebit / b.pnl.revenue,       cls: 'pnl-ebit',    isCost: false },
    { label: 'Net Income (after tax & debt)', value: b.pnl.netIncome,  pct: b.pnl.netIncome / b.pnl.revenue,  cls: 'pnl-net',     isCost: false },
  ];

  const barData = [
    { name: 'Suppliers',   pct: (b.pnl.suppliers / b.pnl.revenue) * 100,   isEbitda: false },
    { name: 'Payroll',     pct: (b.pnl.payroll / b.pnl.revenue) * 100,     isEbitda: false },
    { name: 'Energy',      pct: (b.pnl.energy / b.pnl.revenue) * 100,      isEbitda: false },
    { name: 'Maintenance', pct: (b.pnl.maintenance / b.pnl.revenue) * 100, isEbitda: false },
    { name: 'S&M',         pct: (b.pnl.sm / b.pnl.revenue) * 100,          isEbitda: false },
    { name: 'Admin',       pct: (b.pnl.admin / b.pnl.revenue) * 100,       isEbitda: false },
    { name: 'EBITDA',      pct: b.pnl.ebitdaMargin * 100,                  isEbitda: true },
  ];

  const yoySign = b.region.revpar_yoy >= 0 ? '+' : '';

  return (
    <div id="report-section">

      {/* ── Report header ── */}
      <div className="report-header">
        <div className="container report-header-inner">
          <button className="back-button" type="button" onClick={onBack}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M16 10H4m4 4-4-4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            New benchmark
          </button>
          <div className="report-title-block">
            <div className="eyebrow">Benchmark report · 2025 reference data</div>
            <h1 className="report-title">{heroLabel}</h1>
            <p className="report-subtitle">{b.region.trend_note}</p>
          </div>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <section className="kpi-section">
        <div className="container">
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-label">RevPAR (your benchmark)</div>
              <div className="kpi-value">{fmtEur(b.revpar, 2)}</div>
              <div className={`kpi-delta ${b.region.revpar_yoy >= 0 ? 'positive' : 'negative'}`}>
                {yoySign}{b.region.revpar_yoy.toFixed(1)}% YoY
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">ADR (your benchmark)</div>
              <div className="kpi-value">{fmtEur(b.adr, 0)}</div>
              <div className="kpi-sub">vs national avg €120</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Occupancy</div>
              <div className="kpi-value">{b.occupancy.toFixed(1)}%</div>
              <div className="kpi-sub">vs national 57.9%</div>
            </div>
            <div className="kpi-card kpi-card-emphasis">
              <div className="kpi-label">Estimated annual revenue</div>
              <div className="kpi-value">{fmtEur(b.revenue.total)}</div>
              <div className="kpi-sub">all revenue sources</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Revenue composition ── */}
      <section className="report-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Revenue composition</h2>
            <p className="section-lede">How your total revenue is expected to break down across departments, based on your star category.</p>
          </div>
          <div className="two-col">
            <div className="chart-card">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius="58%" outerRadius="80%" dataKey="value" paddingAngle={2}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmtEurExact(v)} />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rev-breakdown">
              {[
                { label: 'Rooms revenue',                          value: b.revenue.rooms, pct: b.star.rooms_revenue_share },
                { label: 'Food & Beverage',                        value: b.revenue.fb,    pct: b.star.fb_revenue_share },
                { label: 'Other (spa, parking, meeting rooms…)',   value: b.revenue.other, pct: b.star.other_revenue_share },
              ].map(row => (
                <div key={row.label} className="rev-row">
                  <div>
                    <div className="rev-label">{row.label}</div>
                    <div className="rev-pct">{fmtPct(row.pct, 0)}</div>
                  </div>
                  <div className="rev-value">{fmtEurExact(row.value)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── P&L ── */}
      <section className="report-section bg-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Modelled P<span className="amp">&</span>L</h2>
            <p className="section-lede">Based on Banco de Portugal sector data for your size class: <strong>{b.sizeClass.name}</strong>.</p>
          </div>
          <div className="two-col-pnl">
            <div className="pnl-table-wrap">
              <table className="pnl-table">
                <thead>
                  <tr>
                    <th>Line item</th>
                    <th className="num">Annual €</th>
                    <th className="num">% of revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {pnlRows.map(row => (
                    <tr key={row.label} className={`${row.cls} ${row.isCost ? 'pnl-cost' : ''}`}>
                      <td>{row.label}</td>
                      <td className="num">{fmtEurExact(row.value)}</td>
                      <td className="num pct">{fmtPct(row.pct, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="chart-card">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e4dd" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#3d4a47', fontFamily: 'DM Sans' }} />
                    <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: '#6b7470', fontFamily: 'DM Mono' }} />
                    <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                    <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.isEbitda ? '#6b54b8' : '#a8b3ad'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="chart-caption">Cost lines and EBITDA margin as % of revenue.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Staffing ── */}
      <section className="report-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Staffing model</h2>
            <p className="section-lede">Departmental headcount for a hotel of your size and category, with annual labor cost at 2026 minimum wage rates.</p>
          </div>
          <div className="staff-grid">
            <div className="staff-card staff-card-total">
              <div className="staff-num">{b.staffing.total}</div>
              <div className="staff-label">Total FTEs</div>
            </div>
            {[
              { num: b.staffing.fb,          label: 'Food & Beverage' },
              { num: b.staffing.housekeeping, label: 'Housekeeping' },
              { num: b.staffing.frontOffice,  label: 'Front Office' },
              { num: b.staffing.admin,        label: 'Admin & HR' },
              { num: b.staffing.maintenance,  label: 'Maintenance' },
            ].map(({ num, label }) => (
              <div key={label} className="staff-card">
                <div className="staff-num">{num}</div>
                <div className="staff-label">{label}</div>
              </div>
            ))}
          </div>
          <div className="wage-callout">
            <div>
              <div className="wage-label">Annual cost per FTE (employer, including TSU)</div>
              <div className="wage-value">{fmtEurExact(b.staffing.wagePerStaffYear)}</div>
            </div>
            <div>
              <div className="wage-label">Total annual labor cost</div>
              <div className="wage-value">{fmtEurExact(b.staffing.laborCostPerYear)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Regional dynamics ── */}
      <section className="report-section bg-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Your regional context</h2>
            <p className="section-lede">{b.region.trend_note}</p>
          </div>
          <div className="region-grid">
            {[
              { label: 'Summer 2025 occupancy', value: `${b.region.summer_occ_2025}%` },
              { label: 'Summer 2025 ADR',       value: fmtEur(b.region.summer_adr_2025) },
              { label: 'Average length of stay',value: `${b.region.alos} nights` },
              { label: 'Seasonality (peak vs trough)', value: `${b.region.seasonality_ratio}x` },
              { label: 'Top foreign market',    value: `${b.region.top_foreign} (${b.region.top_foreign_share}%)` },
              { label: 'Domestic demand share', value: `${b.region.domestic_share}%` },
            ].map(({ label, value }) => (
              <div key={label} className="region-stat">
                <div className="region-stat-label">{label}</div>
                <div className="region-stat-value">{value}</div>
              </div>
            ))}
          </div>
          <div className="risk-callout">
            <div className="risk-label">Source-market concentration risk</div>
            <span className={`risk-badge risk-${b.region.risk_profile}`}>
              {b.region.risk_profile.replace('_', ' ')}
            </span>
            <p className="risk-text">Regions with low domestic share and a single dominant foreign market carry higher currency, geopolitical and travel-disruption risk.</p>
          </div>
        </div>
      </section>

      {/* ── Watch-outs ── */}
      <section className="report-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What to watch — risks for your profile</h2>
            <p className="section-lede">Issues that disproportionately affect hotels of your size, category and region in 2025.</p>
          </div>
          <ul className="watchouts-list">
            {watchouts.map((w, i) => (
              <li key={i} className={`watchout-item watchout-${w.severity}`}>
                <span className="watchout-icon">⚠</span>
                <span>{w.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Opportunities ── */}
      <section className="report-section bg-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Opportunities to capture</h2>
            <p className="section-lede">Where the 2025 data suggests the highest-leverage moves for your hotel.</p>
          </div>
          <div className="opportunities-grid">
            {opps.map((o, i) => (
              <div key={i} className="opp-card">
                <div className="opp-icon">{o.icon}</div>
                <div>
                  <h4>{o.title}</h4>
                  <p>{o.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sustainability ── */}
      <section className="report-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Sustainability targets</h2>
            <p className="section-lede">EU BEMP-aligned benchmarks for a property your size, with Portugal-specific solar potential.</p>
          </div>
          <div className="sustainability-grid">
            <div className="sus-card">
              <div className="sus-label">Energy intensity target</div>
              <div className="sus-value">{sus.energyTarget} kWh/m²/yr</div>
              <div className="sus-detail">Est. annual energy cost: {fmtEurExact(sus.energyCostEst)}</div>
            </div>
            <div className="sus-card">
              <div className="sus-label">Annual CO₂ footprint (scope 2)</div>
              <div className="sus-value">{fmtNum(sus.annualCo2, 1)} tCO₂/yr</div>
              <div className="sus-detail">Portugal grid: 80 gCO₂/kWh (89% renewable)</div>
            </div>
            <div className="sus-card">
              <div className="sus-label">Annual water consumption</div>
              <div className="sus-value">{fmtNum(sus.annualWaterM3)} m³/yr</div>
              <div className="sus-detail">At ~250 L/guest-night (efficient ops)</div>
            </div>
            <div className="sus-card sus-card-highlight">
              <div className="sus-label">Solar PV yield in your region</div>
              <div className="sus-value">{b.region.solar_yield} kWh/kWp/yr</div>
              <div className="sus-detail">Payback typically 4–7 years</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-eyebrow">Built by Profix</div>
            <h2 className="cta-title">
              Want a P<span className="amp">&</span>L that <span className="cta-accent">actually</span> reflects your hotel?
            </h2>
            <p className="cta-lede">
              This report uses sector averages. Profix builds AI agents that automate the construction
              of your real P&L using <strong>USALI categories</strong> — line-by-line, from your own data — so you can
              see exactly where you stand against hotels of your size and where you have room to improve.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://calendly.com/james-myprofix/30min" target="_blank" rel="noopener noreferrer" className="cta-button">
                Book a 30-minute meeting
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="https://www.myprofix.ai/" target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  border: '1.5px solid rgba(184,169,232,0.5)', color: 'rgba(250,250,247,0.9)',
                  padding: '16px 28px', borderRadius: '12px', textDecoration: 'none',
                  fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '16px',
                  transition: 'all 0.2s',
                }}>
                Learn more about Profix →
              </a>
            </div>
            <p className="cta-sub">Free, no commitment. We'll show you how Profix automates P&L building for independent hoteliers.</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="container">
          <p>Built by <strong>Profix</strong> on the Portugal Hotel Benchmark Bible v2 — May 2026.</p>
          <p className="footer-disclaimer">Benchmarks are reference values. Actual hotel performance varies with location quality, brand, distribution mix and management. Use this report alongside your own management accounts.</p>
        </div>
      </footer>

    </div>
  );
}
