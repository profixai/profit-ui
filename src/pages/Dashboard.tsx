import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { WhyThisMatters } from "@/components/saas/WhyThisMatters";
import { pageValueBlocks } from "@/lib/saas-data";
import { AppShell } from "@/components/AppShell";
import { HeadlineRow } from "@/components/dashboard/HeadlineRow";
import { KPICard } from "@/components/dashboard/KPICard";
import { MarginTrendChart } from "@/components/dashboard/MarginTrendChart";
import { CostBreakdownSection } from "@/components/dashboard/CostBreakdownSection";
import { BreakevenCard } from "@/components/dashboard/BreakevenCard";
import { MonthlyDetailTable } from "@/components/dashboard/MonthlyDetailTable";
import { InlineAIRow } from "@/components/dashboard/InlineAIRow";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp, TrendingDown, AlertTriangle, Building2, Send,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import {
  mockMonthlyMargin,
  mockCostDrivers,
  mockDepartmentCosts,
  mockBreakeven,
  mockKPIs,
  mockAIResponses,
} from "@/lib/mock-data";

const formatCurrency = (v: number) => {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`;
  return `€${v}`;
};

const kpiCards = [
  { key: "kpi-total-revenue", label: "Total Revenue", value: formatCurrency(mockKPIs.total_revenue), delta: mockKPIs.revenue_delta },
  { key: "kpi-total-costs", label: "Total Costs", value: formatCurrency(mockKPIs.total_costs), delta: mockKPIs.costs_delta },
  { key: "kpi-gop", label: "GOP", value: formatCurrency(mockKPIs.gop), delta: mockKPIs.gop_delta },
  { key: "kpi-gop-margin", label: "GOP Margin", value: `${mockKPIs.gop_margin_pct}%`, delta: mockKPIs.margin_delta },
];

// Direction-level KPIs (8 metrics)
const directionKPIs = [
  { label: "Total Revenue", value: 298900, budget: 285000 },
  { label: "GOP", value: 128400, budget: 120000 },
  { label: "NOI / EBITDA", value: 94200, budget: 90000 },
  { label: "RevPAR", value: 142, budget: 135 },
  { label: "OCC%", value: 74, budget: 72 },
  { label: "ADR", value: 192, budget: 188 },
  { label: "F&B Cost %", value: 33.8, budget: 30 },
  { label: "Flow-Through", value: 62, budget: 65 },
];

const gopTrend = mockMonthlyMargin.map((m) => ({
  month: m.month.split("-")[1],
  gop: m.gop,
}));

const criticalInsights = [
  { headline: "F&B Cost % exceeded budget by 4.2 pts", department: "F&B" },
  { headline: "RevPAR declined 11% vs. same period last year", department: "Rooms" },
  { headline: "Payroll % of revenue at 30.2% — above 28% threshold", department: "Payroll" },
];

const fmt = (v: number, isCurrency: boolean) => {
  if (!isCurrency) return `${v}%`;
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`;
  return `€${v}`;
};

