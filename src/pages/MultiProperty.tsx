import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const properties = ["Le Grand Hôtel", "Riviera Palace", "Alpine Lodge"];

interface PropertyKPI {
  property: string;
  revenue: number; revBudget: number;
  gop: number; gopBudget: number;
  noi: number; noiBudget: number;
  revpar: number; revparBudget: number;
  occ: number; occBudget: number;
  adr: number; adrBudget: number;
  fbCost: number; fbCostBudget: number;
  flow: number; flowBudget: number;
}

const mockPropertyKPIs: PropertyKPI[] = [
  { property: "Le Grand Hôtel", revenue: 298900, revBudget: 285000, gop: 128400, gopBudget: 120000, noi: 94200, noiBudget: 90000, revpar: 142, revparBudget: 135, occ: 74, occBudget: 72, adr: 192, adrBudget: 188, fbCost: 33.8, fbCostBudget: 30, flow: 62, flowBudget: 65 },
  { property: "Riviera Palace", revenue: 412000, revBudget: 400000, gop: 185400, gopBudget: 180000, noi: 142000, noiBudget: 138000, revpar: 198, revparBudget: 190, occ: 81, occBudget: 78, adr: 245, adrBudget: 244, fbCost: 28.5, fbCostBudget: 30, flow: 68, flowBudget: 65 },
  { property: "Alpine Lodge", revenue: 156000, revBudget: 170000, gop: 52000, gopBudget: 60000, noi: 31000, noiBudget: 38000, revpar: 88, revparBudget: 95, occ: 58, occBudget: 65, adr: 152, adrBudget: 146, fbCost: 35.2, fbCostBudget: 30, flow: 48, flowBudget: 55 },
];

const kpiLabels = [
  { key: "revenue", budgetKey: "revBudget", label: "Total Revenue", fmt: "€" },
  { key: "gop", budgetKey: "gopBudget", label: "GOP", fmt: "€" },
  { key: "noi", budgetKey: "noiBudget", label: "NOI / EBITDA", fmt: "€" },
  { key: "revpar", budgetKey: "revparBudget", label: "RevPAR", fmt: "€" },
  { key: "occ", budgetKey: "occBudget", label: "OCC%", fmt: "%" },
  { key: "adr", budgetKey: "adrBudget", label: "ADR", fmt: "€" },
  { key: "fbCost", budgetKey: "fbCostBudget", label: "F&B Cost %", fmt: "%" },
  { key: "flow", budgetKey: "flowBudget", label: "Flow-Through", fmt: "%" },
];

const revenueByDept = [
  { department: "Rooms", "Le Grand Hôtel": 198500, "Riviera Palace": 295000, "Alpine Lodge": 102000 },
  { department: "F&B", "Le Grand Hôtel": 78400, "Riviera Palace": 92000, "Alpine Lodge": 38000 },
  { department: "Other", "Le Grand Hôtel": 22000, "Riviera Palace": 25000, "Alpine Lodge": 16000 },
];

const anomalies = [
  { property: "Alpine Lodge", insight: "Revenue 8.2% below budget. OCC% dropped 7pts — seasonal underperformance or pricing issue." },
  { property: "Le Grand Hôtel", insight: "F&B Cost % at 33.8% exceeds 30% threshold. Review portion control and supplier costs." },
];

const MultiProperty = () => {
  const [group, setGroup] = useState("all");

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold">Portfolio View</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Cross-property performance comparison</p>
          </div>
          <Select value={group} onValueChange={setGroup}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="paris">Paris Portfolio</SelectItem>
              <SelectItem value="lyon">Lyon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Comparison Grid */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-[140px]">KPI</TableHead>
                {properties.map((p) => (
                  <TableHead key={p} className="text-xs text-center">{p}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {kpiLabels.map((kpi) => (
                <TableRow key={kpi.key}>
                  <TableCell className="text-xs font-medium">{kpi.label}</TableCell>
                  {mockPropertyKPIs.map((prop) => {
                    const val = (prop as any)[kpi.key] as number;
                    const budget = (prop as any)[kpi.budgetKey] as number;
                    const isCost = kpi.key === "fbCost";
                    const onBudget = isCost ? val <= budget : val >= budget;
                    return (
                      <TableCell
                        key={prop.property}
                        className={`text-xs text-center font-mono-data ${onBudget ? "bg-positive/10 text-positive" : "bg-destructive/10 text-destructive"}`}
                      >
                        {kpi.fmt === "€" && val >= 1000 ? `€${(val / 1000).toFixed(0)}K` : kpi.fmt === "€" ? `€${val}` : `${val}%`}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Stacked Bar Chart */}
        <Card className="p-4">
          <h2 className="text-sm font-medium mb-3">Revenue by Department</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueByDept}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="department" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `€${v.toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Le Grand Hôtel" stackId="a" fill="hsl(var(--primary))" />
              <Bar dataKey="Riviera Palace" stackId="a" fill="hsl(var(--accent))" />
              <Bar dataKey="Alpine Lodge" stackId="a" fill="hsl(var(--muted-foreground))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Anomaly Summary */}
        <Card className="p-4 space-y-3">
          <h2 className="text-sm font-medium">AI Anomaly Summary</h2>
          {anomalies.map((a, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-destructive/5 border border-destructive/15 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium">{a.property}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.insight}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </AppShell>
  );
};

export default MultiProperty;
