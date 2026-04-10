import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload as UploadIcon, FileSpreadsheet, AlertTriangle, CheckCircle2, Bot, ChevronDown, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { mockVaultFiles, type VaultFile } from "@/lib/mock-data";

function AnomalyAlert({ file }: { file: VaultFile }) {
  if (file.anomalies.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-2"
    >
      {file.anomalies.map((a, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 p-3 rounded-md text-xs ${
            a.severity === "critical"
              ? "bg-destructive/5 border border-destructive/20"
              : "bg-accent/5 border border-accent/20"
          }`}
        >
          <Bot className={`h-4 w-4 shrink-0 mt-0.5 ${
            a.severity === "critical" ? "text-destructive" : "text-accent"
          }`} />
          <div>
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              Profix AI — Row {a.row}, field "{a.field}"
              <Badge variant={a.severity === "critical" ? "destructive" : "secondary"} className="text-[9px]">
                {a.severity}
              </Badge>
            </p>
            <p className="text-muted-foreground mt-0.5">{a.message}</p>
            <p className="text-primary mt-1 font-medium cursor-pointer hover:underline">
              Review in file →
            </p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function FileRow({ file }: { file: VaultFile }) {
  const [expanded, setExpanded] = useState(file.anomalies.length > 0);

  return (
    <div className="border-b last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-center gap-4 py-3 px-4 hover:bg-muted/20 transition-colors"
      >
        <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{file.name}</span>
            <Badge variant="outline" className="text-[9px] shrink-0">{file.type.toUpperCase()}</Badge>
            {file.anomalies.length > 0 && (
              <Badge variant="destructive" className="text-[9px] shrink-0">
                <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                {file.anomalies.length} anomal{file.anomalies.length > 1 ? "ies" : "y"}
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">{file.period} · {file.rows} rows · Uploaded {file.uploadedAt}</p>
        </div>
        <div className="flex items-center gap-2">
          {file.status === "processed" && <CheckCircle2 className="h-4 w-4 text-positive" />}
          {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-3">
          <AnomalyAlert file={file} />
        </div>
      )}
    </div>
  );
}

export default function DataVault() {
  const [tab, setTab] = useState<"all" | "pl" | "utility">("all");
  const [dragging, setDragging] = useState(false);
  const navigate = useNavigate();

  const filteredFiles = tab === "all"
    ? mockVaultFiles
    : mockVaultFiles.filter((f) => f.type === tab);

  const totalAnomalies = mockVaultFiles.reduce((s, f) => s + f.anomalies.length, 0);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Data Vault</h1>
          <p className="text-sm text-muted-foreground">
            Source data for audit. Every number in the platform traces back here.
          </p>
        </div>

        {/* Upload zone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragging ? "border-primary bg-primary/5" : "border-primary/30"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UploadIcon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium">Drop P&L or Utilities files here</p>
            <p className="text-xs text-muted-foreground">.xlsx, .xls, .csv — max 10MB</p>
            <Button variant="outline" size="sm" className="mt-1">
              <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Browse files
            </Button>
          </div>
        </motion.div>

        {/* File list */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1">
              {(["all", "pl", "utility"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                    tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t === "all" ? "All Files" : t === "pl" ? "P&L" : "Utilities"}
                </button>
              ))}
            </div>
            {totalAnomalies > 0 && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {totalAnomalies} anomal{totalAnomalies > 1 ? "ies" : "y"} detected
              </span>
            )}
          </div>

          {filteredFiles.length === 0 ? (
            <EmptyState
              message="No files uploaded yet. Upload your first P&L file to get started."
              actionLabel="Upload Data"
              onAction={() => {}}
            />
          ) : (
            <div className="bg-card rounded-lg border">
              {filteredFiles.map((f) => (
                <FileRow key={f.id} file={f} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}
