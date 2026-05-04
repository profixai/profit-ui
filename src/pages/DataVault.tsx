import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload as UploadIcon, FileText, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { ConfidencePill } from "@/components/invoices/ConfidencePill";
import { InvoiceDetailDrawer } from "@/components/InvoiceDetailDrawer";
import { uploadInvoice, getInvoiceJob, mockInvoiceJobs } from "@/services/api";
import { API_BASE } from "@/config/env";
import type { InvoiceJob } from "@/contracts";

type JobStatus = InvoiceJob["status"];

function statusBadge(status: JobStatus) {
  switch (status) {
    case "queued":
      return <Badge className="bg-warning/15 text-warning border-warning/30 border">Processing</Badge>;
    case "complete":
      return <Badge className="bg-positive/15 text-positive border-positive/30 border">Matched</Badge>;
    case "error":
      return <Badge className="bg-destructive/15 text-destructive border-destructive/30 border">Review needed</Badge>;
  }
}

function fmtAmount(v: number | null, currency: string | null) {
  if (v == null) return "—";
  try {
    return new Intl.NumberFormat("en-EU", { style: "currency", currency: currency || "EUR" }).format(v);
  } catch {
    return `${currency ?? "EUR"} ${v.toFixed(2)}`;
  }
}

export default function DataVault() {
  const [tab, setTab] = useState<"upload" | "invoices">("upload");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ name: string; size: number } | null>(null);
  const [jobs, setJobs] = useState<InvoiceJob[]>(() => (API_BASE ? [] : mockInvoiceJobs()));
  const [selected, setSelected] = useState<InvoiceJob | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pollJob = useCallback(async (jobId: string) => {
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const res = await getInvoiceJob(jobId);
      if (res.ok && res.data) {
        const job = res.data;
        setJobs((prev) => prev.map((j) => (j.job_id === jobId ? job : j)));
        if (job.status === "complete" || job.status === "error") return;
      }
    }
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are supported");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Maximum file size is 10 MB");
        return;
      }
      setPendingFile({ name: file.name, size: file.size });
      setUploading(true);

      const res = await uploadInvoice(file);
      setUploading(false);

      if (!res.ok || !res.data) {
        toast.error(res.error ?? "Upload failed");
        return;
      }

      const data = res.data;
      const pendingJob: InvoiceJob = {
        job_id: data.job_id,
        data_vault_key: data.data_vault_key,
        invoice_number: data.invoice_number,
        vendor_id: data.vendor_id,
        vendor_name: null,
        invoice_date: null,
        currency: "EUR",
        total_amount: null,
        confidence_score: null,
        extractor: null,
        lines_count: 0,
        s3_raw_key: data.s3_raw_key,
        s3_processed_key: null,
        status: (data.status as JobStatus) || "queued",
      };
      setJobs((prev) => [pendingJob, ...prev]);
      setPendingFile(null);
      setTab("invoices");

      if (API_BASE) {
        toast.success(`Invoice queued — Job #${data.job_id}`);
        pollJob(data.job_id);
      } else {
        toast.success("Invoice queued (demo mode)");
        // Simulate completion in demo mode
        setTimeout(() => {
          setJobs((prev) =>
            prev.map((j) =>
              j.job_id === data.job_id
                ? {
                    ...j,
                    status: "complete",
                    vendor_name: "Demo Vendor",
                    invoice_number: `INV-${data.job_id.slice(-4).toUpperCase()}`,
                    invoice_date: new Date().toISOString().slice(0, 10),
                    total_amount: 980.0,
                    confidence_score: 0.93,
                    extractor: "hybrid",
                    lines_count: 3,
                    s3_processed_key: `mock/${data.job_id}/processed.json`,
                  }
                : j,
            ),
          );
        }, 1500);
      }
    },
    [pollJob],
  );

  const openDetails = (job: InvoiceJob) => {
    setSelected(job);
    setDrawerOpen(true);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Data Vault</h1>
          <p className="text-sm text-muted-foreground">
            Source data for audit. Every number traces back here.
          </p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "upload" | "invoices")}>
          <TabsList>
            <TabsTrigger value="upload">Upload Invoice</TabsTrigger>
            <TabsTrigger value="invoices">
              Invoices
              {jobs.length > 0 && (
                <Badge variant="outline" className="ml-2 text-[10px]">
                  {jobs.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
                dragging ? "border-primary bg-primary/5" : "border-primary/30"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  ) : (
                    <UploadIcon className="h-6 w-6 text-primary" />
                  )}
                </div>
                <p className="text-sm font-medium">Drop an invoice PDF here</p>
                <p className="text-xs text-muted-foreground">PDF only · max 10 MB</p>

                <label>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                      e.target.value = "";
                    }}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <FileText className="h-4 w-4 mr-1.5" /> Browse files
                    </span>
                  </Button>
                </label>

                {pendingFile && (
                  <div className="mt-3 text-xs text-muted-foreground font-mono-data">
                    {pendingFile.name} · {(pendingFile.size / 1024).toFixed(1)} KB
                  </div>
                )}
                {!API_BASE && (
                  <Badge variant="outline" className="mt-2 text-[10px]">
                    Demo mode — no backend configured
                  </Badge>
                )}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="invoices" className="mt-4">
            {jobs.length === 0 ? (
              <EmptyState
                message="No invoices uploaded yet."
                actionLabel="Upload Invoice"
                onAction={() => setTab("upload")}
              />
            ) : (
              <div className="bg-card rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((j) => (
                      <TableRow key={j.job_id}>
                        <TableCell className="font-mono-data text-xs">
                          {j.invoice_number ?? <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-sm">{j.vendor_name ?? "—"}</TableCell>
                        <TableCell className="text-xs font-mono-data">{j.invoice_date ?? "—"}</TableCell>
                        <TableCell className="text-right font-mono-data text-sm">
                          {fmtAmount(j.total_amount, j.currency)}
                        </TableCell>
                        <TableCell>
                          {j.confidence_score != null ? (
                            <ConfidencePill value={Math.round(j.confidence_score * 100)} />
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{statusBadge(j.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openDetails(j)}>
                            <Eye className="h-3.5 w-3.5 mr-1" /> View details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <InvoiceDetailDrawer job={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
      </div>
    </AppShell>
  );
}
