import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { DeltaBadge } from "./DeltaBadge";

const DEPT_COLORS = [
  "hsl(189, 75%, 21%)",
  "hsl(152, 63%, 29%)",
  "hsl(37, 78%, 56%)",
  "hsl(4, 70%, 46%)",
  "hsl(0, 0%, 42%)",
  "hsl(217, 91%, 60%)",
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
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.25 }}
    className={`bg-card rounded-lg border p-5 transition-shadow ${active ? "ring-2 ring-primary/30" : ""}`}
  >
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Donut */}
      <div className="lg:col-span-2">
        <h2 className="text-sm font-semibold mb-3">Cost by Department</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={departments}
              dataKey="total"
              nameKey="department"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              onClick={(_, index) => onClickSegment(departments[index].department)}
              className="cursor-pointer"
            >
              {departments.map((_, i) => (
                <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-1 mt-2">
          {departments.map((d, i) => (
            <button
              key={d.department}
              onClick={() => onClickSegment(d.department)}
              className="flex items-center justify-between text-xs w-full hover:bg-muted/50 rounded px-1 py-0.5 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                {d.department}
              </span>
              <span className="font-mono-data text-muted-foreground">{d.pct}%</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cost Drivers Table */}
      <div className="lg:col-span-3">
        <h2 className="text-sm font-semibold mb-3">Top Cost Drivers</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">Account</th>
              <th className="text-left py-2 font-medium">Department</th>
              <th className="text-right py-2 font-medium">Amount</th>
              <th className="text-right py-2 font-medium">Share</th>
              <th className="text-right py-2 font-medium">Δ Prior</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr
                key={d.rank}
                onClick={() => onClickRow(d.account_name)}
                className={`border-b last:border-0 cursor-pointer transition-colors ${
                  d.delta_pct > 30 ? "bg-accent/10" : "hover:bg-muted/30"
                }`}
              >
                <td className="py-2.5 font-medium">{d.account_name}</td>
                <td className="py-2.5 text-muted-foreground">{d.department}</td>
                <td className="py-2.5 text-right font-mono-data">{formatCurrency(d.amount)}</td>
                <td className="py-2.5 text-right font-mono-data">{d.pct_of_total_cost.toFixed(1)}%</td>
                <td className="py-2.5 text-right">
                  <span className="inline-flex items-center gap-1">
                    {d.delta_pct > 30 && <AlertTriangle className="h-3 w-3 text-accent" />}
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
