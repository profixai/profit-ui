import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
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

const riskColors: Record<string, string> = {
  low: '#16a34a',
  moderate: '#d97706',
  high: '#ea580c',
  very_high: '#dc2626',
};

const watchoutIconColor = (severity: string): string => {
  if (severity === 'financial') return '#dc2626';
  if (severity === 'regional' || severity === 'trend') return '#ea580c';
  return '#d97706';
};

export default function BenchmarkReport({ b, sus, watchouts, opps, onBack }: Props) {
  const heroLabel = b.inputs.rooms >= 300
    ? `300+ room ${b.star.name} in ${b.region.name}`
    : `${b.inputs.rooms}-room ${b.star.name} in ${b.region.name}`;

  // Revenue pie data
  const pieData = [
    { name: 'Rooms', value: b.revenue.rooms },
    { name: 'F&B', value: b.revenue.fb },
    { name: 'Other', value: b.revenue.other },
  ];

  // P&L rows
  const pnlRows = [
    { label: 'Total Revenue', value: b.pnl.revenue, pct: 1.0, highlight: false, isEbitda: false },
    { label: 'Suppliers & COGS', value: -b.pnl.suppliers, pct: b.pnl.suppliers / b.pnl.revenue, highlight: false, isEbitda: false },
    { label: 'Payroll (incl. social charges)', value: -b.pnl.payroll, pct: b.pnl.payroll / b.pnl.revenue, highlight: false, isEbitda: false },
    { label: 'Energy & Utilities', value: -b.pnl.energy, pct: b.pnl.energy / b.pnl.revenue, highlight: false, isEbitda: false },
    { label: 'Maintenance & Repairs', value: -b.pnl.maintenance, pct: b.pnl.maintenance / b.pnl.revenue, highlight: false, isEbitda: false },
    { label: 'Sales & Marketing', value: -b.pnl.sm, pct: b.pnl.sm / b.pnl.revenue, highlight: false, isEbitda: false },
    { label: 'Admin & General', value: -b.pnl.admin, pct: b.pnl.admin / b.pnl.revenue, highlight: false, isEbitda: false },
    { label: 'EBITDA', value: b.pnl.ebitda, pct: b.pnl.ebitdaMargin, highlight: true, isEbitda: true },
    { label: 'EBIT', value: b.pnl.ebit, pct: b.pnl.ebit / b.pnl.revenue, highlight: false, isEbitda: false },
    { label: 'Net Income', value: b.pnl.netIncome, pct: b.pnl.netIncome / b.pnl.revenue, highlight: false, isEbitda: false },
  ];

  // Bar chart data
  const barData = [
    { name: 'Suppliers', pct: (b.pnl.suppliers / b.pnl.revenue) * 100, isEbitda: false },
    { name: 'Payroll', pct: (b.pnl.payroll / b.pnl.revenue) * 100, isEbitda: false },
    { name: 'Energy', pct: (b.pnl.energy / b.pnl.revenue) * 100, isEbitda: false },
    { name: 'Maintenance', pct: (b.pnl.maintenance / b.pnl.revenue) * 100, isEbitda: false },
    { name: 'S&M', pct: (b.pnl.sm / b.pnl.revenue) * 100, isEbitda: false },
    { name: 'Admin', pct: (b.pnl.admin / b.pnl.revenue) * 100, isEbitda: false },
    { name: 'EBITDA', pct: b.pnl.ebitdaMargin * 100, isEbitda: true },
  ];

  const staffItems = [
    { label: 'Total Staff', value: b.staffing.total },
    { label: 'F&B', value: b.staffing.fb },
    { label: 'Housekeeping', value: b.staffing.housekeeping },
    { label: 'Front Office', value: b.staffing.frontOffice },
    { label: 'Admin', value: b.staffing.admin },
    { label: 'Maintenance', value: b.staffing.maintenance },
  ];

  const regionalStats = [
    { label: 'Summer Occupancy', value: `${b.region.summer_occ_2025}%` },
    { label: 'Summer ADR', value: fmtEur(b.region.summer_adr_2025) },
    { label: 'ALOS', value: `${b.region.alos} nights` },
    { label: 'Seasonality', value: `${b.region.seasonality_ratio}x` },
    { label: 'Top Foreign Market', value: `${b.region.top_foreign} (${b.region.top_foreign_share}%)` },
    { label: 'Domestic Share', value: `${b.region.domestic_share}%` },
  ];

  const riskColor = riskColors[b.region.risk_profile] || '#d97706';

  return (
    <div>
      {/* Hero bar */}
      <div style={{ backgroundColor: '#02392C', color: '#ffffff', padding: '24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>{heroLabel}</div>
              <div style={{ fontSize: '0.95rem', opacity: 0.85, maxWidth: '700px' }}>{b.region.trend_note}</div>
            </div>
            <button
              onClick={onBack}
              style={{
                background: 'transparent',
                border: '1px solid #ffffff',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
              }}
            >
              ← New benchmark
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>

        {/* 4 KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}
          className="sm:grid-cols-4">
          <Card>
            <CardHeader style={{ paddingBottom: '4px' }}>
              <CardTitle style={{ fontSize: '0.875rem', color: '#6b7470', fontWeight: 500 }}>RevPAR</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{fmtEur(b.revpar, 2)}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7470', marginTop: '2px' }}>vs national €72.38</div>
              <div style={{
                display: 'inline-block',
                marginTop: '4px',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: b.region.revpar_yoy >= 0 ? '#dcfce7' : '#fee2e2',
                color: b.region.revpar_yoy >= 0 ? '#16a34a' : '#dc2626',
              }}>
                {b.region.revpar_yoy >= 0 ? '+' : ''}{b.region.revpar_yoy.toFixed(1)}% YoY
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader style={{ paddingBottom: '4px' }}>
              <CardTitle style={{ fontSize: '0.875rem', color: '#6b7470', fontWeight: 500 }}>ADR</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{fmtEur(b.adr, 0)}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7470', marginTop: '2px' }}>Average Daily Rate</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader style={{ paddingBottom: '4px' }}>
              <CardTitle style={{ fontSize: '0.875rem', color: '#6b7470', fontWeight: 500 }}>Occupancy</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{b.occupancy.toFixed(1)}%</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7470', marginTop: '2px' }}>Estimated occupancy</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader style={{ paddingBottom: '4px' }}>
              <CardTitle style={{ fontSize: '0.875rem', color: '#6b7470', fontWeight: 500 }}>Annual Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{fmtEur(b.revenue.total)}</div>
              <div style={{ fontSize: '0.8rem', color: '#6b7470', marginTop: '2px' }}>Estimated total revenue</div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue mix */}
        <Card style={{ marginBottom: '32px' }}>
          <CardHeader>
            <CardTitle>Revenue Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PieChart width={260} height={260}>
                  <Pie
                    data={pieData}
                    innerRadius="60%"
                    outerRadius="80%"
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => fmtEurExact(value)} />
                  <Legend />
                </PieChart>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Rooms', value: b.revenue.rooms, pct: b.star.rooms_revenue_share, color: '#02392C' },
                  { label: 'F&B', value: b.revenue.fb, pct: b.star.fb_revenue_share, color: '#6b54b8' },
                  { label: 'Other', value: b.revenue.other, pct: b.star.other_revenue_share, color: '#a8b3ad' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: item.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600 }}>{item.label}</span>
                      <span style={{ color: '#6b7470', marginLeft: '8px' }}>{fmtEurExact(item.value)}</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7470', fontWeight: 500 }}>
                      {fmtPct(item.pct, 0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* P&L table */}
        <Card style={{ marginBottom: '32px' }}>
          <CardHeader>
            <CardTitle>P&L Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Line Item</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>Amount</TableHead>
                  <TableHead style={{ textAlign: 'right' }}>% Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pnlRows.map(row => (
                  <TableRow
                    key={row.label}
                    style={row.isEbitda ? { backgroundColor: '#f0edfa' } : undefined}
                  >
                    <TableCell style={row.isEbitda ? { fontWeight: 700 } : undefined}>
                      {row.label}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {fmtEurExact(row.value)}
                    </TableCell>
                    <TableCell style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {fmtPct(row.pct, 1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div style={{ marginTop: '24px' }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e4dd" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#3d4a47' }} />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#6b7470' }} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                  <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.isEbitda ? '#6b54b8' : '#a8b3ad'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Staffing */}
        <Card style={{ marginBottom: '32px' }}>
          <CardHeader>
            <CardTitle>Staffing</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: '0.875rem', color: '#6b7470', marginBottom: '16px' }}>
              Size class: <strong>{b.sizeClass.name}</strong>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {staffItems.map(item => (
                <div key={item.label} style={{ padding: '12px', backgroundColor: '#f3f4f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6b7470' }}>{item.label}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ color: '#6b7470', fontSize: '0.875rem' }}>Annual labor cost: </span>
                <strong>{fmtEurExact(b.staffing.laborCostPerYear)}</strong>
              </div>
              <div>
                <span style={{ color: '#6b7470', fontSize: '0.875rem' }}>Avg wage per staff: </span>
                <strong>{fmtEurExact(b.staffing.wagePerStaffYear)}/yr</strong>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional dynamics */}
        <Card style={{ marginBottom: '32px' }}>
          <CardHeader>
            <CardTitle>Regional Dynamics</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{
              borderLeft: '4px solid #02392C',
              paddingLeft: '16px',
              marginBottom: '20px',
              color: '#1a2e29',
            }}>
              {b.region.trend_note}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {regionalStats.map(item => (
                <div key={item.label} style={{ padding: '12px', backgroundColor: '#f3f4f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6b7470' }}>{item.label}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>{item.value}</div>
                </div>
              ))}
              <div style={{ padding: '12px', backgroundColor: '#f3f4f0', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: '#6b7470' }}>Risk Profile</div>
                <div style={{
                  display: 'inline-block',
                  marginTop: '4px',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: riskColor + '22',
                  color: riskColor,
                  textTransform: 'capitalize',
                }}>
                  {b.region.risk_profile.replace('_', ' ')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Watch-outs */}
        <Card style={{ marginBottom: '32px' }}>
          <CardHeader>
            <CardTitle>Watch-outs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {watchouts.map((w, i) => (
                <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ color: watchoutIconColor(w.severity), fontSize: '1rem', flexShrink: 0, marginTop: '2px' }}>⚠</span>
                  <span style={{ fontSize: '0.9rem' }}>{w.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Opportunities */}
        <Card style={{ marginBottom: '32px' }}>
          <CardHeader>
            <CardTitle>Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {opps.map((o, i) => (
                <div key={i} style={{ padding: '16px', backgroundColor: '#f3f4f0', borderRadius: '8px', display: 'flex', gap: '12px' }}>
                  <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{o.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>{o.title}</div>
                    <p style={{ fontSize: '0.875rem', color: '#3d4a47', margin: 0 }}>{o.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sustainability */}
        <Card style={{ marginBottom: '32px' }}>
          <CardHeader>
            <CardTitle>Sustainability Benchmarks</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
              {[
                { label: 'Energy target', value: `${sus.energyTarget} kWh/m²/yr` },
                { label: 'Est. energy cost', value: fmtEurExact(sus.energyCostEst) },
                { label: 'Annual CO₂', value: `${fmtNum(sus.annualCo2, 1)} tCO₂/yr` },
                { label: 'Annual water', value: `${fmtNum(sus.annualWaterM3)} m³/yr` },
              ].map(item => (
                <div key={item.label} style={{ padding: '12px', backgroundColor: '#f3f4f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6b7470' }}>{item.label}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7470' }}>
              Solar yield for {b.region.name}: <strong>{b.region.solar_yield} kWh/kWp/yr</strong>
            </div>
          </CardContent>
        </Card>

        {/* Profix CTA */}
        <div style={{
          backgroundColor: '#02392C',
          color: '#ffffff',
          padding: '48px 24px',
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '12px' }}>
            Ready to close the gap?
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.85, maxWidth: '600px', margin: '0 auto 24px' }}>
            Profix turns these benchmarks into a live FinOps dashboard — P&L tracking, cost alerts, and AI-powered insights tailored to your hotel.
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="https://calendly.com/james-myprofix/profix-demo"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#ffffff',
                color: '#02392C',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              Book a 20-minute demo
            </a>
            <a
              href="https://app.myprofix.ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #ffffff',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              Open Profix →
            </a>
          </div>
        </div>

        {/* Methodology footer */}
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#6b7470', paddingBottom: '32px' }}>
          Data sources: INE/TravelBI, Banco de Portugal QS CAE 55111, DREM Madeira, SREA Açores, Horwath HTL, BEONx, HVS, AHP, JLL, CBRE, HotStats, HOTREC, EU BEMP, Shiji ReviewPro. Portugal Hotel Benchmark Bible v2, May 2026.
        </div>
      </div>
    </div>
  );
}
