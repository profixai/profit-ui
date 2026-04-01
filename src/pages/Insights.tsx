import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle, AlertCircle, Info, Check, Send, Bell,
} from "lucide-react";
import { toast } from "sonner";

type Severity = "critical" | "warning" | "info";

interface InsightCard {
  id: string;
  severity: Severity;
  department: string;
  headline: string;
  detail: string;
  timestamp: string;
}

const mockInsights: InsightCard[] = [
  {
    id: "1", severity: "critical", department: "F&B",
    headline: "F&B Cost % exceeded budget by 4.2 pts this week",
    detail: "F&B Cost of Sales reached 33.8% against a 30% budget target. The primary driver is a 12% increase in protein costs from the main supplier, combined with higher-than-normal wastage rates in the breakfast buffet service.",
    timestamp: "2026-04-01 08:15",
  },
  {
    id: "2", severity: "critical", department: "Rooms",
    headline: "RevPAR declined 11% vs. same period last year",
    detail: "RevPAR dropped from €160 to €142. ADR held steady at €192 but occupancy fell from 83% to 74%. The decline coincides with a new competitor opening 2km away and reduced conference bookings.",
    timestamp: "2026-04-01 07:30",
  },
  {
    id: "3", severity: "warning", department: "Energy",
    headline: "Electricity consumption 15% above seasonal norm",
    detail: "March electricity usage spiked to 42,000 kWh vs. the 36,500 kWh seasonal average. HVAC runtime increased by 22% despite moderate outdoor temperatures. Consider checking BMS scheduling and occupancy sensor calibration.",
    timestamp: "2026-03-31 18:00",
  },
  {
    id: "4", severity: "warning", department: "Payroll",
    headline: "Overtime hours up 18% in Housekeeping",
    detail: "Housekeeping logged 340 overtime hours this month, up from 288 last month. Contributing factors include two staff vacancies and a 6% increase in room turnover rate. Current cost impact: +€4,200/month.",
    timestamp: "2026-03-31 14:22",
  },
  {
    id: "5", severity: "info", department: "Rooms",
    headline: "Weekend occupancy trending above forecast",
    detail: "Weekend OCC% averaged 88% over the last 4 weeks vs. 82% forecast. Consider dynamic pricing adjustments for Fri–Sun to capture additional revenue. Estimated uplift: €2,800/month.",
    timestamp: "2026-03-30 09:45",
  },
  {
    id: "6", severity: "info", department: "F&B",
    headline: "Room service revenue up 24% after menu refresh",
    detail: "The Q1 menu update has driven room service revenue from €8,200 to €10,200/month. Top performers are the new breakfast bowl (+€1,100) and evening tapas selection (+€900). Consider expanding availability.",
    timestamp: "2026-03-29 16:30",
  },
  {
    id: "7", severity: "warning", department: "Energy",
    headline: "Water consumption anomaly detected in Q3 data",
    detail: "Water intensity spiked to 520 L/guest-night in Q3 — a 31.6% jump from Q2. This correlates with peak summer occupancy but exceeds the expected proportional increase. Investigate possible leaks or irrigation system issues.",
    timestamp: "2026-03-28 11:15",
  },
  {
    id: "8", severity: "critical", department: "Payroll",
    headline: "Payroll % of revenue at 30.2% — above 28% threshold",
    detail: "Total payroll costs reached €90,300 against €298,900 revenue. The ratio exceeds the USALI mid-scale benchmark of 28%. Key drivers: management salary increases (+3.8%) and unfilled positions requiring agency staff.",
    timestamp: "2026-03-27 08:00",
  },
];

const severityConfig: Record<Severity, { icon: React.ElementType; color: string; bg: string }> = {
  critical: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
  warning: { icon: AlertCircle, color: "text-accent", bg: "bg-accent/10 border-accent/20" },
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
};

const Insights = () => {
  const [filter, setFilter] = useState<"all" | Severity>("all");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const filtered = useMemo(
    () => filter === "all" ? mockInsights : mockInsights.filter((i) => i.severity === filter),
    [filter]
  );

  const handleAck = (id: string) => {
    setAcknowledged((prev) => new Set(prev).add(id));
  };

  const handleTelegram = () => {
    toast.success("Sent to Telegram channel");
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold">AI Insights</h1>
            <p className="text-xs text-muted-foreground mt-0.5">AI-generated alerts and recommendations</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 h-8"
            onClick={() => navigate("/settings#notifications")}
          >
            <Bell className="h-3.5 w-3.5" /> Notification Settings
          </Button>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="critical" className="text-xs">Critical</TabsTrigger>
            <TabsTrigger value="warning" className="text-xs">Warning</TabsTrigger>
            <TabsTrigger value="info" className="text-xs">Info</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          {filtered.map((insight) => {
            const cfg = severityConfig[insight.severity];
            const Icon = cfg.icon;
            const isAcked = acknowledged.has(insight.id);

            return (
              <Card
                key={insight.id}
                className={`p-4 border ${isAcked ? "opacity-60" : ""} ${cfg.bg}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={`text-[10px] capitalize ${cfg.color}`}>
                        {insight.severity}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {insight.department}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground ml-auto">{insight.timestamp}</span>
                    </div>

                    <h3 className="text-sm font-medium">{insight.headline}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{insight.detail}</p>

                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 gap-1"
                        disabled={isAcked}
                        onClick={() => handleAck(insight.id)}
                      >
                        {isAcked ? <Check className="h-3 w-3" /> : null}
                        {isAcked ? "Acknowledged" : "Acknowledge"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 gap-1"
                        onClick={handleTelegram}
                      >
                        <Send className="h-3 w-3" /> Send via Telegram
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};

export default Insights;
