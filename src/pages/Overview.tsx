import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeltaBadge } from "@/components/dashboard/DeltaBadge";
import {
  TrendingUp, Clock, Sparkles, ArrowRight,
  CheckCircle2, AlertTriangle, Database,
} from "lucide-react";

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

const topKPIs = [
  { label: "Reporting Time Saved", value: "12 hrs/mo", icon: Clock, detail: "per property" },
  { label: "Anomaly Detection", value: "48 hrs faster", icon: Sparkles, detail: "vs manual review" },
  { label: "Cost Variance Reduction", value: "2–4 pts", icon: TrendingUp, detail: "F&B cost %" },
];

const Overview = () => {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* ── North Star KPI ──────────────────────────────────── */}
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
              North Star · GOP Margin
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono-data">42.8%</span>
              <DeltaBadge value={1.2} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">vs 41.6% prior month</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => navigate("/pl")}>
            View P&L <ArrowRight className="h-3 w-3" />
          </Button>
        </Card>

        {/* ── Top 3 KPI Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topKPIs.map((kpi) => (
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

        {/* ── What Changed ──────────────────────────────────────── */}
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

        {/* ── Next Best Action ──────────────────────────────────── */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold">Review F&B Costs — 2 alerts pending</p>
              <p className="text-[11px] text-muted-foreground">
                F&B cost % is at 33.8%, above the 32% threshold. Open the P&L to drill down.
              </p>
            </div>
            <Button size="sm" className="text-xs gap-1.5 shrink-0" onClick={() => navigate("/pl")}>
              Review Now <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </Card>

        {/* ── Data Status ───────────────────────────────────────── */}
        <Card className="p-4">
          <h2 className="text-sm font-semibold mb-3">Data Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-positive shrink-0" />
              <div>
                <p className="text-xs font-medium">Last Sync</p>
                <p className="text-[11px] text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Database className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs font-medium">Files This Month</p>
                <p className="text-[11px] text-muted-foreground">4 uploaded</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              <div>
                <p className="text-xs font-medium">Pending Anomalies</p>
                <p className="text-[11px] text-muted-foreground">3 require review</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
};

export default Overview;
