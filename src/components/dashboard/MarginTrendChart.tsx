import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

interface MarginTrendChartProps {
  data: { month: string; gop_margin_pct: number }[];
  target?: number;
  active: boolean;
  onClickPoint: (month: string) => void;
}

export const MarginTrendChart = ({ data, target = 25, active, onClickPoint }: MarginTrendChartProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15 }}
    className={`bg-card rounded-lg border p-5 transition-shadow ${active ? "ring-2 ring-primary/30" : ""}`}
  >
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-sm font-semibold">GOP Margin Trend</h2>
        <p className="text-xs text-muted-foreground">Monthly gross operating profit margin — click any point</p>
      </div>
      <span className="text-xs text-muted-foreground border rounded px-2 py-0.5">Target: {target}%</span>
    </div>
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 12%, 89%)" />
        <XAxis
          dataKey="month"
          tickFormatter={(v) => v.split("-")[1]}
          tick={{ fontSize: 11, fill: "hsl(0, 0%, 42%)" }}
        />
        <YAxis
          domain={[20, 55]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: "hsl(0, 0%, 42%)" }}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(1)}%`, "GOP Margin"]}
          labelFormatter={(label) => `Month: ${label}`}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <ReferenceLine
          y={target}
          stroke="hsl(37, 78%, 56%)"
          strokeDasharray="6 4"
          label={{ value: "Target", fontSize: 10, fill: "hsl(37, 78%, 56%)" }}
        />
        <Line
          type="monotone"
          dataKey="gop_margin_pct"
          stroke="hsl(189, 75%, 21%)"
          strokeWidth={2.5}
          dot={(props: any) => {
            const { cx, cy, payload } = props;
            const belowTarget = payload.gop_margin_pct < target;
            return (
              <circle
                cx={cx}
                cy={cy}
                r={4}
                fill={belowTarget ? "hsl(4, 70%, 46%)" : "hsl(189, 75%, 21%)"}
                stroke="none"
                className="cursor-pointer"
                onClick={() => onClickPoint(payload.month)}
              />
            );
          }}
          activeDot={{
            r: 6,
            onClick: (_: any, payload: any) => {
              if (payload?.payload?.month) onClickPoint(payload.payload.month);
            },
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  </motion.div>
);
