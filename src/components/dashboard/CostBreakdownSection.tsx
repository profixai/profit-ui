import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { DeltaBadge } from "./DeltaBadge";

const DEPT_COLORS = [
  "hsl(218, 47%, 20%)",
  "hsl(218, 35%, 36%)",
  "hsl(37, 78%, 56%)",
  "hsl(0, 60%, 50%)",
  "hsl(220, 8%, 62%)",
  "hsl(152, 44%, 38%)",
];

const formatCurrency = (v: number) => {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`;
  return `€${v}`;
};

interface CostBreakdownSectionProps {
  departments: { department: string; total: number; pct: number }[];
  drivers: { rank: number; account_name: string; department: string; amount: number; pct_of_total_cost: number; delta_pct: number }[];
  active: boolean;
  onClickSegment: (dept: string) => void;
  onClickRow: (account: string) => void;
}

export const CostBreakdownSection = ({ departments, drivers, active, onClickSegment, onClickRow }: CostBreakdownSectionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.3 }}
    className={`bg-card rounded-lg border p-5 transition-all ${active ? "ring-1 ring-primary/20 shadow-sm" : ""}`}
  >
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Donut */}
      <div className="lg:col-span-2">
        <h2 className="text-sm font-semibold mb-4">Cost by Department</h2>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={departments}
              dataKey="total"
              nameKey="department"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={0}
              onClick={(_, index) => onClickSegment(departments[index].department)}
              className="cursor-pointer"
            >
              {departments.map((_, i) => (
                <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(220, 12%, 91%)" }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-0.5 mt-3">
          {departments.map((d, i) => (
            <button
              key={d.department}
              onClick={() => onClickSegment(d.department)}
              className="flex items-center justify-between text-[11px] w-full hover:bg-muted/40 rounded px-1.5 py-1 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                <span className="text-foreground/70">{d.department}</span>
              </span>
              <span className="font-mono-data text-muted-foreground">{d.pct}%</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cost Drivers Table */}
      <div className="lg:col-span-3">
        <h2 className="text-sm font-semibold mb-4">Top Cost Drivers</h2>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">Account</th>
              <th className="text-left py-2 font-medium">Dept</th>
              <th className="text-right py-2 font-medium">Amount</th>
              <th className="text-right py-2 font-medium">Share</th>
              <th className="text-right py-2 font-medium">Δ</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr
                key={d.rank}
                onClick={() => onClickRow(d.account_name)}
                className="border-b last:border-0 cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <td className="py-2 font-medium text-foreground">{d.account_name}</td>
                <td className="py-2 text-muted-foreground">{d.department}</td>
                <td className="py-2 text-right font-mono-data">{formatCurrency(d.amount)}</td>
                <td className="py-2 text-right font-mono-data text-muted-foreground">{d.pct_of_total_cost.toFixed(1)}%</td>
                <td className="py-2 text-right">
                  <span className="inline-flex items-center gap-1">
                    {d.delta_pct > 30 && <AlertTriangle className="h-3 w-3 text-destructive" />}
                    <DeltaBadge value={d.delta_pct} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </motion.div>
);
