import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ConfidencePill } from "@/components/invoices/ConfidencePill";
import type { InvoiceJob } from "@/contracts";

interface Props {
  job: InvoiceJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b last:border-0">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-sm font-mono-data text-right break-all">{value ?? "—"}</span>
    </div>
  );
}

function fmtAmount(v: number | null, currency: string | null) {
  if (v == null) return "—";
  try {
    return new Intl.NumberFormat("en-EU", { style: "currency", currency: currency || "EUR" }).format(v);
  } catch {
    return `${currency ?? "EUR"} ${v.toFixed(2)}`;
  }
}

export function InvoiceDetailDrawer({ job, open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Invoice details
            {job?.extractor && (
              <Badge variant="outline" className="text-[10px] font-mono-data">
                Extracted by: {job.extractor}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Job <span className="font-mono-data">{job?.job_id}</span>
          </SheetDescription>
        </SheetHeader>

        {job && (
          <div className="mt-4">
            <Row label="Job ID" value={job.job_id} />
            <Row label="Data Vault Key" value={job.data_vault_key ?? "—"} />
            <Row label="Invoice #" value={job.invoice_number ?? "—"} />
            <Row label="Vendor ID" value={job.vendor_id ?? "—"} />
            <Row label="Vendor Name" value={job.vendor_name ?? "—"} />
            <Row label="Invoice Date" value={job.invoice_date ?? "—"} />
            <Row label="Currency" value={job.currency ?? "—"} />
            <Row label="Total Amount" value={fmtAmount(job.total_amount, job.currency)} />
            <Row
              label="Confidence"
              value={
                job.confidence_score != null ? (
                  <ConfidencePill value={Math.round(job.confidence_score * 100)} />
                ) : (
                  "—"
                )
              }
            />
            <Row label="Extractor" value={job.extractor ?? "—"} />
            <Row label="Lines" value={job.lines_count} />
            <Row label="S3 Raw Key" value={<code className="text-[11px]">{job.s3_raw_key}</code>} />
            <Row
              label="S3 Processed Key"
              value={job.s3_processed_key ? <code className="text-[11px]">{job.s3_processed_key}</code> : "—"}
            />
            <Row label="Status" value={job.status} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
