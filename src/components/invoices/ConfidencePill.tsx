import { cn } from "@/lib/utils";

interface Props {
  value: number;
  className?: string;
}

function band(v: number) {
  if (v >= 95) return "bg-positive/20 text-positive border-positive/30";
  if (v >= 85) return "bg-positive/10 text-positive border-positive/20";
  if (v >= 70) return "bg-warning/15 text-warning border-warning/30";
  return "bg-destructive/15 text-destructive border-destructive/30";
}

export function ConfidencePill({ value, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-mono-data text-[11px] font-medium tabular-nums",
        band(value),
        className,
      )}
    >
      {value}%
    </span>
  );
}
