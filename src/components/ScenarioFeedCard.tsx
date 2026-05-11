import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ScenarioImageCard, Scenario as ImgScenario } from "@/components/ScenarioImageCard";
import { sendTelegramMessage, getTelegramConfig } from "@/services/telegram";
import type { Scenario } from "@/hooks/useScenarios";

interface Props {
  scenario: Scenario;
}

const departmentToImage = (dept: string): ImgScenario => {
  const d = dept.toLowerCase();
  if (d.includes("maint")) return "maintenance";
  if (d.includes("f&b")) return "f&b";
  if (d.includes("house")) return "housekeeping";
  if (d.includes("revenue")) return "revenue";
  if (d.includes("room")) return "housekeeping";
  return "finance";
};

export function ScenarioFeedCard({ scenario }: Props) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [sending, setSending] = useState(false);

  const handleAcknowledge = async () => {
    setSending(true);
    const config = getTelegramConfig();
    const message = `✅ *Scenario acknowledged*\n\n*${scenario.title}*\n📊 ${scenario.metric}: ${scenario.actual} (threshold: ${scenario.threshold})\n\n💡 ${scenario.recommendation}`;

    if (!config) {
      toast.success("Acknowledged. Configure Telegram in Settings to dispatch the alert.");
      setAcknowledged(true);
      setSending(false);
      return;
    }

    const ok = await sendTelegramMessage(message);
    if (ok) {
      toast.success(`Acknowledged & dispatched to chat ${config.chatId}`);
      setAcknowledged(true);
    } else {
      toast.error("Acknowledged locally — Telegram dispatch failed.");
      setAcknowledged(true);
    }
    setSending(false);
  };

  return (
    <Card className={`p-4 border border-primary/30 bg-primary/5 ${acknowledged ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
        <div className="flex-1 space-y-2">
          <ScenarioImageCard
            scenario={departmentToImage(scenario.department)}
            headline={scenario.title}
            subtext={scenario.department}
            size="sm"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px] capitalize text-primary">
              Scenario
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {scenario.department}
            </Badge>
          </div>
          <h3 className="text-sm font-medium">{scenario.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{scenario.narrative}</p>
          <p className="text-xs text-foreground/80 font-mono-data">
            {scenario.metric}: <span className="text-foreground">{scenario.actual}</span>{" "}
            <span className="text-muted-foreground">/ threshold {scenario.threshold}</span>
          </p>
          <p className="text-xs text-foreground/70 italic">💡 {scenario.recommendation}</p>

          <div className="flex gap-2 pt-1">
            <Button
              variant="default"
              size="sm"
              className="text-xs h-7 gap-1"
              disabled={acknowledged || sending}
              onClick={handleAcknowledge}
            >
              {acknowledged ? <Check className="h-3 w-3" /> : <Send className="h-3 w-3" />}
              {acknowledged ? "Acknowledged" : sending ? "Sending…" : "Acknowledge & move on"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
