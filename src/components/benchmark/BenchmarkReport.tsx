import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  type BenchmarkResult,
  type Watchout,
  type Opportunity,
  type SustainabilityResult,
  fmtEur,
  fmtEurExact,
  fmtPct,
  fmtNum,
} from "@/lib/benchmark/calculate";

interface Props {
  b: BenchmarkResult;
  sus: SustainabilityResult;
  watchouts: Watchout[];
  opps: Opportunity[];
  onBack: () => void;
}

const RISK_COLORS: Record<string, string> = {
  low: "#16a34a",
  moderate: "#ca8a04",
  high: "#ea580c",
  very_high: "#dc2626",
};

const riskLabel = (r: string) =>
  r.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function BenchmarkReport({ b, sus, watchouts, opps, onBack }: Props) {
  const heroLabel =
    b.inputs.rooms >= 300
      ? `300+-room ${b.star.name} in ${b.region.name}`
      : `${b.inputs.rooms}-room ${b.star.name} in ${b.region.name}`;

  const yoyPositive = b.region.revpar_yoy >= 0;

  const pieData = [
    { name: "Rooms", value: b.revenue.rooms },
    { name: "F&B", value: b.revenue.fb },
    { name: "Other", value: b.revenue.other },
  ];
  const PIE_COLORS = ["#02392C", "#6b54b8", "#a8b3ad"];

  const pnlRows = [
    { label: "Total Revenue", value: b.pnl.revenue, pct: 1.0, type: "revenue" },
    { label: "Suppliers / COGS", value: -b.pnl.suppliers, pct: b.pnl.suppliers / b.pnl.revenue, type: "cost" },
    { label: "Payroll (incl. social charges)", value: -b.pnl.payroll, pct: b.pnl.payroll / b.pnl.revenue, type: "cost" },
    { label: "Energy & Utilities", value: -b.pnl.energy, pct: b.pnl.energy / b.pnl.revenue, type: "cost" },
    { label: "Maintenance & Repairs", value: -b.pnl.maintenance, pct: b.pnl.maintenance / b.pnl.revenue, type: "cost" },
    { label: "Sales & Marketing", value: -b.pnl.sm, pct: b.pnl.sm / b.pnl.revenue, type: "cost" },
    { label: "Admin & General", value: -b.pnl.admin, pct: b.pnl.admin / b.pnl.revenue, type: "cost" },
    { label: "EBITDA", value: b.pnl.ebitda, pct: b.pnl.ebitdaMargin, type: "ebitda" },
    { label: "EBIT (Operating Profit)", value: b.pnl.ebit, pct: b.pnl.ebit / b.pnl.revenue, type: "ebit" },
    { label: "Net Income (after tax & debt)", value: b.pnl.netIncome, pct: b.pnl.netIncome / b.pnl.revenue, type: "net" },
  ];

  const barData = [
    { name: "Suppliers", pct: (b.pnl.suppliers / b.pnl.revenue) * 100 },
    { name: "Payroll", pct: (b.pnl.payroll / b.pnl.revenue) * 100 },
    { name: "Energy", pct: (b.pnl.energy / b.pnl.revenue) * 100 },
    { name: "Maintenance", pct: (b.pnl.maintenance / b.pnl.revenue) * 100 },
    { name: "S&M", pct: (b.pnl.sm / b.pnl.revenue) * 100 },
    { name: "Admin", pct: (b.pnl.admin / b.pnl.revenue) * 100 },
    { name: "EBITDA", pct: b.pnl.ebitdaMargin * 100 },
  ];

  const barColors = ["#a8b3ad", "#a8b3ad", "#a8b3ad", "#a8b3ad", "#a8b3ad", "#a8b3ad", "#6b54b8"];

  const severityColor: Record<string, string> = {
    regional: "#ea580c",
    size: "#ca8a04",
    operational: "#dc2626",
    positioning: "#7c3aed",
    distribution: "#0284c7",
    seasonal: "#d97706",
    financial: "#dc2626",
    trend: "#dc2626",
  };

  return (
    <div>
      {/* Hero bar */}
      <div
        style={{ backgroundColor: "#02392C", color: "#ffffff" }}
        className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
      >
        <div className="flex-1">
          <p className="text-lg font-semibold">{heroLabel}</p>
          <p className="text-sm mt-1 opacity-85">{b.region.trend_note}</p>
        </div>
        <Button
          variant="outline"
          onClick={onBack}
          style={{ borderColor: "#ffffff", color: "#ffffff", background: "transparent" }}
          className="self-start md:self-auto whitespace-nowrap hover:bg-white/10"
        >
          ← New benchmark
        </Button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* RevPAR */}
          <Card style={{ border: "1px solid #e6e4dd" }}>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#6b7470" }}>RevPAR</p>
              <p className="text-2xl font-bold mt-1" style={{ color: "#1a2e29" }}>{fmtEur(b.revpar, 2)}</p>
              <span
                className="text-xs font-semibold mt-1 inline-block"
                style={{ color: yoyPositive ? "#16a34a" : "#dc2626" }}
              >
                {yoyPositive ? "+" : ""}{b.region.revpar_yoy.toFixed(1)}% YoY
              </span>
            </CardContent>
          </Card>
          {/* ADR */}
          <Card style={{ border: "1px solid #e6e4dd" }}>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#6b7470" }}>ADR</p>
              <p className="text-2xl font-bold mt-1" style={{ color: "#1a2e29" }}>{fmtEur(b.adr, 0)}</p>
              <p className="text-xs mt-1" style={{ color: "#6b7470" }}>Average daily rate</p>
            </CardContent>
          </Card>
          {/* Occupancy */}
          <Card style={{ border: "1px solid #e6e4dd" }}>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#6b7470" }}>Occupancy</p>
              <p className="text-2xl font-bold mt-1" style={{ color: "#1a2e29" }}>{b.occupancy.toFixed(1)}%</p>
              <p className="text-xs mt-1" style={{ color: "#6b7470" }}>Annual average</p>
            </CardContent>
          </Card>
          {/* Annual Revenue */}
          <Card style={{ border: "1px solid #e6e4dd" }}>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#6b7470" }}>Annual Revenue</p>
              <p className="text-2xl font-bold mt-1" style={{ color: "#1a2e29" }}>{fmtEur(b.revenue.total)}</p>
              <p className="text-xs mt-1" style={{ color: "#6b7470" }}>Estimated total revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue mix */}
        <Card style={{ border: "1px solid #e6e4dd" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base" style={{ color: "#1a2e29" }}>Revenue Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div style={{ width: 220, height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius="65%"
                      outerRadius="80%"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => fmtEurExact(val)} />
                    <Legend
                      iconType="circle"
                      iconSize={10}
                      wrapperStyle={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm py-1.5" style={{ borderBottom: "1px solid #e6e4dd" }}>
                  <span style={{ color: "#1a2e29" }}>Rooms</span>
                  <span className="font-medium" style={{ color: "#02392C" }}>
                    {fmtEurExact(b.revenue.rooms)} ({fmtPct(b.star.rooms_revenue_share, 0)})
                  </span>
                </div>
                <div className="flex justify-between text-sm py-1.5" style={{ borderBottom: "1px solid #e6e4dd" }}>
                  <span style={{ color: "#1a2e29" }}>F&B</span>
                  <span className="font-medium" style={{ color: "#6b54b8" }}>
                    {fmtEurExact(b.revenue.fb)} ({fmtPct(b.star.fb_revenue_share, 0)})
                  </span>
                </div>
                <div className="flex justify-between text-sm py-1.5">
                  <span style={{ color: "#1a2e29" }}>Other</span>
                  <span className="font-medium" style={{ color: "#a8b3ad" }}>
                    {fmtEurExact(b.revenue.other)} ({fmtPct(b.star.other_revenue_share, 0)})
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* P&L table */}
        <Card style={{ border: "1px solid #e6e4dd" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base" style={{ color: "#1a2e29" }}>P&L Benchmark</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "2px solid #e6e4dd" }}>
                    <th className="text-left py-2 font-semibold" style={{ color: "#6b7470" }}>Line Item</th>
                    <th className="text-right py-2 font-semibold" style={{ color: "#6b7470" }}>Amount</th>
                    <th className="text-right py-2 font-semibold" style={{ color: "#6b7470" }}>% Rev</th>
                  </tr>
                </thead>
                <tbody>
                  {pnlRows.map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: "1px solid #f3f4f0",
                        backgroundColor: row.type === "ebitda" ? "#f0fdf4" : "transparent",
                        fontWeight: row.type === "ebitda" || row.type === "revenue" ? 700 : 400,
                      }}
                    >
                      <td className="py-2 pr-4" style={{ color: "#1a2e29" }}>{row.label}</td>
                      <td
                        className="py-2 text-right tabular-nums"
                        style={{ color: row.value < 0 ? "#dc2626" : "#1a2e29" }}
                      >
                        {fmtEurExact(row.value)}
                      </td>
                      <td className="py-2 text-right tabular-nums" style={{ color: "#6b7470" }}>
                        {fmtPct(row.pct, 1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e4dd" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif", fill: "#3d4a47" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fontFamily: "'DM Mono', monospace", fill: "#6b7470" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, "% of Revenue"]} />
                  <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={barColors[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Staffing */}
        <Card style={{ border: "1px solid #e6e4dd" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base" style={{ color: "#1a2e29" }}>
              Staffing — {b.sizeClass.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
              {[
                { label: "Total", value: b.staffing.total },
                { label: "F&B", value: b.staffing.fb },
                { label: "Housekeeping", value: b.staffing.housekeeping },
                { label: "Front Office", value: b.staffing.frontOffice },
                { label: "Admin", value: b.staffing.admin },
                { label: "Maintenance", value: b.staffing.maintenance },
              ].map((s) => (
                <div key={s.label} className="text-center rounded-lg p-3" style={{ background: "#f3f4f0" }}>
                  <p className="text-xl font-bold" style={{ color: "#02392C" }}>{s.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#6b7470" }}>{s.label}</p>
                </div>
              ))}
            </div>
            <Separator style={{ backgroundColor: "#e6e4dd" }} className="my-3" />
            <div className="flex flex-col md:flex-row gap-4 text-sm">
              <div>
                <span style={{ color: "#6b7470" }}>Annual labor cost: </span>
                <span className="font-semibold" style={{ color: "#1a2e29" }}>
                  {fmtEurExact(b.staffing.laborCostPerYear)}
                </span>
              </div>
              <div>
                <span style={{ color: "#6b7470" }}>Wage per staff/year: </span>
                <span className="font-semibold" style={{ color: "#1a2e29" }}>
                  {fmtEurExact(b.staffing.wagePerStaffYear)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional dynamics */}
        <Card style={{ border: "1px solid #e6e4dd" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base" style={{ color: "#1a2e29" }}>Regional Dynamics</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-lg p-4 mb-4 text-sm"
              style={{ borderLeft: "4px solid #02392C", background: "#f0fdf4", color: "#1a2e29" }}
            >
              {b.region.trend_note}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Summer Occupancy", value: `${b.region.summer_occ_2025}%` },
                { label: "Summer ADR", value: fmtEur(b.region.summer_adr_2025) },
                { label: "ALOS", value: `${b.region.alos} nights` },
                { label: "Seasonality", value: `${b.region.seasonality_ratio}x` },
                { label: "Top Foreign Market", value: `${b.region.top_foreign} (${b.region.top_foreign_share}%)` },
                { label: "Domestic Share", value: `${b.region.domestic_share}%` },
              ].map((s) => (
                <div key={s.label} className="rounded-lg p-3" style={{ background: "#f3f4f0" }}>
                  <p className="text-xs" style={{ color: "#6b7470" }}>{s.label}</p>
                  <p className="font-semibold text-sm mt-0.5" style={{ color: "#1a2e29" }}>{s.value}</p>
                </div>
              ))}
              <div className="rounded-lg p-3" style={{ background: "#f3f4f0" }}>
                <p className="text-xs" style={{ color: "#6b7470" }}>Risk Profile</p>
                <span
                  className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold text-white"
                  style={{ backgroundColor: RISK_COLORS[b.region.risk_profile] ?? "#6b7470" }}
                >
                  {riskLabel(b.region.risk_profile)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Watch-outs */}
        <Card style={{ border: "1px solid #e6e4dd" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base" style={{ color: "#1a2e29" }}>Watch-outs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {watchouts.map((w, i) => (
                <li key={i} className="flex gap-2 text-sm items-start">
                  <span style={{ color: severityColor[w.severity] ?? "#ea580c", flexShrink: 0 }}>⚠</span>
                  <span style={{ color: "#1a2e29" }}>{w.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Opportunities */}
        <Card style={{ border: "1px solid #e6e4dd" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base" style={{ color: "#1a2e29" }}>Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {opps.map((o, i) => (
                <div
                  key={i}
                  className="rounded-lg p-4 flex gap-3"
                  style={{ background: "#f3f4f0" }}
                >
                  <span className="text-2xl flex-shrink-0">{o.icon}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#1a2e29" }}>{o.title}</p>
                    <p className="text-sm mt-1" style={{ color: "#6b7470" }}>{o.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sustainability */}
        <Card style={{ border: "1px solid #e6e4dd" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base" style={{ color: "#1a2e29" }}>Sustainability Benchmarks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              {[
                { label: "Energy target", value: `${sus.energyTarget} kWh/m²/yr` },
                { label: "Est. energy cost", value: fmtEurExact(sus.energyCostEst) },
                { label: "Annual CO₂", value: `${fmtNum(sus.annualCo2, 1)} tCO₂/yr` },
                { label: "Annual water", value: `${fmtNum(sus.annualWaterM3)} m³/yr` },
              ].map((s) => (
                <div key={s.label} className="rounded-lg p-3" style={{ background: "#f3f4f0" }}>
                  <p className="text-xs" style={{ color: "#6b7470" }}>{s.label}</p>
                  <p className="font-semibold text-sm mt-0.5" style={{ color: "#1a2e29" }}>{s.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs" style={{ color: "#6b7470" }}>
              Solar yield for {b.region.name}: {b.region.solar_yield} kWh/kWp/yr
            </p>
          </CardContent>
        </Card>

        {/* Profix CTA */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: "#02392C", color: "#ffffff" }}
        >
          <h2 className="text-2xl font-bold mb-2">Ready to close the gap?</h2>
          <p className="text-sm mb-6 opacity-85 max-w-xl mx-auto">
            Profix turns these benchmarks into a live FinOps dashboard — P&L tracking, cost alerts,
            and AI-powered insights tailored to your hotel.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://calendly.com/james-myprofix/profix-demo"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                style={{ backgroundColor: "#ffffff", color: "#02392C", fontWeight: 700 }}
                className="hover:bg-gray-100"
              >
                Book a 20-minute demo
              </Button>
            </a>
            <a
              href="https://app.myprofix.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                style={{ borderColor: "#ffffff", color: "#ffffff", background: "transparent" }}
                className="hover:bg-white/10"
              >
                Open Profix →
              </Button>
            </a>
          </div>
        </div>

        {/* Methodology & sources footer */}
        <p
          className="text-xs text-center pb-4"
          style={{ color: "#a8b3ad" }}
        >
          Sources: INE/TravelBI, Banco de Portugal, DREM, SREA, AHP, Horwath HTL, BEONx,
          HVS, JLL, CBRE, HotStats, HOTREC, EU BEMP, Shiji ReviewPro —
          Portugal Hotel Benchmark Bible v2 May 2026
        </p>
      </div>
    </div>
  );
}
