import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import {
  AlertTriangle, AlertCircle, Info, Check, Send, Bell,
} from "lucide-react";
import { toast } from "sonner";
import { useInsights } from "@/hooks/useInsights";
import { InsightCard } from "@/services/api";
import { sendTelegramMessage, formatInsightMessage, getTelegramConfig } from "@/services/telegram";
import { useProperty } from "@/contexts/PropertyContext";

type Severity = "critical" | "warning" | "info";

const severityConfig: Record<Severity, { icon: React.ElementType; color: string; bg: string }> = {
  critical: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
  warning: { icon: AlertCircle, color: "text-accent", bg: "bg-accent/10 border-accent/20" },
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
};

const Insights = () => {
  const [filter, setFilter] = useState<"all" | Severity>("all");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { propertyId } = useProperty();

  const { data: insights, loading, error } = useInsights(propertyId);

  const filtered = useMemo(
    () => {
      if (!insights) return [];
      return filter === "all" ? insights : insights.filter((i) => i.severity === filter);
    },
    [filter, insights]
  );

  const handleAck = (id: string) => {
    setAcknowledged((prev) => new Set(prev).add(id));
  };

  const handleSendTelegram = async (insight: InsightCard) => {
    const config = getTelegramConfig();
    if (!config) {
      toast.error("Telegram not configured. Go to Settings → Notifications to add your bot token.");
      return;
    }
    const message = formatInsightMessage(insight);
    const success = await sendTelegramMessage(message);
    if (success) {
      toast.success(`Alert dispatched to chat ${config.chatId}`);
    } else {
      toast.error("Send failed — check your bot token and chat ID in Settings.");
    }
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
          {loading ? (
            <LoadingState message="Loading insights…" rows={4} />
          ) : error ? (
            <ErrorState message={error} onRetry={() => window.location.reload()} />
          ) : !insights || insights.length === 0 ? (
            <EmptyState
              message="No insights yet. Upload data to generate AI-driven alerts."
              actionLabel="Upload Data"
              onAction={() => navigate("/data")}
            />
          ) : (
            filtered.map((insight) => {
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

                      <h3 className="text-sm font-medium">{insight.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{insight.context}</p>
                      {insight.recommendation && (
                        <p className="text-xs text-foreground/70 italic">💡 {insight.recommendation}</p>
                      )}

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
                          onClick={() => handleSendTelegram(insight)}
                        >
                          <Send className="h-3 w-3" /> Send via Telegram
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default Insights;
