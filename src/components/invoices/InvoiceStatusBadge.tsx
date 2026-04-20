import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/lib/mock-invoices";

const STYLES: Record<InvoiceStatus, { label: string; classes: string }> = {
  pending_approval: {
    label: "Pending Approval",
    classes: "bg-warning/15 text-warning border-warning/30",
  },
  approved: {
    label: "Approved",
    classes: "bg-positive/15 text-positive border-positive/30",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

interface Props {
  status: InvoiceStatus;
  className?: string;
}

export function InvoiceStatusBadge({ status, className }: Props) {
  const { label, classes } = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-tight",
        classes,
        className,
      )}
    >
      {label}
    </span>
  );
}
