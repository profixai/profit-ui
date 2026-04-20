import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ThisMonthMetrics } from "@/lib/mock-data";

const CURRENCY_SYMBOL: Record<ThisMonthMetrics["currency"], string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};

interface Props {
  metrics: ThisMonthMetrics;
}

export function ThisMonthMetricsCard({ metrics }: Props) {
  const symbol = CURRENCY_SYMBOL[metrics.currency];

  const rows: Array<{ label: string; value: string }> = [
    { label: "Invoices Processed", value: metrics.invoicesProcessed.toLocaleString() },
    { label: "Avg Approval Time", value: `${metrics.avgApprovalTimeDays} days` },
    { label: "Total Spend", value: `${symbol}${metrics.totalSpend.toLocaleString("en-US")}` },
  ];

  return (
    <Card className="bg-muted/30 border-border/60 p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/60">
          <TrendingUp className="h-4 w-4 text-foreground/70" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold">This Month</h3>
          <p className="text-[11px] text-muted-foreground">Performance metrics</p>
        </div>
      </div>

      <dl className="flex flex-col gap-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <dt className="text-xs text-muted-foreground">{r.label}</dt>
            <dd className="font-mono-data text-sm font-semibold tabular-nums">{r.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
