import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Map, Download } from "lucide-react";

const mockLevers = [
  { action: "Renegotiate electricity contract", category: "Utilities", current: 11200, saving: 1900, saving_pct: 17, co2: 420, payback: 0, effort: "Low", priority: 1 },
  { action: "Optimize F&B portion sizes", category: "Food & Beverage", current: 21000, saving: 2100, saving_pct: 10, co2: 85, payback: 1, effort: "Medium", priority: 2 },
  { action: "Implement energy-saving HVAC schedule", category: "Utilities", current: 8500, saving: 1700, saving_pct: 20, co2: 380, payback: 6, effort: "Medium", priority: 3 },
  { action: "Cross-train housekeeping staff", category: "Rooms", current: 38000, saving: 3200, saving_pct: 8.4, co2: 0, payback: 2, effort: "High", priority: 4 },
  { action: "Switch to LED lighting throughout", category: "Utilities", current: 3200, saving: 960, saving_pct: 30, co2: 210, payback: 8, effort: "Low", priority: 5 },
];

const formatCurrency = (v: number) => `€${v.toLocaleString()}`;

const effortColor: Record<string, string> = {
  Low: "bg-positive/10 text-positive",
  Medium: "bg-accent/15 text-accent",
  High: "bg-destructive/10 text-destructive",
};

const Roadmap = () => {
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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1.5" /> Download CSV
            </Button>
            <Button size="sm">Generate Roadmap</Button>
          </div>
        </div>

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
                  <td className="py-3 px-4 text-right font-mono-data">{l.co2}</td>
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

        <div className="mt-4 bg-card rounded-lg border p-4 flex flex-wrap gap-6">
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
      </div>
    </AppShell>
  );
};

export default Roadmap;
