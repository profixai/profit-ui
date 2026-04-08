import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { sendTelegramMessage } from "@/services/telegram";
import { WhyThisMatters } from "@/components/saas/WhyThisMatters";
import { pageValueBlocks } from "@/lib/saas-data";

const STORAGE_KEY = "pp_notification_settings";

interface NotificationSettings {
  botToken: string;
  chatId: string;
  enabled: boolean;
  criticalOnly: boolean;
  fbThreshold: number;
  payrollThreshold: number;
  occDrop: number;
  revparDrop: number;
  dailyDigest: boolean;
  dailyTime: string;
  weeklySummary: boolean;
  weeklyDay: string;
  realtimeBreach: boolean;
}

const defaultSettings: NotificationSettings = {
  botToken: "",
  chatId: "",
  enabled: false,
  criticalOnly: false,
  fbThreshold: 32,
  payrollThreshold: 28,
  occDrop: -5,
  revparDrop: -10,
  dailyDigest: true,
  dailyTime: "08:00",
  weeklySummary: true,
  weeklyDay: "monday",
  realtimeBreach: true,
};

const Settings = () => {
  const location = useLocation();
  const telegramRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (location.hash === "#telegram" && telegramRef.current) {
      telegramRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (location.hash === "#notifications") {
      setActiveTab("notifications");
    }
  }, [location.hash]);

  const update = <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleTestTelegram = async () => {
    if (!settings.botToken || !settings.chatId) {
      toast.error("Please enter Bot Token and Chat ID first.");
      return;
    }
    const success = await sendTelegramMessage("✅ ProfitPulse connected successfully. Alerts are active.");
    if (success) {
      toast.success("Test message sent to Telegram");
    } else {
      toast.error("Failed to send — check your bot token and chat ID.");
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <WhyThisMatters block={pageValueBlocks.settings} />
        <div>
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your property and account</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-8 mt-6">
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
          </TabsContent>

          <TabsContent value="notifications" ref={notifRef} className="space-y-8 mt-6">
            {/* Telegram Bot */}
            <Card className="p-4 space-y-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Send className="h-4 w-4 text-primary" /> Telegram Bot
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Bot Token</Label>
                  <Input
                    type="password"
                    placeholder="123456:ABC-DEF..."
                    value={settings.botToken}
                    onChange={(e) => update("botToken", e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Chat ID / Channel ID</Label>
                  <Input
                    placeholder="-100123456789"
                    value={settings.chatId}
                    onChange={(e) => update("chatId", e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Enable Telegram notifications</Label>
                <Switch checked={settings.enabled} onCheckedChange={(v) => update("enabled", v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Critical alerts only</Label>
                <Switch checked={settings.criticalOnly} onCheckedChange={(v) => update("criticalOnly", v)} />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={handleTestTelegram}
              >
                Send test message
              </Button>
            </Card>

            {/* Alert Thresholds */}
            <Card className="p-4 space-y-4">
              <h2 className="text-sm font-semibold">Alert Thresholds</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">F&B Cost % threshold</Label>
                  <Input type="number" value={settings.fbThreshold} onChange={(e) => update("fbThreshold", Number(e.target.value))} className="text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Payroll % threshold</Label>
                  <Input type="number" value={settings.payrollThreshold} onChange={(e) => update("payrollThreshold", Number(e.target.value))} className="text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">OCC% drop alert (%)</Label>
                  <Input type="number" value={settings.occDrop} onChange={(e) => update("occDrop", Number(e.target.value))} className="text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">RevPAR drop alert (%)</Label>
                  <Input type="number" value={settings.revparDrop} onChange={(e) => update("revparDrop", Number(e.target.value))} className="text-sm" />
                </div>
              </div>
            </Card>

            {/* Notification Schedule */}
            <Card className="p-4 space-y-4">
              <h2 className="text-sm font-semibold">Notification Schedule</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch checked={settings.dailyDigest} onCheckedChange={(v) => update("dailyDigest", v)} />
                    <Label className="text-xs">Daily digest</Label>
                  </div>
                  <Input type="time" value={settings.dailyTime} onChange={(e) => update("dailyTime", e.target.value)} className="text-sm w-28" disabled={!settings.dailyDigest} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch checked={settings.weeklySummary} onCheckedChange={(v) => update("weeklySummary", v)} />
                    <Label className="text-xs">Weekly summary</Label>
                  </div>
                  <Select value={settings.weeklyDay} onValueChange={(v) => update("weeklyDay", v)} disabled={!settings.weeklySummary}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((d) => (
                        <SelectItem key={d} value={d} className="text-xs capitalize">{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={settings.realtimeBreach} onCheckedChange={(v) => update("realtimeBreach", v)} />
                  <Label className="text-xs">Real-time on threshold breach</Label>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

export default Settings;
