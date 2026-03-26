import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

type SortKey = "month" | "revenue" | "costs" | "gop" | "gop_margin_pct";

interface MonthRow {
  month: string;
  revenue: number;
  costs: number;
  gop: number;
  gop_margin_pct: number;
}

const fmt = (v: number) => {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`;
  return `€${v}`;
};

export const MonthlyDetailTable = ({ data }: { data: MonthRow[] }) => {
  const [expanded, setExpanded] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("month");
  const [sortAsc, setSortAsc] = useState(true);

  const toggle = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
    return sortAsc ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="h-2.5 w-2.5 ml-0.5 opacity-30" />;
    return sortAsc ? <ChevronUp className="h-2.5 w-2.5 ml-0.5" /> : <ChevronDown className="h-2.5 w-2.5 ml-0.5" />;
  };

  const withDelta = sorted.map((row, i) => {
    const prev = i > 0 ? sorted[i - 1] : null;
    return {
      ...row,
      marginDelta: prev ? row.gop_margin_pct - prev.gop_margin_pct : 0,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.3 }}
      className="bg-card rounded-lg border"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold hover:bg-muted/30 transition-colors"
      >
        Monthly Detail
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="px-5 pb-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                {([
                  ["month", "Month"],
                  ["revenue", "Revenue"],
                  ["costs", "Costs"],
                  ["gop", "GOP"],
                  ["gop_margin_pct", "Margin"],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <TableHead
                    key={key}
                    onClick={() => toggle(key)}
                    className={`cursor-pointer select-none text-[11px] font-medium ${key !== "month" ? "text-right" : ""}`}
                  >
                    <span className="inline-flex items-center">
                      {label}
                      <SortIcon col={key} />
                    </span>
                  </TableHead>
                ))}
                <TableHead className="text-right text-[11px] font-medium">vs Prior</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withDelta.map((row) => (
                <TableRow key={row.month} className="hover:bg-muted/20">
                  <TableCell className="font-medium text-xs">{row.month}</TableCell>
                  <TableCell className="text-right font-mono-data text-xs">{fmt(row.revenue)}</TableCell>
                  <TableCell className="text-right font-mono-data text-xs">{fmt(row.costs)}</TableCell>
                  <TableCell className="text-right font-mono-data text-xs">{fmt(row.gop)}</TableCell>
                  <TableCell className="text-right font-mono-data text-xs">{row.gop_margin_pct.toFixed(1)}%</TableCell>
                  <TableCell className={`text-right font-mono-data text-xs ${row.marginDelta >= 0 ? "text-positive" : "text-destructive"}`}>
                    {row.marginDelta >= 0 ? "+" : ""}{row.marginDelta.toFixed(1)} pts
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
};
