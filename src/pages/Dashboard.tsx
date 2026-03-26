import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { mockInsightsResponse, mockAIResponses } from "@/lib/mock-data";
import { KPICard } from "@/components/dashboard/KPICard";
import { InlineAIRow } from "@/components/dashboard/InlineAIRow";
import { MarginTrendChart } from "@/components/dashboard/MarginTrendChart";
import { CostBreakdownSection } from "@/components/dashboard/CostBreakdownSection";
import { BreakevenCard } from "@/components/dashboard/BreakevenCard";
import { MonthlyDetailTable } from "@/components/dashboard/MonthlyDetailTable";
import { HeadlineRow } from "@/components/dashboard/HeadlineRow";

const formatCurrency = (v: number) => {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`;
  return `€${v}`;
};

const Dashboard = () => {
  const [activeAI, setActiveAI] = useState<{ block: string; context: string } | null>(null);

  const d = mockInsightsResponse;

  const toggleAI = (block: string, context: string) => {
    setActiveAI((prev) => (prev?.block === block ? null : { block, context }));
  };

  const aiContent = (key: string) => mockAIResponses[key] || "Analysis not available for this selection.";

  const kpis = [
    { key: "kpi-total-revenue", label: "Revenue", value: formatCurrency(d.kpis.total_revenue), delta: d.kpis.revenue_delta },
    { key: "kpi-total-costs", label: "Costs", value: formatCurrency(d.kpis.total_costs), delta: -d.kpis.costs_delta },
    { key: "kpi-gop", label: "GOP", value: formatCurrency(d.kpis.gop), delta: d.kpis.gop_delta },
    { key: "kpi-gop-margin", label: "Margin", value: `${d.kpis.gop_margin_pct}%`, delta: d.kpis.margin_delta },
  ];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-3 py-1">
        {/* Header */}
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-base font-semibold text-foreground">Performance Overview</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {d.period_start} – {d.period_end}
              <span className="ml-2 font-mono-data">{d.filename}</span>
            </p>
          </div>
        </div>

        {/* KPI Strip */}
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {kpis.map((kpi, i) => (
              <KPICard
                key={kpi.key}
                label={kpi.label}
                value={kpi.value}
                delta={kpi.delta}
                index={i}
                active={activeAI?.block === kpi.key}
                onClick={() => toggleAI(kpi.key, kpi.key)}
              />
            ))}
          </div>
          <InlineAIRow
            visible={!!activeAI && activeAI.block.startsWith("kpi-")}
            content={activeAI?.block.startsWith("kpi-") ? aiContent(activeAI.context) : ""}
          />
        </div>

        {/* Margin Trend */}
        <div>
          <MarginTrendChart
            data={d.monthly_margins}
            active={activeAI?.block === "margin-trend"}
            onClickPoint={(month) => toggleAI("margin-trend", "margin-trend")}
          />
          <InlineAIRow
            visible={activeAI?.block === "margin-trend"}
            content={aiContent("margin-trend")}
          />
        </div>

        {/* Cost Breakdown */}
        <div>
          <CostBreakdownSection
            departments={d.department_costs}
            drivers={d.cost_drivers}
            active={activeAI?.block === "cost-breakdown"}
            onClickSegment={(dept) => toggleAI("cost-breakdown", `dept-${dept}`)}
            onClickRow={(account) => toggleAI("cost-breakdown", `driver-${account}`)}
          />
          <InlineAIRow
            visible={activeAI?.block === "cost-breakdown"}
            content={activeAI?.block === "cost-breakdown" ? aiContent(activeAI.context) : ""}
          />
        </div>

        {/* Breakeven */}
        <div>
          <BreakevenCard
            {...d.breakeven}
            active={activeAI?.block === "breakeven"}
            onClick={() => toggleAI("breakeven", "breakeven")}
          />
          <InlineAIRow
            visible={activeAI?.block === "breakeven"}
            content={aiContent("breakeven")}
          />
        </div>

        {/* Monthly Detail */}
        <MonthlyDetailTable data={d.monthly_margins} />
      </div>
    </AppShell>
  );
};

export default Dashboard;
