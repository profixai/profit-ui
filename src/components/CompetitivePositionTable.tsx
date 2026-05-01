import { Card } from "@/components/ui/card";
import { Check, X, Minus } from "lucide-react";

interface Row {
  label: string;
  internal: string | "yes" | "no" | "partial";
  generic: string | "yes" | "no" | "partial";
  profix: string | "yes" | "no" | "partial";
}

const rows: Row[] = [
  { label: "Time to first report",   internal: "6–12 weeks",  generic: "2–4 weeks",  profix: "Days" },
  { label: "Cost of ownership",      internal: "High (build + maintain)", generic: "Medium (per-seat licenses)", profix: "Predictable, tier-based" },
  { label: "Governance readiness",   internal: "partial",     generic: "partial",    profix: "yes" },
];

const renderCell = (v: Row["internal"]) => {
  if (v === "yes")     return <span className="inline-flex items-center gap-1 text-positive text-xs"><Check className="h-3 w-3" /> Yes</span>;
  if (v === "no")      return <span className="inline-flex items-center gap-1 text-destructive text-xs"><X className="h-3 w-3" /> No</span>;
  if (v === "partial") return <span className="inline-flex items-center gap-1 text-accent-foreground text-xs"><Minus className="h-3 w-3" /> Partial</span>;
  return <span className="text-xs">{v}</span>;
};

/** Admin-only competitive narrative table. */
export const CompetitivePositionTable = () => (
  <Card className="p-4">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold">Competitive positioning</h2>
      <span className="text-[10px] text-muted-foreground italic">Internal narrative</span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-muted-foreground border-b">
            <th className="py-2 pr-3 font-medium"></th>
            <th className="py-2 px-3 font-medium">Internal build</th>
            <th className="py-2 px-3 font-medium">Generic tools</th>
            <th className="py-2 px-3 font-medium text-primary">Profix</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b last:border-b-0">
              <td className="py-3 pr-3 text-xs font-medium">{r.label}</td>
              <td className="py-3 px-3">{renderCell(r.internal)}</td>
              <td className="py-3 px-3">{renderCell(r.generic)}</td>
              <td className="py-3 px-3 bg-primary/5">{renderCell(r.profix)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);
