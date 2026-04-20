import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/utils";
import type { ExpectedInvoice, ExpectedInvoiceStatus } from "@/lib/mock-data";

const CURRENCY_SYMBOL: Record<ExpectedInvoice["currency"], string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};

const STATUS_STYLES: Record<ExpectedInvoiceStatus, string> = {
  expected: "bg-muted text-muted-foreground border-border",
  overdue: "bg-destructive text-destructive-foreground border-destructive",
};

function formatAmount(v: number, currency: ExpectedInvoice["currency"]) {
  return `${CURRENCY_SYMBOL[currency]}${v.toLocaleString("en-US")}`;
}

interface Props {
  invoices: ExpectedInvoice[];
  onViewAll?: () => void;
}

export function ExpectedInvoicesCard({ invoices, onViewAll }: Props) {
  const navigate = useNavigate();
  const handleViewAll = onViewAll ?? (() => navigate("/data"));

  if (invoices.length === 0) {
    return (
      <Card className="p-4">
        <div className="mb-3">
          <h2 className="text-sm font-semibold">Expected Invoices</h2>
          <p className="text-[11px] text-muted-foreground">Based on recurring contracts</p>
        </div>
        <EmptyState
          title="No upcoming invoices"
          message="Recurring contracts haven't generated any expected invoices for this period."
        />
      </Card>
    );
  }

  return (
    <Card className="p-4 flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold">Expected Invoices</h2>
        <p className="text-[11px] text-muted-foreground">Based on recurring contracts</p>
      </div>

      <ul className="flex flex-col gap-2">
        {invoices.map((inv) => (
          <li
            key={inv.id}
            className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{inv.vendor}</p>
                <p className="font-mono-data text-[11px] text-muted-foreground">{inv.contractId}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  STATUS_STYLES[inv.status],
                )}
              >
                {inv.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-mono-data text-sm font-semibold">
                {formatAmount(inv.amount, inv.currency)}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {inv.dueDate}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <Button variant="outline" size="sm" className="mt-1 h-9 w-full" onClick={handleViewAll}>
        View All Contracts
      </Button>
    </Card>
  );
}
