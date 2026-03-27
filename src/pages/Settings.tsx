import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Send } from "lucide-react";

const Settings = () => {
  const location = useLocation();
  const telegramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.hash === "#telegram" && telegramRef.current) {
      telegramRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [location.hash]);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your property and account</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold">Property Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Property Name</Label>
              <Input defaultValue="Le Grand Hôtel" className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Property Code</Label>
              <Input defaultValue="PRX-1042" readOnly className="text-sm bg-muted" />
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-sm font-semibold">Targets</h2>
          <div className="space-y-1.5 max-w-xs">
            <Label className="text-xs">Target GOP Margin (%)</Label>
            <Input type="number" defaultValue="25" className="text-sm" />
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-sm font-semibold">Integrations</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {["PMS (Opera)", "POS (Micros)", "Accounting (Sage)"].map((sys) => (
              <div key={sys} className="border rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm">{sys}</span>
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded">Coming soon</span>
              </div>
            ))}

            <div
              id="telegram"
              ref={telegramRef}
              className="border rounded-lg p-3 flex items-center justify-between border-primary/30 bg-primary/5"
            >
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-sm font-medium">Telegram</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-positive" />
                    <span className="text-[10px] text-muted-foreground">Connected as @ProfixAI_bot</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-positive/10 text-positive px-2 py-0.5 rounded font-medium">Active</span>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default Settings;
