import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  TrendingUp, TrendingDown, ChevronDown, ChevronRight,
  AlertTriangle, Download, X,
} from "lucide-react";

// ─── Mock USALI Data ──────────────────────────────────────────
const kpiData = [
  { label: "Total Revenue", value: 298900, budget: 285000, format: "currency" },
  { label: "GOP", value: 128400, budget: 120000, format: "currency" },
  { label: "NOI / EBITDA", value: 94200, budget: 90000, format: "currency" },
  { label: "RevPAR", value: 142, budget: 135, format: "currency" },
  { label: "OCC%", value: 74, budget: 72, format: "pct" },
  { label: "ADR", value: 192, budget: 188, format: "currency" },
  { label: "F&B Cost %", value: 33.8, budget: 30, format: "pct" },
  { label: "Flow-Through", value: 62, budget: 65, format: "pct" },
];

interface PLRow {
  id: string;
  label: string;
  actual: number;
  budget: number;
  sparkline: number[];
  children?: PLRow[];
  isSummary?: boolean;
}

const plRows: PLRow[] = [
  {
    id: "rooms-rev", label: "Rooms Revenue", actual: 198500, budget: 190000,
    sparkline: [175000, 180000, 195000, 210000, 200000, 198500],
    children: [
      { id: "rooms-occ", label: "Transient", actual: 142000, budget: 136000, sparkline: [125000, 130000, 140000, 150000, 142000, 142000] },
      { id: "rooms-grp", label: "Group & Contract", actual: 56500, budget: 54000, sparkline: [50000, 50000, 55000, 60000, 58000, 56500] },
    ],
  },
  {
    id: "fb-rev", label: "F&B Revenue", actual: 78400, budget: 75000,
    sparkline: [65000, 68000, 72000, 80000, 76000, 78400],
    children: [
      { id: "fb-rest", label: "Restaurant", actual: 48200, budget: 46000, sparkline: [40000, 42000, 44000, 50000, 47000, 48200] },
      { id: "fb-bar", label: "Bar & Lounge", actual: 18200, budget: 17000, sparkline: [15000, 15500, 16000, 18000, 17500, 18200] },
      { id: "fb-banq", label: "Banquets & Events", actual: 12000, budget: 12000, sparkline: [10000, 10500, 12000, 12000, 11500, 12000] },
    ],
  },
  {
    id: "other-rev", label: "Other Revenue", actual: 22000, budget: 20000,
    sparkline: [18000, 19000, 20000, 22000, 21000, 22000],
  },
  {
    id: "total-rev", label: "Total Revenue", actual: 298900, budget: 285000,
    sparkline: [258000, 267000, 287000, 312000, 297000, 298900], isSummary: true,
  },
  {
    id: "rooms-exp", label: "Rooms Expense", actual: 48200, budget: 46000,
    sparkline: [44000, 45000, 46000, 50000, 48000, 48200],
    children: [
      { id: "rooms-labor", label: "Labor", actual: 38000, budget: 36000, sparkline: [34000, 35000, 36000, 40000, 38000, 38000] },
      { id: "rooms-other", label: "Other Expenses", actual: 10200, budget: 10000, sparkline: [10000, 10000, 10000, 10000, 10000, 10200] },
    ],
  },
  {
    id: "fb-exp", label: "F&B Expense", actual: 43000, budget: 38000,
    sparkline: [35000, 36000, 38000, 44000, 42000, 43000],
    children: [
      { id: "fb-cos", label: "Cost of Sales", actual: 21000, budget: 18000, sparkline: [17000, 17500, 18000, 22000, 20500, 21000] },
      { id: "fb-labor2", label: "Labor", actual: 22000, budget: 20000, sparkline: [18000, 18500, 20000, 22000, 21500, 22000] },
    ],
  },
  {
    id: "undist", label: "Undistributed Expenses", actual: 56400, budget: 54000,
    sparkline: [50000, 52000, 54000, 58000, 56000, 56400],
    children: [
      { id: "admin", label: "Administrative & General", actual: 22400, budget: 21000, sparkline: [20000, 21000, 21000, 23000, 22000, 22400] },
      { id: "sales", label: "Sales & Marketing", actual: 9800, budget: 9500, sparkline: [8500, 9000, 9500, 10000, 9800, 9800] },
      { id: "propops", label: "Property Operations", actual: 8600, budget: 8500, sparkline: [8000, 8200, 8500, 9000, 8700, 8600] },
      { id: "utilities", label: "Utilities", actual: 15600, budget: 15000, sparkline: [13500, 14000, 15000, 16000, 15500, 15600] },
    ],
  },
  {
    id: "gop", label: "Gross Operating Profit (GOP)", actual: 128400, budget: 120000,
    sparkline: [110000, 115000, 120000, 135000, 128000, 128400], isSummary: true,
  },
  {
    id: "fixed", label: "Fixed Charges", actual: 34200, budget: 30000,
    sparkline: [30000, 30000, 30000, 34000, 34000, 34200],
    children: [
      { id: "rent", label: "Rent / Lease", actual: 18000, budget: 18000, sparkline: [18000, 18000, 18000, 18000, 18000, 18000] },
      { id: "insurance", label: "Insurance", actual: 6200, budget: 6000, sparkline: [6000, 6000, 6000, 6200, 6200, 6200] },
      { id: "depreciation", label: "Depreciation", actual: 10000, budget: 6000, sparkline: [6000, 6000, 6000, 10000, 10000, 10000] },
    ],
  },
  {
    id: "noi", label: "NOI / EBITDA", actual: 94200, budget: 90000,
    sparkline: [80000, 85000, 90000, 101000, 94000, 94200], isSummary: true,
  },
];

