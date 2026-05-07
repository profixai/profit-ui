import { ReactNode, useMemo } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";

interface HoverInsightProps {
  kpiKey: string;
  currentValue: number;
  previousValue?: number;
  children: ReactNode;
}

const contextMap: Record<string, string> = {
  RevPAR: "Revenue per available room — key rate health signal",
  GOP: "Gross Operating Profit — bottom line efficiency",
  OccupancyRate: "Rooms sold vs available — demand indicator",
  ADR: "Average daily rate — pricing power signal",
  TRevPAR: "Total revenue per room — full property output",
};

const buildSeries = (current: number): { i: number; v: number }[] => {
  const seed = Math.abs(current) || 1;
  return Array.from({ length: 7 }, (_, i) => {
    const variance = (Math.sin(seed + i * 1.3) * 0.05 + 1) * current;
    return { i, v: variance };
  });
};

export const HoverInsight = ({
  kpiKey,
  currentValue,
  previousValue,
  children,
}: HoverInsightProps) => {
  const { role } = useAuth();
  const data = useMemo(() => buildSeries(currentValue), [currentValue]);

  if (role !== "manager" && role !== "direction") {
    return <>{children}</>;
  }

  const delta =
    previousValue !== undefined && previousValue !== 0
      ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100
      : null;

  const deltaLabel =
    delta === null
      ? null
      : Math.abs(delta) < 0.05
      ? { text: "→ No change", className: "text-muted-foreground" }
      : delta > 0
      ? { text: `▲ +${delta.toFixed(1)}%`, className: "text-positive" }
      : { text: `▼ ${delta.toFixed(1)}%`, className: "text-destructive" };

  const context = contextMap[kpiKey] ?? `Tap to drill into ${kpiKey} details`;

  return (
    <Tooltip delayDuration={400}>
      <TooltipTrigger asChild>
        <div>{children}</div>
      </TooltipTrigger>
      <TooltipContent side="top" className="w-[200px] p-2.5 space-y-2">
        <div style={{ width: 180, height: 32 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="#b8a9e8"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {deltaLabel && (
          <div className={`text-[11px] font-mono ${deltaLabel.className}`}>{deltaLabel.text}</div>
        )}
        <p className="text-[11px] text-muted-foreground leading-snug">{context}</p>
      </TooltipContent>
    </Tooltip>
  );
};
