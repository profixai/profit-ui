import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
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
          <div className="grid gap-3 sm:grid-cols-3">
            {["PMS (Opera)", "POS (Micros)", "Accounting (Sage)"].map((sys) => (
              <div key={sys} className="border rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm">{sys}</span>
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded">Coming soon</span>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-sm font-semibold">Telegram</h2>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-positive" />
            <span className="text-sm">Connected as @ProfixAI_bot</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="https://t.me/ProfixAI_bot?start=PRX-1042" target="_blank" rel="noopener noreferrer">
              Connect Telegram
            </a>
          </Button>
        </section>
      </div>
    </AppShell>
  );
};

export default Settings;
