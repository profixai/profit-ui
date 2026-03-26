import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface DeltaBadgeProps {
  value: number;
  suffix?: string;
}

export const DeltaBadge = ({ value, suffix = "%" }: DeltaBadgeProps) => {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
        positive ? "text-positive" : "text-destructive"
      }`}
    >
      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {positive ? "+" : ""}{value.toFixed(1)}{suffix}
    </span>
  );
};
