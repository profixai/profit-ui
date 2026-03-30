import { useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { HeadlineRow } from "@/components/dashboard/HeadlineRow";
import { KPICard } from "@/components/dashboard/KPICard";
import { MarginTrendChart } from "@/components/dashboard/MarginTrendChart";
import { CostBreakdownSection } from "@/components/dashboard/CostBreakdownSection";
import { BreakevenCard } from "@/components/dashboard/BreakevenCard";
import { MonthlyDetailTable } from "@/components/dashboard/MonthlyDetailTable";
import { InlineAIRow } from "@/components/dashboard/InlineAIRow";
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

const Dashboard = () => {
  const [activeAI, setActiveAI] = useState<string | null>(null);

  const toggleAI = useCallback((key: string) => {
    setActiveAI((prev) => (prev === key ? null : key));
  }, []);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-4 py-1">
        <div>
          <h1 className="text-base font-semibold text-foreground">P&L Dashboard</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Jan – Dec 2024 · Uploaded from f5.tables.xlsx
          </p>
        </div>

        {/* Headline */}
        <HeadlineRow
          period="Q4 2024"
          gop={formatCurrency(mockKPIs.gop)}
          marginPct={mockKPIs.gop_margin_pct}
          marginDelta={mockKPIs.margin_delta}
          verdict="Solid quarter — margin held despite cost headwinds"
        />

        {/* KPI Cards */}
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

        {/* Margin Trend */}
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

        {/* Cost Breakdown + Breakeven */}
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

        {/* Monthly Detail */}
        <MonthlyDetailTable data={mockMonthlyMargin} />
      </div>
    </AppShell>
  );
};

export default Dashboard;
