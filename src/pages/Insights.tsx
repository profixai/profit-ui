import { AppShell } from "@/components/AppShell";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InsightCard {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  category: string;
  isNew: boolean;
  summary: string;
  metrics: { label: string; value: string }[];
  impact: string;
  context: string;
  recommendation: string;
}

const mockInsights: InsightCard[] = [
  {
    id: "1",
    title: "RevPAR Declining Significantly",
    severity: "high",
    category: "Revenue Management",
    isNew: true,
    summary:
      "RevPAR dropped from €142 to €118 over the last quarter, indicating a combined rate and occupancy pressure that requires immediate pricing review.",
    metrics: [
      { label: "RevPAR (current)", value: "€118" },
      { label: "RevPAR (prior)", value: "€142" },
      { label: "ADR", value: "€165 → €158" },
      { label: "Occupancy", value: "86% → 75%" },
    ],
    impact:
      "Estimated revenue shortfall of €210K annualised if the trend continues through Q1.",
    context:
      "ADR compression alongside occupancy drops suggests competitive displacement rather than seasonal softness. Comparable set ADR is stable at €162.",
    recommendation:
      "Review dynamic pricing rules for midweek segments. Consider targeted packages for corporate extended stays to recover occupancy without further rate erosion. Run a 2-week A/B test on BAR flex vs. non-refundable mix.",
  },
  {
    id: "2",
    title: "Revenue Decline Requires Cost Action",
    severity: "high",
    category: "Cost Control",
    isNew: true,
    summary:
      "Total operating revenue fell 8.2% QoQ while controllable costs remained flat, compressing GOP margin from 34.1% to 28.6%.",
    metrics: [
      { label: "Revenue decline", value: "−8.2% QoQ" },
      { label: "GOP margin", value: "28.6% (was 34.1%)" },
      { label: "Labour ratio", value: "38.4% of revenue" },
      { label: "F&B COGS", value: "32.1% of F&B rev" },
    ],
    impact:
      "GOP shortfall of €185K versus budget. At current trajectory, full-year GOP will miss target by €540K.",
    context:
      "Rooms revenue (−6.1%) and F&B (−12.4%) both declined. Spa/Other held flat. Labour hours did not flex with lower covers and occupancy.",
    recommendation:
      "Implement variable staffing model tied to 3-day rolling forecast. Renegotiate top-3 F&B supplier contracts (wine, proteins, dairy) — current terms are 4–7% above market. Target labour ratio ≤ 35% within 60 days.",
  },
];

const severityColor: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-accent/10 text-accent-foreground border-accent/20",
  low: "bg-positive/10 text-positive border-positive/20",
};

const InsightTile = ({ insight }: { insight: InsightCard }) => (
  <div className="bg-card rounded-xl border p-6 space-y-4">
    {/* Header */}
    <div className="flex items-start gap-3">
      <div className="mt-0.5 h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
        <AlertCircle className="h-4 w-4 text-destructive" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground leading-snug">
          {insight.title}
        </h3>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <Badge
            className={`text-[10px] font-semibold uppercase px-2 py-0.5 ${severityColor[insight.severity]}`}
          >
            {insight.severity}
          </Badge>
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
            {insight.category}
          </Badge>
          {insight.isNew && (
            <Badge className="text-[10px] px-2 py-0.5 bg-primary text-primary-foreground">
              NEW
            </Badge>
          )}
        </div>
      </div>
    </div>

    {/* Summary */}
    <p className="text-xs text-muted-foreground leading-relaxed">
      {insight.summary}
    </p>

    {/* Metrics grid */}
    <div className="grid grid-cols-2 gap-2">
      {insight.metrics.map((m) => (
        <div
          key={m.label}
          className="bg-muted/50 rounded-lg px-3 py-2"
        >
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {m.label}
          </p>
          <p className="text-xs font-semibold text-foreground font-mono-data mt-0.5">
            {m.value}
          </p>
        </div>
      ))}
    </div>

    {/* Impact & Context */}
    <div className="space-y-2">
      <div>
        <p className="text-[10px] font-semibold text-foreground uppercase tracking-wide">
          Impact
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
          {insight.impact}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-semibold text-foreground uppercase tracking-wide">
          Context
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
          {insight.context}
        </p>
      </div>
    </div>

    {/* Recommendation */}
    <div className="bg-muted/30 border border-border rounded-lg p-3">
      <p className="text-[10px] font-semibold text-foreground uppercase tracking-wide mb-1">
        Recommendation
      </p>
      <p className="text-xs text-foreground/80 leading-relaxed">
        {insight.recommendation}
      </p>
    </div>
  </div>
);

const Insights = () => (
  <AppShell>
    <div className="max-w-5xl mx-auto space-y-4 py-1">
      <div>
        <h1 className="text-base font-semibold text-foreground">AI Insights</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Priority actions generated from your latest P&L data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockInsights.map((insight) => (
          <InsightTile key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  </AppShell>
);

export default Insights;
