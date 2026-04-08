import { AppShell } from "@/components/AppShell";
import { EnterpriseTrustPanel } from "@/components/saas/EnterpriseTrustPanel";
import { CompetitiveComparison } from "@/components/saas/CompetitiveComparison";
import { PackagingTiers } from "@/components/saas/PackagingTiers";
import { WhyThisMatters } from "@/components/saas/WhyThisMatters";
import { packageTiers } from "@/lib/saas-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Download, Activity } from "lucide-react";

const auditMetrics = [
  { label: "Active Users", value: "12", icon: Activity },
  { label: "Data Exports (30d)", value: "34", icon: Download },
  { label: "Audit Events (30d)", value: "1,247", icon: FileText },
  { label: "Security Score", value: "92/100", icon: Shield },
];

const Enterprise = () => (
  <AppShell>
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Enterprise</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Security, governance, and compliance controls for IT-safe deployment.
        </p>
      </div>

      <WhyThisMatters
        block={{
          outcome: "Pass IT security review and deploy with confidence.",
          metric: "Zero unauthorized access incidents",
          benchmark: "Custom RBAC + audit logging adds 3+ months to internal builds.",
          condition: "Identity provider and role mapping configured.",
          timeline: "table-stakes",
        }}
      />

      {/* ── Audit Metrics ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {auditMetrics.map((m) => (
          <Card key={m.label} className="p-4 space-y-1">
            <div className="flex items-center gap-2">
              <m.icon className="h-4 w-4 text-primary" />
              <p className="text-[10px] text-muted-foreground font-medium">{m.label}</p>
            </div>
            <p className="text-lg font-semibold font-mono-data">{m.value}</p>
          </Card>
        ))}
      </div>

      {/* ── Trust Panel ─────────────────────────────────────── */}
      <EnterpriseTrustPanel />

      {/* ── Competitive Positioning ─────────────────────────── */}
      <CompetitiveComparison />

      {/* ── Packaging ───────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Plans & Packaging</h2>
        <PackagingTiers tiers={packageTiers} />
      </div>
    </div>
  </AppShell>
);

export default Enterprise;
