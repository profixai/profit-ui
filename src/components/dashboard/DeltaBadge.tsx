import { TrendingUp, TrendingDown } from "lucide-react";

interface DeltaBadgeProps {
  value: number;
  suffix?: string;
}

export const DeltaBadge = ({ value, suffix = "%" }: DeltaBadgeProps) => {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${
        positive ? "bg-positive/10 text-positive" : "bg-destructive/10 text-destructive"
      }`}
    >
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? "+" : ""}{value.toFixed(1)}{suffix}
    </span>
  );
};
