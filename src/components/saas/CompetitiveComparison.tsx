import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Minus } from "lucide-react";

type Status = "win" | "lose" | "tie";

interface ComparisonRow {
  dimension: string;
  profix: { status: Status; detail: string };
  internalBuild: { status: Status; detail: string };
  genericTools: { status: Status; detail: string };
  enterpriseIncumbent: { status: Status; detail: string };
}

const rows: ComparisonRow[] = [
  {
    dimension: "Time to Value",
    profix: { status: "win", detail: "Weeks" },
    internalBuild: { status: "lose", detail: "6–12 months" },
    genericTools: { status: "tie", detail: "Weeks" },
    enterpriseIncumbent: { status: "lose", detail: "3–6 months" },
  },
  {
    dimension: "USALI Expertise",
    profix: { status: "win", detail: "Built-in" },
    internalBuild: { status: "lose", detail: "Must hire" },
    genericTools: { status: "lose", detail: "None" },
    enterpriseIncumbent: { status: "tie", detail: "Available" },
  },
  {
    dimension: "AI Insights",
    profix: { status: "win", detail: "Included" },
    internalBuild: { status: "lose", detail: "Build from scratch" },
    genericTools: { status: "lose", detail: "Generic" },
    enterpriseIncumbent: { status: "tie", detail: "Add-on module" },
  },
  {
    dimension: "Total Cost (Year 1)",
    profix: { status: "win", detail: "€1.8K–€5K" },
    internalBuild: { status: "lose", detail: "€80K–€200K" },
    genericTools: { status: "tie", detail: "€2K–€10K" },
    enterpriseIncumbent: { status: "lose", detail: "€50K–€150K" },
  },
  {
    dimension: "Data Portability",
    profix: { status: "win", detail: "Full export" },
    internalBuild: { status: "win", detail: "You own it" },
    genericTools: { status: "tie", detail: "CSV export" },
    enterpriseIncumbent: { status: "lose", detail: "Restricted" },
  },
  {
    dimension: "Governance & RBAC",
    profix: { status: "win", detail: "Built-in" },
    internalBuild: { status: "lose", detail: "DIY" },
    genericTools: { status: "lose", detail: "Basic" },
    enterpriseIncumbent: { status: "win", detail: "Mature" },
  },
];

const StatusIcon = ({ status }: { status: Status }) => {
  if (status === "win") return <Check className="h-3.5 w-3.5 text-positive" />;
  if (status === "lose") return <X className="h-3.5 w-3.5 text-destructive" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

export const CompetitiveComparison = () => (
  <Card className="overflow-hidden">
    <div className="p-4 border-b">
      <h2 className="text-sm font-semibold">Competitive Comparison</h2>
      <p className="text-[11px] text-muted-foreground mt-0.5">
        How Profix compares on the dimensions that matter for adoption.
      </p>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="text-left p-3 font-medium w-[140px]">Dimension</th>
            <th className="text-left p-3 font-medium">
              <Badge className="text-[9px] bg-primary text-primary-foreground">Profix</Badge>
            </th>
            <th className="text-left p-3 font-medium text-muted-foreground">Internal Build</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Generic Tools</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Enterprise Suite</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.dimension} className="border-b last:border-0">
              <td className="p-3 font-medium">{row.dimension}</td>
              {[row.profix, row.internalBuild, row.genericTools, row.enterpriseIncumbent].map((cell, i) => (
                <td key={i} className="p-3">
                  <div className="flex items-center gap-1.5">
                    <StatusIcon status={cell.status} />
                    <span>{cell.detail}</span>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);
