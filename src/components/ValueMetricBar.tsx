import { Card } from "@/components/ui/card";
import { Clock, AlertTriangle, FileCheck2, Sparkles } from "lucide-react";

const metrics = [
  { icon: Clock,         label: "Time saved",          value: "~2.5h / week per manager" },
  { icon: AlertTriangle, label: "Variance flagged",    value: "GOP gaps within 24h" },
  { icon: Sparkles,      label: "Consolidation",       value: "Zero manual P&L work" },
  { icon: FileCheck2,    label: "Audit-ready exports", value: "1-click delivery" },
];

/** North-star value-selling bar. Marketing claims, not live data. */
export const ValueMetricBar = () => (
  <Card className="p-4 space-y-3">
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold">Outcomes Profix delivers</h2>
      <span className="text-[10px] text-muted-foreground italic">Based on pilot feedback</span>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((m) => (
        <div key={m.label} className="flex items-start gap-2.5 p-2.5 rounded-md border bg-muted/30">
          <m.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{m.label}</p>
            <p className="text-xs font-semibold mt-0.5 leading-tight">{m.value}</p>
          </div>
        </div>
      ))}
    </div>
  </Card>
);