const fbCostPct = 33.8;
const FB_THRESHOLD = 32;

const fmt = (v: number, f: string) => {
  if (f === "pct") return `${v}%`;
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`;
  return `€${v}`;
};

const MiniSparkline = ({ data }: { data: number[] }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 20;
  const w = 60;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline points={points} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
    </svg>
  );
};

const PLRowComponent = ({ row, depth = 0 }: { row: PLRow; depth?: number }) => {
  const [open, setOpen] = useState(false);
  const variance = row.actual - row.budget;
  const variancePct = row.budget ? ((variance / row.budget) * 100).toFixed(1) : "0.0";
  const isPositive = variance >= 0;

  return (
    <>
      <TableRow className={row.isSummary ? "bg-muted/50 font-semibold" : ""}>
        <TableCell style={{ paddingLeft: `${depth * 20 + 12}px` }} className="flex items-center gap-1">
          {row.children ? (
            <button onClick={() => setOpen(!open)} className="p-0.5 hover:bg-muted rounded">
              {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <span className="w-4" />
          )}
          <span className="text-xs">{row.label}</span>
        </TableCell>
        <TableCell className="text-right font-mono-data text-xs">€{row.actual.toLocaleString()}</TableCell>
        <TableCell className="text-right font-mono-data text-xs text-muted-foreground">€{row.budget.toLocaleString()}</TableCell>
        <TableCell className={`text-right font-mono-data text-xs ${isPositive ? "text-positive" : "text-destructive"}`}>
          {isPositive ? "+" : ""}€{variance.toLocaleString()}
        </TableCell>
        <TableCell className={`text-right font-mono-data text-xs ${isPositive ? "text-positive" : "text-destructive"}`}>
          {isPositive ? "+" : ""}{variancePct}%
        </TableCell>
        <TableCell className="text-center">
          <MiniSparkline data={row.sparkline} />
        </TableCell>
      </TableRow>
      {open && row.children?.map((child) => (
        <PLRowComponent key={child.id} row={child} depth={depth + 1} />
      ))}
    </>
  );
};

const ProfitLoss = () => {
  const [period, setPeriod] = useState("monthly");
  const [showBanner, setShowBanner] = useState(fbCostPct > FB_THRESHOLD);

  const exportCSV = () => {
    const headers = ["Line Item", "Actual", "Budget", "Variance €", "Variance %"];
    const flatten = (rows: PLRow[]): string[][] =>
      rows.flatMap((r) => {
        const v = r.actual - r.budget;
        const vp = r.budget ? ((v / r.budget) * 100).toFixed(1) : "0.0";
        const line = [r.label, r.actual.toString(), r.budget.toString(), v.toString(), `${vp}%`];
        return [line, ...(r.children ? flatten(r.children) : [])];
      });
    const csv = [headers, ...flatten(plRows)].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pl_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Sticky filter bar */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pb-3 pt-1 flex flex-wrap items-center gap-3 border-b">
          <Select defaultValue="le-grand">
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="le-grand">Le Grand Hôtel</SelectItem>
              <SelectItem value="riviera">Riviera Palace</SelectItem>
              <SelectItem value="alpine">Alpine Lodge</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="2024">
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>

          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList className="h-8">
              <TabsTrigger value="daily" className="text-xs px-3 h-6">Daily</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-3 h-6">Monthly</TabsTrigger>
              <TabsTrigger value="ytd" className="text-xs px-3 h-6">YTD</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select defaultValue="dec">
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => (
                <SelectItem key={m} value={m.toLowerCase()}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={exportCSV}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </div>

        {/* AI Insight banner */}
        {showBanner && (
          <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-xs text-foreground flex-1">
              <strong>F&B Cost %</strong> is at {fbCostPct}%, exceeding the {FB_THRESHOLD}% threshold. Review cost-of-sales and portion control.
            </p>
            <Button variant="outline" size="sm" className="h-7 text-xs">Review</Button>
            <button onClick={() => setShowBanner(false)} className="p-1 hover:bg-muted rounded">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        )}

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {kpiData.map((kpi) => {
            const delta = kpi.budget ? ((kpi.value - kpi.budget) / kpi.budget * 100).toFixed(1) : "0.0";
            const positive = kpi.value >= kpi.budget;
            // Invert color for cost metrics
            const isCost = kpi.label.includes("Cost");
            const isGood = isCost ? !positive : positive;

            return (
              <Card key={kpi.label} className="p-3 space-y-1">
                <p className="text-[10px] text-muted-foreground font-medium truncate">{kpi.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-semibold font-mono-data">{fmt(kpi.value, kpi.format)}</span>
                  {isGood ? (
                    <TrendingUp className="h-3 w-3 text-positive" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                </div>
                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${isGood ? "text-positive border-positive/30" : "text-destructive border-destructive/30"}`}>
                  {positive ? "+" : ""}{delta}% vs budget
                </Badge>
              </Card>
            );
          })}
        </div>

        {/* P&L Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-[240px]">Line Item</TableHead>
                <TableHead className="text-xs text-right w-[100px]">Actual</TableHead>
                <TableHead className="text-xs text-right w-[100px]">Budget</TableHead>
                <TableHead className="text-xs text-right w-[100px]">Var €</TableHead>
                <TableHead className="text-xs text-right w-[80px]">Var %</TableHead>
                <TableHead className="text-xs text-center w-[80px]">6-Mo Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plRows.map((row) => (
                <PLRowComponent key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppShell>
  );
};

export default ProfitLoss;
