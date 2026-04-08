import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeatureValueMatrix } from "@/components/saas/FeatureValueMatrix";
import { PackagingTiers } from "@/components/saas/PackagingTiers";
import { CompetitiveComparison } from "@/components/saas/CompetitiveComparison";
import { featureValueMatrix, packageTiers } from "@/lib/saas-data";
import {
  TrendingUp, Clock, Shield, ArrowRight, Sparkles,
  BarChart2, Building2, CheckCircle2,
} from "lucide-react";

const kpiOutcomes = [
  { label: "Reporting Time Saved", value: "12 hrs/mo", icon: Clock, detail: "per property" },
  { label: "Anomaly Detection", value: "48 hrs faster", icon: Sparkles, detail: "vs manual review" },
  { label: "Cost Variance Reduction", value: "2–4 pts", icon: TrendingUp, detail: "F&B cost %" },
  { label: "Deployment Time", value: "< 2 weeks", icon: Shield, detail: "to production" },
];

const changeLog = [
  { text: "F&B Cost % exceeded 32% threshold — AI alert triggered", severity: "critical" as const },
  { text: "RevPAR trending 11% below prior year — review recommended", severity: "warning" as const },
  { text: "Weekend occupancy averaging 88% — dynamic pricing opportunity", severity: "info" as const },
];

const severityClass = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  warning: "bg-accent/10 text-accent-foreground border-accent/20",
  info: "bg-primary/10 text-primary border-primary/20",
};

const Overview = () => {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ── Hero Value Statement ──────────────────────────── */}
        <div className="space-y-2">
          <h1 className="text-lg font-semibold text-foreground">
            Hospitality P&L Intelligence — Deployed in Weeks, Governed from Day One
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Profix transforms raw financial data into USALI-standard reporting, AI-driven insights,
            and portfolio benchmarking. Built for IT adoption: secure, interoperable, and exportable.
          </p>
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="text-xs gap-1.5" onClick={() => navigate("/pl")}>
              <BarChart2 className="h-3.5 w-3.5" /> Open P&L
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => navigate("/enterprise")}>
              <Shield className="h-3.5 w-3.5" /> View Enterprise Controls
            </Button>
          </div>
        </div>

        {/* ── KPI Outcome Strip ─────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpiOutcomes.map((kpi) => (
            <Card key={kpi.label} className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <kpi.icon className="h-4 w-4 text-primary" />
                <p className="text-[10px] text-muted-foreground font-medium">{kpi.label}</p>
              </div>
              <p className="text-lg font-semibold font-mono-data">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground">{kpi.detail}</p>
            </Card>
          ))}
        </div>

        {/* ── What Changed ──────────────────────────────────── */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">What Changed Since Last Check-in</h2>
            <Button variant="ghost" size="sm" className="text-xs gap-1 h-7" onClick={() => navigate("/insights")}>
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2">
            {changeLog.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-md border">
                <Badge variant="outline" className={`text-[9px] capitalize ${severityClass[item.severity]}`}>
                  {item.severity}
                </Badge>
                <span className="text-xs">{item.text}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Upgrade Prompt ────────────────────────────────── */}
        <Card className="p-4 bg-primary/5 border-primary/15">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium">Unlock Portfolio Benchmarking</p>
                <p className="text-[11px] text-muted-foreground">
                  Compare KPIs across all properties in one view. Available on Team plan.
                </p>
              </div>
            </div>
            <Button size="sm" className="text-xs gap-1">
              <CheckCircle2 className="h-3 w-3" /> Upgrade to Team
            </Button>
          </div>
        </Card>

        {/* ── Competitive Benchmark ─────────────────────────── */}
        <CompetitiveComparison />

        {/* ── Feature Value Matrix ──────────────────────────── */}
        <FeatureValueMatrix features={featureValueMatrix} />

        {/* ── Packaging ─────────────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Plans & Packaging</h2>
          <PackagingTiers tiers={packageTiers} />
        </div>
      </div>
    </AppShell>
  );
};

export default Overview;
