import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, AlertTriangle, XCircle, FileText, Download, Loader2 } from "lucide-react";
import { mockReportingReadiness } from "@/lib/mock-data";

const statusIcon = (status: string) => {
  if (status === "complete") return <CheckCircle2 className="h-4 w-4 text-positive" />;
  if (status === "partial") return <AlertTriangle className="h-4 w-4 text-accent" />;
  return <XCircle className="h-4 w-4 text-destructive" />;
};

const statusLabel = (status: string) => {
  if (status === "complete") return "Complete";
  if (status === "partial") return "Partial";
  return "Missing";
};

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    complete: "bg-positive/10 text-positive border-positive/20",
    partial: "bg-accent/10 text-accent border-accent/20",
    missing: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return styles[status] || "";
};

export default function Reporting() {
  const [standard, setStandard] = useState("csrd");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const complete = mockReportingReadiness.filter((d) => d.status === "complete").length;
  const partial = mockReportingReadiness.filter((d) => d.status === "partial").length;
  const missing = mockReportingReadiness.filter((d) => d.status === "missing").length;
  const readinessPct = Math.round(((complete + partial * 0.5) / mockReportingReadiness.length) * 100);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 3000);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Reporting — CSRD / ESRS</h1>
          <p className="text-sm text-muted-foreground">
            Generate audit-ready sustainability reports from your uploaded data
          </p>
        </div>

        {/* Standard selection */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Reporting Standard</CardTitle>
              <CardDescription className="text-xs">
                Select the framework for your sustainability disclosure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="space-y-1.5 flex-1 max-w-xs">
                  <Select value={standard} onValueChange={setStandard}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csrd">CSRD / ESRS (EU)</SelectItem>
                      <SelectItem value="gresb">GRESB</SelectItem>
                      <SelectItem value="ghg">GHG Protocol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-xs text-muted-foreground">
                  Reporting period: <span className="font-medium text-foreground">FY 2025</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Readiness overview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-4 gap-4"
        >
          <div className="bg-card rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Readiness</p>
            <p className="text-2xl font-bold font-mono-data mt-0.5">{readinessPct}%</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Complete</p>
            <p className="text-2xl font-bold font-mono-data text-positive mt-0.5">{complete}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Partial</p>
            <p className="text-2xl font-bold font-mono-data text-accent mt-0.5">{partial}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Missing</p>
            <p className="text-2xl font-bold font-mono-data text-destructive mt-0.5">{missing}</p>
          </div>
        </motion.div>

        {/* Data readiness checklist */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Data Readiness Checklist</CardTitle>
              <CardDescription className="text-xs">
                Each line item maps to an ESRS disclosure requirement
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {mockReportingReadiness.map((d) => (
                  <div key={d.id} className="flex items-start gap-3 py-3 px-5 hover:bg-muted/20 transition-colors">
                    {statusIcon(d.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{d.label}</span>
                        <Badge variant="outline" className="text-[9px] font-mono">{d.standard}</Badge>
                        <Badge className={`text-[9px] border ${statusBadge(d.status)}`}>
                          {statusLabel(d.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{d.detail}</p>
                      {d.coverage !== "—" && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">Coverage: {d.coverage}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generate */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardContent className="py-6 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Generate Audit-Ready Report</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {missing > 0
                    ? `${missing} data point${missing > 1 ? "s" : ""} missing — report will flag gaps for auditor review.`
                    : "All critical data points covered. Report will be complete."}
                </p>
              </div>
              <div className="flex gap-2">
                {generated && (
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1.5" /> Download PDF
                  </Button>
                )}
                <Button size="sm" onClick={handleGenerate} disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Generating…
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-1.5" /> Generate Report
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Generated preview */}
        {generated && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  CSRD/ESRS Report — Le Grand Hôtel — FY 2025
                </CardTitle>
                <CardDescription className="text-xs">
                  Generated {new Date().toLocaleDateString()}. All values trace to source files in the Data Vault.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">E1 — Climate Change</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-muted-foreground">Scope 1+2 Emissions</p>
                      <p className="font-mono-data font-bold text-base">142 tCO₂e</p>
                      <p className="text-muted-foreground">YoY: -12%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Carbon Intensity</p>
                      <p className="font-mono-data font-bold text-base">30 kgCO₂e/room</p>
                      <p className="text-muted-foreground">Benchmark: 35 (mid-scale)</p>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">E3 — Water & Marine Resources</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-muted-foreground">Total Water Consumption</p>
                      <p className="font-mono-data font-bold text-base">8,240 m³</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Water Intensity</p>
                      <p className="font-mono-data font-bold text-base">380 L/guest-night</p>
                      <p className="text-muted-foreground">Frontrunner: 150 L</p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  ⚠ Gaps flagged: Scope 3 supply chain (S1/G1 social data not submitted). Auditor should request supplementary evidence.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
