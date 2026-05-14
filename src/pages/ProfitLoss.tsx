import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ChevronDown, ChevronRight, Download,
} from "lucide-react";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/states";
import { usePL } from "@/hooks/usePL";
import { PLRow as PLRowType } from "@/services/api";
import { useProperty } from "@/contexts/PropertyContext";

const COST_LABEL_RE = /cost|expense|payroll|f&b|food|beverage|opex/i;

const isCostRow = (row: PLRowType): boolean => {
  if (COST_LABEL_RE.test(row.label)) return true;
  return Boolean(row.children?.some(isCostRow));
};

const filterCostRows = (rows: PLRowType[]): PLRowType[] =>
  rows
    .filter(isCostRow)
    .map((r) => ({ ...r, children: r.children ? filterCostRows(r.children) : undefined }));

const PLRowComponent = ({ row, depth = 0 }: { row: PLRowType; depth?: number }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow className={row.isSummary ? "bg-muted/50 font-semibold" : ""}>
        <TableCell style={{ paddingLeft: `${depth * 20 + 12}px` }} className="flex items-center gap-1">
          {row.children && row.children.length > 0 ? (
            <button onClick={() => setOpen(!open)} className="p-0.5 hover:bg-muted rounded">
              {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <span className="w-4" />
          )}
          <span className="text-xs">{row.label}</span>
        </TableCell>
        <TableCell className="text-right font-mono-data text-xs">€{row.actual.toLocaleString()}</TableCell>
      </TableRow>
      {open && row.children?.map((child) => (
        <PLRowComponent key={child.id} row={child} depth={depth + 1} />
      ))}
    </>
  );
};

const ProfitLoss = () => {
  const { propertyId, period } = useProperty();
  const [month, setMonth] = useState(period.month);
  const navigate = useNavigate();

  // Simplified MVP: monthly cost-only P&L derived from uploaded invoices.
  const { data, loading, error } = usePL({
    property: propertyId,
    year: period.year,
    month,
    period: "monthly",
  });

  const costRows = data ? filterCostRows(data.rows) : [];

  const exportCSV = () => {
    if (!data) return;
    const headers = ["Line Item", "Actual"];
    const flatten = (rows: PLRowType[]): string[][] =>
      rows.flatMap((r) => {
        const line = [r.label, r.actual.toString()];
        return [line, ...(r.children ? flatten(r.children) : [])];
      });
    const csv = [headers, ...flatten(costRows)].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pl_costs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Monthly cost report</h1>
          <p className="text-sm text-muted-foreground">
            Costs derived from invoices uploaded to your Data Vault, classified per USALI.
          </p>
        </div>

        {/* Sticky filter bar — month + export */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pb-3 pt-1 flex flex-wrap items-center gap-3 border-b">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => (
                <SelectItem key={m} value={m.toLowerCase()}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={exportCSV} disabled={loading || !data}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Content states */}
        {loading ? (
          <LoadingState message="Loading cost report…" rows={8} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : !data || costRows.length === 0 ? (
          <EmptyState
            message="No invoice-derived costs yet. Upload invoices to build this month's report."
            actionLabel="Go to Data Vault"
            onAction={() => navigate("/data")}
          />
        ) : (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-[280px]">Cost line (USALI)</TableHead>
                  <TableHead className="text-xs text-right w-[140px]">Actual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costRows.map((row) => (
                  <PLRowComponent key={row.id} row={row} />
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* TODO: replace mock P&L with the real invoice-derived monthly cost
            aggregation once the backend endpoint lands. The hook below already
            consumes a typed APIResponse so this swap is local. */}
      </div>
    </AppShell>
  );
};

export default ProfitLoss;
