import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AskProfixPanel } from "@/components/AskProfixPanel";
import { Button } from "@/components/ui/button";
import { Map, Download, Sparkles, Loader2, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const mockLevers = [
  { action: "Renegotiate electricity contract", category: "Utilities", current: 11200, saving: 1900, saving_pct: 17, co2: 420, water: 0, esgImpact: 7, payback: 0, effort: "Low", priority: 1 },
  { action: "Optimize F&B portion sizes", category: "Food & Beverage", current: 21000, saving: 2100, saving_pct: 10, co2: 85, water: 0, esgImpact: 2, payback: 1, effort: "Medium", priority: 2 },
  { action: "Implement energy-saving HVAC schedule", category: "Utilities", current: 8500, saving: 1700, saving_pct: 20, co2: 380, water: 0, esgImpact: 8, payback: 6, effort: "Medium", priority: 3 },
  { action: "Cross-train housekeeping staff", category: "Rooms", current: 38000, saving: 3200, saving_pct: 8.4, co2: 0, water: 0, esgImpact: 0, payback: 2, effort: "High", priority: 4 },
  { action: "Switch to LED lighting throughout", category: "Utilities", current: 3200, saving: 960, saving_pct: 30, co2: 210, water: 0, esgImpact: 6, payback: 8, effort: "Low", priority: 5 },
  { action: "Install low-flow showerheads", category: "Rooms", current: 4800, saving: 720, saving_pct: 15, co2: 45, water: 18, esgImpact: 5, payback: 3, effort: "Low", priority: 6 },
];

const formatCurrency = (v: number) => `€${v.toLocaleString()}`;

const effortColor: Record<string, string> = {
  Low: "bg-positive/10 text-positive",
  Medium: "bg-accent/15 text-accent",
  High: "bg-destructive/10 text-destructive",
};

const esgImpactColor = (v: number) =>
  v >= 7 ? "bg-positive/15 text-positive" : v >= 4 ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground";

const Roadmap = () => {
  const [generated, setGenerated] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [askOpen, setAskOpen] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  const totalSaving = mockLevers.reduce((s, l) => s + l.saving, 0);
  const totalCO2 = mockLevers.reduce((s, l) => s + l.co2, 0);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" /> Savings Roadmap
            </h1>
            <p className="text-sm text-muted-foreground">AI-generated cost reduction actions</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAskOpen(true)}
              className="gap-1.5"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Explain this roadmap
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1.5" /> Download CSV
            </Button>
            <Button size="sm" onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1.5" /> Generate Roadmap
                </>
              )}
            </Button>
          </div>
        </div>

        {!generated && !generating && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-lg border border-dashed p-12 text-center"
          >
            <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-lg font-semibold">No roadmap yet</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Click "Generate Roadmap" to create AI-powered savings actions based on your uploaded data.
            </p>
            <Button onClick={handleGenerate}>
              <Sparkles className="h-4 w-4 mr-1.5" /> Generate Roadmap
            </Button>
          </motion.div>
        )}

        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-lg border p-12 text-center"
          >
            <Loader2 className="h-10 w-10 text-primary mx-auto mb-3 animate-spin" />
            <h2 className="text-lg font-semibold">Analysing your data…</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Profix is identifying savings levers and ESG opportunities.
            </p>
          </motion.div>
        )}

        {generated && !generating && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-card rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground bg-muted/30">
                    <th className="text-left py-3 px-4 font-medium">#</th>
                    <th className="text-left py-3 px-4 font-medium">Action</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-right py-3 px-4 font-medium">Current €/mo</th>
                    <th className="text-right py-3 px-4 font-medium">Saving €/mo</th>
                    <th className="text-right py-3 px-4 font-medium">Saving %</th>
                    <th className="text-right py-3 px-4 font-medium">CO₂ kg/mo</th>
                    <th className="text-right py-3 px-4 font-medium">Water m³/yr</th>
                    <th className="text-center py-3 px-4 font-medium">ESG Impact</th>
                    <th className="text-right py-3 px-4 font-medium">Payback</th>
                    <th className="text-center py-3 px-4 font-medium">Effort</th>
                  </tr>
                </thead>
                <tbody>
                  {mockLevers.map((l) => (
                    <tr key={l.priority} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-mono-data text-muted-foreground">{l.priority}</td>
                      <td className="py-3 px-4 font-medium">{l.action}</td>
                      <td className="py-3 px-4 text-muted-foreground">{l.category}</td>
                      <td className="py-3 px-4 text-right font-mono-data">{formatCurrency(l.current)}</td>
                      <td className="py-3 px-4 text-right font-mono-data text-positive">{formatCurrency(l.saving)}</td>
                      <td className="py-3 px-4 text-right font-mono-data">{l.saving_pct}%</td>
                      <td className="py-3 px-4 text-right font-mono-data">{l.co2 > 0 ? l.co2 : "—"}</td>
                      <td className="py-3 px-4 text-right font-mono-data">{l.water > 0 ? l.water : "—"}</td>
                      <td className="py-3 px-4 text-center">
                        {l.esgImpact > 0 ? (
                          <span className={`text-xs px-2 py-0.5 rounded-md font-medium font-mono-data ${esgImpactColor(l.esgImpact)}`}>
                            {l.esgImpact}/10
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-data">{l.payback}mo</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${effortColor[l.effort]}`}>
                          {l.effort}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-card rounded-lg border p-4 flex flex-wrap gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Total Monthly Saving</p>
                <p className="text-lg font-bold font-mono-data text-positive">{formatCurrency(totalSaving)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Annual Saving</p>
                <p className="text-lg font-bold font-mono-data text-positive">{formatCurrency(totalSaving * 12)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">CO₂ Reduction</p>
                <p className="text-lg font-bold font-mono-data">{totalCO2.toLocaleString()} kg/mo</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <AskProfixPanel
        externalOpen={askOpen}
        onClose={() => setAskOpen(false)}
        prefillQuestion="Summarise the top 3 actions by savings and by ESG impact for this property."
        contextLabel="Roadmap"
      />
    </AppShell>
  );
};

export default Roadmap;