// ─── Direction Dashboard ──────────────────────────────────────────
const DirectionDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto space-y-4 py-1">
      <WhyThisMatters block={pageValueBlocks.dashboard} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">Executive Overview</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">Direction-level KPI summary</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="le-grand">
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="le-grand">Le Grand Hôtel</SelectItem>
              <SelectItem value="riviera">Riviera Palace</SelectItem>
              <SelectItem value="alpine">Alpine Lodge</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => navigate("/multi-property")}
          >
            <Building2 className="h-3.5 w-3.5" /> Multi-Property
          </Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {directionKPIs.map((kpi) => {
          const delta = kpi.budget ? ((kpi.value - kpi.budget) / kpi.budget * 100).toFixed(1) : "0.0";
          const isCost = kpi.label.includes("Cost");
          const positive = kpi.value >= kpi.budget;
          const isGood = isCost ? !positive : positive;
          const isCurrency = !kpi.label.includes("%") && kpi.label !== "OCC%";

          return (
            <Card key={kpi.label} className="p-3 space-y-1">
              <p className="text-[10px] text-muted-foreground font-medium truncate">{kpi.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-semibold font-mono-data">{fmt(kpi.value, isCurrency)}</span>
                {isGood ? <TrendingUp className="h-3 w-3 text-positive" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
              </div>
              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${isGood ? "text-positive border-positive/30" : "text-destructive border-destructive/30"}`}>
                {positive ? "+" : ""}{delta}%
              </Badge>
            </Card>
          );
        })}
      </div>

      {/* GOP Trend */}
      <Card className="p-4">
        <h2 className="text-sm font-medium mb-3">GOP Trend (12 Months)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={gopTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
            <Bar dataKey="gop" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Top 3 Critical Insights */}
      <Card className="p-4 space-y-3">
        <h2 className="text-sm font-medium">Critical Insights</h2>
        {criticalInsights.map((ins, i) => (
          <div key={i} className="flex items-start gap-2 p-3 bg-destructive/5 border border-destructive/15 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <Badge variant="outline" className="text-[10px] mb-1">{ins.department}</Badge>
              <p className="text-xs">{ins.headline}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

// ─── Manager Dashboard ────────────────────────────────────────────
const ManagerDashboard = () => {
  const [activeAI, setActiveAI] = useState<string | null>(null);

  const toggleAI = useCallback((key: string) => {
    setActiveAI((prev) => (prev === key ? null : key));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-4 py-1">
      <div>
        <h1 className="text-base font-semibold text-foreground">P&L Dashboard</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Jan – Dec 2024 · Uploaded from f5.tables.xlsx
        </p>
      </div>

      <HeadlineRow
        period="Q4 2024"
        gop={formatCurrency(mockKPIs.gop)}
        marginPct={mockKPIs.gop_margin_pct}
        marginDelta={mockKPIs.margin_delta}
        verdict="Solid quarter — margin held despite cost headwinds"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((kpi, i) => (
          <div key={kpi.key}>
            <KPICard
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              index={i}
              active={activeAI === kpi.key}
              onClick={() => toggleAI(kpi.key)}
            />
            <InlineAIRow
              visible={activeAI === kpi.key}
              content={mockAIResponses[kpi.key] || ""}
            />
          </div>
        ))}
      </div>

      <MarginTrendChart
        data={mockMonthlyMargin}
        target={40}
        active={activeAI === "margin-trend"}
        onClickPoint={(month) => toggleAI(`month-${month}`)}
      />
      <InlineAIRow
        visible={activeAI === "margin-trend"}
        content={mockAIResponses["margin-trend"] || ""}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CostBreakdownSection
            departments={mockDepartmentCosts}
            drivers={mockCostDrivers}
            active={activeAI === "cost-breakdown"}
            onClickSegment={(dept) => toggleAI(`dept-${dept}`)}
            onClickRow={(account) => toggleAI(`account-${account}`)}
          />
          <InlineAIRow
            visible={activeAI === "cost-breakdown"}
            content={mockAIResponses["cost-breakdown"] || ""}
          />
        </div>
        <BreakevenCard
          breakeven_occupancy_pct={mockBreakeven.breakeven_occupancy_pct}
          current_occupancy_pct={mockBreakeven.current_occupancy_pct}
          rooms_per_night_needed={mockBreakeven.rooms_per_night_needed}
          months_below={mockBreakeven.months_below}
          total_months={mockBreakeven.total_months}
          active={activeAI === "breakeven"}
          onClick={() => toggleAI("breakeven")}
        />
      </div>

      <MonthlyDetailTable data={mockMonthlyMargin} />
    </div>
  );
};

const Dashboard = () => {
  const { role } = useAuth();

  return (
    <AppShell>
      {role === "direction" ? <DirectionDashboard /> : <ManagerDashboard />}
    </AppShell>
  );
};

export default Dashboard;
