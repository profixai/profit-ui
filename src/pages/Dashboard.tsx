import { useState } from "react";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { mockInsightsResponse, mockAIResponses } from "@/lib/mock-data";
import { KPICard } from "@/components/dashboard/KPICard";
import { InlineAIRow } from "@/components/dashboard/InlineAIRow";
import { MarginTrendChart } from "@/components/dashboard/MarginTrendChart";
import { CostBreakdownSection } from "@/components/dashboard/CostBreakdownSection";
import { BreakevenCard } from "@/components/dashboard/BreakevenCard";
import { MonthlyDetailTable } from "@/components/dashboard/MonthlyDetailTable";

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
    { key: "kpi-total-revenue", label: "Total Revenue", value: formatCurrency(d.kpis.total_revenue), delta: d.kpis.revenue_delta },
    { key: "kpi-total-costs", label: "Total Costs", value: formatCurrency(d.kpis.total_costs), delta: -d.kpis.costs_delta },
    { key: "kpi-gop", label: "GOP", value: formatCurrency(d.kpis.gop), delta: d.kpis.gop_delta },
    { key: "kpi-gop-margin", label: "GOP Margin", value: `${d.kpis.gop_margin_pct}%`, delta: d.kpis.margin_delta },
  ];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Block 1: Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-bold">Le Grand Hôtel</h1>
            <p className="text-xs text-muted-foreground">
              {d.period_start} – {d.period_end} · <span className="font-mono-data">{d.filename}</span>
            </p>
          </div>
          <Link to="/data" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
            <Upload className="h-3.5 w-3.5" />
            Re-upload
          </Link>
        </div>

        {/* Block 2: KPI Strip */}
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

        {/* Block 3: Margin Trend */}
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

        {/* Block 4: Cost Breakdown */}
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

        {/* Block 5: Breakeven */}
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

        {/* Block 6: Monthly Detail */}
        <MonthlyDetailTable data={d.monthly_margins} />
      </div>
    </AppShell>
  );
};

export default Dashboard;
