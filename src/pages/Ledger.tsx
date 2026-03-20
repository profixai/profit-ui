import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, ChevronDown, ChevronRight, FileSpreadsheet, Leaf, Droplets, Zap, ArrowDown } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AskProfixPanel } from "@/components/AskProfixPanel";
import { ExplainButton } from "@/components/ExplainButton";
import { Badge } from "@/components/ui/badge";
import { mockQuarterlyLedger, type QuarterData } from "@/lib/mock-data";

const formatCurrency = (v: number) => {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`;
  return `€${v}`;
};

const DeltaArrow = ({ value, suffix = "%" }: { value: number; suffix?: string }) => {
  if (value === 0) return <span className="text-xs text-muted-foreground">—</span>;
  const positive = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? "text-positive" : "text-destructive"}`}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? "+" : ""}{value.toFixed(1)}{suffix}
    </span>
  );
};

function QuarterCard({ data, prevData, index }: { data: QuarterData; prevData?: QuarterData; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      {/* Delta bridge between quarters */}
      {prevData && data.deltas.gopMargin !== 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
          className="flex items-center gap-2 ml-6 mb-2"
        >
          <div className="w-0.5 h-6 bg-border" />
          <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border ${
            data.deltas.energyCost < 0 ? "bg-positive/5 border-positive/20 text-positive" : "bg-accent/5 border-accent/20 text-accent"
          }`}>
            <ArrowDown className="h-3 w-3" />
            <span>
              Energy cost {data.deltas.energyCost > 0 ? "+" : ""}{data.deltas.energyCost.toFixed(1)}%
              {" · "}
              Carbon {data.deltas.carbonIntensity > 0 ? "+" : ""}{data.deltas.carbonIntensity.toFixed(1)}%
              {data.actionsDeployed.length > 0 && (
                <span className="text-muted-foreground"> — Validated by {data.quarter} upload</span>
              )}
            </span>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex gap-4"
      >
        {/* Timeline dot */}
        <div className="flex flex-col items-center pt-5">
          <div className="h-3 w-3 rounded-full bg-primary border-2 border-primary-foreground shadow-sm" />
          {index < mockQuarterlyLedger.length - 1 && (
            <div className="w-0.5 flex-1 bg-border mt-1" />
          )}
        </div>

        {/* Card */}
        <div className="flex-1 pb-6">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-left bg-card rounded-lg border hover:border-primary/30 transition-colors p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold">{data.quarter}</h3>
                <p className="text-xs text-muted-foreground">{data.period}</p>
              </div>
              <div className="flex items-center gap-2">
                {data.actionsDeployed.length > 0 && (
                  <Badge variant="outline" className="text-[10px] border-positive/30 text-positive">
                    {data.actionsDeployed.length} action{data.actionsDeployed.length > 1 ? "s" : ""} deployed
                  </Badge>
                )}
                {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            </div>

            {/* Dual view: Financial + Impact */}
            <div className="grid grid-cols-2 gap-4">
              {/* Financial Materiality */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Financial Result</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono-data">{data.gopMarginPct}%</span>
                  <span className="text-xs text-muted-foreground">GOP Margin</span>
                  {data.deltas.gopMargin !== 0 && <DeltaArrow value={data.deltas.gopMargin} suffix=" pts" />}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Revenue: <span className="font-mono-data text-foreground">{formatCurrency(data.revenue)}</span></span>
                  <span>Utilities: <span className="font-mono-data text-foreground">{formatCurrency(data.utilityCost)}</span></span>
                </div>
              </div>

              {/* Impact Materiality */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Impact Result</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Leaf className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-bold font-mono-data">{data.carbonIntensity}</span>
                    <span className="text-[10px] text-muted-foreground">kgCO₂e</span>
                    {data.deltas.carbonIntensity !== 0 && <DeltaArrow value={data.deltas.carbonIntensity} />}
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-bold font-mono-data">{data.waterIntensity}</span>
                    <span className="text-[10px] text-muted-foreground">L/guest</span>
                    {data.deltas.waterIntensity !== 0 && <DeltaArrow value={-data.deltas.waterIntensity} />}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  <span className="font-mono-data text-foreground">{data.energyIntensity}</span> kWh/room
                </div>
              </div>
            </div>

            {/* Actions deployed */}
            {data.actionsDeployed.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Actions Logged</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.actionsDeployed.map((a) => (
                    <span key={a} className="text-[11px] bg-primary/5 text-primary px-2 py-0.5 rounded">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </button>

          {/* Expanded: Source files */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 bg-muted/30 rounded-lg border border-dashed p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Source Files (Audit Trail)</p>
                  {data.sourceFiles.map((f) => (
                    <div key={f.name} className="flex items-center gap-2 text-xs">
                      <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{f.name}</span>
                      <Badge variant="secondary" className="text-[9px]">{f.type.toUpperCase()}</Badge>
                      <span className="text-muted-foreground ml-auto">Uploaded {f.uploadedAt}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default function Ledger() {
  const [askOpen, setAskOpen] = useState(false);

  // Reverse to show latest first
  const quarters = [...mockQuarterlyLedger].reverse();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">The Ledger</h1>
            <p className="text-sm text-muted-foreground">
              Quarter-over-quarter financial and ESG performance with full traceability
            </p>
          </div>
          <ExplainButton onClick={() => setAskOpen(true)} />
        </div>

        <div className="space-y-0">
          {quarters.map((q, i) => (
            <QuarterCard
              key={q.quarter}
              data={q}
              prevData={i > 0 ? quarters[i - 1] : undefined}
              index={i}
            />
          ))}
        </div>
      </div>

      <AskProfixPanel
        externalOpen={askOpen}
        onClose={() => setAskOpen(false)}
        prefillQuestion="Explain the quarter-over-quarter trend in our ledger — what drove the biggest changes?"
        contextLabel="Ledger — Timeline"
      />
    </AppShell>
  );
}
