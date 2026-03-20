import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { mockKPIs, mockMonthlyMargin, mockCostDrivers, mockDepartmentCosts, mockBreakeven } from "@/lib/mock-data";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ReferenceLine
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { AskProfixPanel } from "@/components/AskProfixPanel";
import { ExplainButton } from "@/components/ExplainButton";

const formatCurrency = (v: number) => {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`;
  return `€${v}`;
};

const DeltaBadge = ({ value }: { value: number }) => {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${
        positive ? "bg-positive/10 text-positive" : "bg-destructive/10 text-destructive"
      }`}
    >
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
};

const DEPT_COLORS = ["#0D4F5C", "#1A7A4A", "#E8A838", "#C0392B", "#6B6B6B", "#3B82F6"];

const Dashboard = () => {
  const [askOpen, setAskOpen] = useState(false);
  const [askPrefill, setAskPrefill] = useState("");
  const [askContext, setAskContext] = useState("");

  const openAsk = (question: string, context: string) => {
    setAskPrefill(question);
    setAskContext(context);
    setAskOpen(true);
  };

  const kpis = [
    { label: "Total Revenue", value: formatCurrency(mockKPIs.total_revenue), delta: mockKPIs.revenue_delta },
    { label: "Total Costs", value: formatCurrency(mockKPIs.total_costs), delta: mockKPIs.costs_delta, invertColor: true },
    { label: "GOP", value: formatCurrency(mockKPIs.gop), delta: mockKPIs.gop_delta },
    { label: "GOP Margin", value: `${mockKPIs.gop_margin_pct}%`, delta: mockKPIs.margin_delta },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPI Strip */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Key Performance Indicators</h2>
            <ExplainButton onClick={() => openAsk("Explain the current KPIs — what drove revenue and cost changes this period?", "Dashboard – KPIs")} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-lg border p-4"
              >
                <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                <p className="text-2xl font-bold font-mono-data mt-1">{kpi.value}</p>
                <div className="mt-1">
                  <DeltaBadge value={kpi.invertColor ? -kpi.delta : kpi.delta} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Margin Trend */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-lg border p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">GOP Margin Trend</h2>
              <p className="text-xs text-muted-foreground">Monthly gross operating profit margin</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground border rounded px-2 py-0.5">Target: 25%</span>
              <ExplainButton onClick={() => openAsk("Explain why GOP margin dropped in October and which costs changed the most.", "Dashboard – Margin Trend")} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={mockMonthlyMargin}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 12%, 89%)" />
              <XAxis
                dataKey="month"
                tickFormatter={(v) => v.split("-")[1]}
                tick={{ fontSize: 11, fill: "#6B6B6B" }}
              />
              <YAxis
                domain={[20, 55]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11, fill: "#6B6B6B" }}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, "GOP Margin"]}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <ReferenceLine y={25} stroke="#E8A838" strokeDasharray="6 4" label={{ value: "Target", fontSize: 10, fill: "#E8A838" }} />
              <Line
                type="monotone"
                dataKey="gop_margin_pct"
                stroke="#0D4F5C"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#0D4F5C" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Cost Drivers + Dept Donut */}
        <div className="grid lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 bg-card rounded-lg border p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Top Cost Drivers</h2>
              <ExplainButton onClick={() => openAsk("Analyse the top cost drivers — which accounts have the highest anomalies and what should we do about them?", "Dashboard – Cost Drivers")} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">Account</th>
                    <th className="text-left py-2 font-medium">Department</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                    <th className="text-right py-2 font-medium">Share</th>
                    <th className="text-right py-2 font-medium">Δ Prior</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCostDrivers.map((d) => (
                    <tr key={d.rank} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 font-medium">{d.account_name}</td>
                      <td className="py-2.5 text-muted-foreground">{d.department}</td>
                      <td className="py-2.5 text-right font-mono-data">{formatCurrency(d.amount)}</td>
                      <td className="py-2.5 text-right font-mono-data">{d.pct_of_total_cost.toFixed(1)}%</td>
                      <td className="py-2.5 text-right">
                        <span className="inline-flex items-center gap-1">
                          {d.delta_pct > 30 && <AlertTriangle className="h-3 w-3 text-accent" />}
                          <DeltaBadge value={d.delta_pct} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:col-span-2 bg-card rounded-lg border p-5"
          >
            <h2 className="text-sm font-semibold mb-3">Cost by Department</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={mockDepartmentCosts}
                  dataKey="total"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {mockDepartmentCosts.map((_, i) => (
                    <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {mockDepartmentCosts.slice(0, 4).map((d, i) => (
                <div key={d.department} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: DEPT_COLORS[i] }} />
                    {d.department}
                  </span>
                  <span className="font-mono-data text-muted-foreground">{d.pct}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Breakeven Panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-lg border p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Breakeven Analysis</h2>
            <ExplainButton onClick={() => openAsk("Explain our breakeven position — what would it take to reduce the breakeven occupancy rate?", "Dashboard – Breakeven")} />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div>
              <p className="text-4xl font-bold font-mono-data text-primary">{mockBreakeven.breakeven_occupancy_pct}%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Breakeven occupancy</p>
              <p className="text-xs text-muted-foreground">
                You need <span className="font-medium text-foreground">{mockBreakeven.rooms_per_night_needed} rooms/night</span> to cover fixed costs
              </p>
            </div>
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>0%</span>
                <span>100%</span>
              </div>
              <div className="h-4 bg-muted rounded-full relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-primary rounded-full transition-all"
                  style={{ width: `${mockBreakeven.current_occupancy_pct}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-accent"
                  style={{ left: `${mockBreakeven.breakeven_occupancy_pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-primary font-medium">Current: {mockBreakeven.current_occupancy_pct}%</span>
                <span className="text-accent font-medium">Breakeven: {mockBreakeven.breakeven_occupancy_pct}%</span>
              </div>
            </div>
          </div>
          {mockBreakeven.months_below > 0 && (
            <p className="text-xs text-destructive mt-3 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {mockBreakeven.months_below} of {mockBreakeven.total_months} months were below breakeven
            </p>
          )}
        </motion.div>

        {/* Sustainability placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-card rounded-lg border border-dashed p-5 flex items-center justify-between"
        >
          <div>
            <h2 className="text-sm font-semibold">Sustainability Snapshot</h2>
            <p className="text-xs text-muted-foreground">CO₂e, Water, and Energy metrics</p>
          </div>
          <span className="text-xs bg-accent/15 text-accent px-2.5 py-1 rounded-md font-medium">
            Upload utilities data to unlock
          </span>
        </motion.div>
      </div>

      <AskProfixPanel
        externalOpen={askOpen}
        onClose={() => setAskOpen(false)}
        prefillQuestion={askPrefill}
        contextLabel={askContext}
      />
    </AppShell>
  );
};

export default Dashboard;
