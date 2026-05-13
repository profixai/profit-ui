import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import type { DotProps } from "recharts";

interface MarginTrendChartProps {
  data: { month: string; gop_margin_pct: number }[];
  target?: number;
  active: boolean;
  onClickPoint: (month: string) => void;
}

export const MarginTrendChart = ({ data, target = 25, active, onClickPoint }: MarginTrendChartProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.12, duration: 0.3 }}
    className={`bg-card rounded-lg border p-5 transition-all ${active ? "ring-1 ring-primary/20 shadow-sm" : ""}`}
  >
    <div className="flex items-baseline justify-between mb-5">
      <h2 className="text-sm font-semibold text-foreground">GOP Margin</h2>
      <span className="text-[11px] text-muted-foreground font-mono-data">Target {target}%</span>
    </div>
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid vertical={false} stroke="hsl(220, 12%, 91%)" strokeDasharray="0" />
        <XAxis
          dataKey="month"
          tickFormatter={(v) => v.split("-")[1]}
          tick={{ fontSize: 10, fill: "hsl(220, 8%, 52%)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[20, 55]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 10, fill: "hsl(220, 8%, 52%)" }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(1)}%`, "GOP Margin"]}
          labelFormatter={(label) => label}
          contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(220, 12%, 91%)", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
        />
        <ReferenceLine
          y={target}
          stroke="hsl(37, 78%, 56%)"
          strokeDasharray="4 4"
          strokeWidth={1}
        />
        <Line
          type="monotone"
          dataKey="gop_margin_pct"
          stroke="hsl(218, 47%, 20%)"
          strokeWidth={2}
          dot={(props: DotProps & { payload?: { gop_margin_pct: number; month: string } }) => {
            const { cx, cy, payload } = props;
            const belowTarget = (payload?.gop_margin_pct ?? 0) < target;
            return (
              <circle
                cx={cx}
                cy={cy}
                r={3}
                fill={belowTarget ? "hsl(0, 60%, 50%)" : "hsl(218, 47%, 20%)"}
                stroke="white"
                strokeWidth={1.5}
                className="cursor-pointer"
                onClick={() => payload?.month && onClickPoint(payload.month)}
              />
            );
          }}
          activeDot={{
            r: 5,
            stroke: "hsl(218, 47%, 20%)",
            strokeWidth: 2,
            fill: "white",
            onClick: (props: DotProps & { payload?: { month?: string } }) => {
              if (props?.payload?.month) onClickPoint(props.payload.month);
            },
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  </motion.div>
);
