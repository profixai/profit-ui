import type { InvoiceExtraction } from "@/lib/mock-invoices";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

interface Props {
  invoice: InvoiceExtraction;
}

export function InvoiceHeader({ invoice }: Props) {
  return (
    <header className="flex flex-col gap-3 border-b border-border bg-card/40 px-6 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-mono-data text-xs text-muted-foreground">
            {invoice.invoiceNumber.value}
          </span>
          <InvoiceStatusBadge status={invoice.status} />
          <span className="text-foreground/90">{invoice.vendor.value}</span>
        </div>
      </div>
      <div className="text-right text-xs text-muted-foreground">
        Due:{" "}
        <span className="font-mono-data text-foreground">{invoice.dueDate.value}</span>
      </div>
    </header>
  );
}
