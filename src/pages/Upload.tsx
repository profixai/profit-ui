import { useState } from "react";
import { motion } from "framer-motion";
import { Upload as UploadIcon, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

const UploadPage = () => {
  const [tab, setTab] = useState<"pl" | "utilities">("pl");
  const [dragging, setDragging] = useState(false);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold mb-1">Upload Data</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Upload your P&L or utilities data to generate insights
        </p>

        <div className="flex gap-1 mb-4">
          {[
            { key: "pl" as const, label: "P&L / Cost data" },
            { key: "utilities" as const, label: "Utilities & Consumption" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-sm px-4 py-2 rounded-md transition-colors ${
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragging ? "border-primary bg-primary/5" : "border-primary/30"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UploadIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Drag & drop your {tab === "pl" ? "P&L spreadsheet" : "utilities file"} here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports .xlsx, .xls, .csv — max 10MB
              </p>
            </div>
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-1.5" />
              Browse files
            </Button>
            <button className="text-xs text-primary hover:underline">
              Download template
            </button>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
};

export default UploadPage;
