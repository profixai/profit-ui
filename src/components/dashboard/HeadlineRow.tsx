import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface HeadlineRowProps {
  period: string;
  gop: string;
  marginPct: number;
  marginDelta: number;
  verdict: string;
}

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
    <div className="flex items-center gap-4 px-4 py-2.5 rounded-lg border border-border/50 bg-card/50">
      {/* Sentiment dot */}
      <div className={`w-2 h-2 rounded-full shrink-0 ${sentimentDot}`} />

      {/* Headline */}
      <p className="text-sm text-foreground leading-snug">
        <span className="font-medium text-muted-foreground">{period}</span>
        <span className="mx-2 text-border">·</span>
        <span className="font-semibold">GOP {gop}</span>
        <span className="mx-2 text-border">·</span>
        <span className="font-mono-data">
          Margin {marginPct}%
        </span>
        <span className={`ml-1.5 inline-flex items-center gap-0.5 font-mono-data ${sentimentColor}`}>
          <SentimentIcon className="w-3 h-3" />
          {Math.abs(marginDelta).toFixed(1)} pts
        </span>
        <span className="mx-2 text-border">·</span>
        <span className="text-muted-foreground italic">{verdict}</span>
      </p>
    </div>
  );
};
