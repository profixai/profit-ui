import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface HeadlineRowProps {
  period: string;
  gop: string;
  marginPct: number;
  marginDelta: number;
  verdict: string;
}

const hoverInsights = [
  { label: "Revenue vs Budget", value: "+3.1%", note: "Exceeded target by €47K" },
  { label: "Labor Cost Ratio", value: "31.2%", note: "Down 1.8 pts vs Q3" },
  { label: "RevPAR", value: "€142", note: "Best since Jun '24" },
  { label: "F&B Recovery", value: "+12%", note: "Banquet revenue rebounded" },
];

export const HeadlineRow = ({ period, gop, marginPct, marginDelta, verdict }: HeadlineRowProps) => {
  const sentiment = marginDelta > 2 ? "positive" : marginDelta < -2 ? "negative" : "neutral";

  const SentimentIcon = sentiment === "positive" ? TrendingUp : sentiment === "negative" ? TrendingDown : Minus;

  const sentimentColor =
    sentiment === "positive"
      ? "text-positive"
      : sentiment === "negative"
        ? "text-destructive"
        : "text-muted-foreground";

  const sentimentDot =
    sentiment === "positive"
      ? "bg-positive"
      : sentiment === "negative"
        ? "bg-destructive"
        : "bg-muted-foreground";

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-4 px-4 py-2.5 rounded-lg border border-border/50 bg-card/50 cursor-default transition-colors hover:bg-card/80">
          <div className={`w-2 h-2 rounded-full shrink-0 ${sentimentDot}`} />

          <p className="text-sm text-foreground leading-snug">
            <span className="font-medium text-muted-foreground">{period}</span>
            <span className="mx-2 text-border">·</span>
            <span className="font-semibold">GOP {gop}</span>
            <span className="mx-2 text-border">·</span>
            <span className="font-mono-data">Margin {marginPct}%</span>
            <span className={`ml-1.5 inline-flex items-center gap-0.5 font-mono-data ${sentimentColor}`}>
              <SentimentIcon className="w-3 h-3" />
              {Math.abs(marginDelta).toFixed(1)} pts
            </span>
            <span className="mx-2 text-border">·</span>
            <span className="text-muted-foreground italic">{verdict}</span>
          </p>
        </div>
      </HoverCardTrigger>

      <HoverCardContent align="start" className="w-80 p-0">
        <div className="px-3.5 py-2.5 border-b border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3 text-accent" />
            <span className="font-medium">Key drivers — {period}</span>
          </div>
        </div>
        <div className="divide-y divide-border/30">
          {hoverInsights.map((item) => (
            <div key={item.label} className="px-3.5 py-2 flex items-baseline justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-foreground">{item.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.note}</p>
              </div>
              <span className="text-xs font-mono-data text-foreground shrink-0">{item.value}</span>
            </div>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
