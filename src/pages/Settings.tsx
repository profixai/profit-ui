import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const { user } = useAuth();

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your property and account</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold">Account</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Display name</Label>
              <Input defaultValue={user?.displayName ?? ""} className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Username</Label>
              <Input defaultValue={user?.username ?? ""} readOnly className="text-sm bg-muted" />
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-4">
          <h2 className="text-sm font-semibold">Property</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Property name</Label>
              <Input defaultValue="Le Grand Hôtel" className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Property code</Label>
              <Input defaultValue="PRX-1042" readOnly className="text-sm bg-muted" />
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
};

export default Settings;
