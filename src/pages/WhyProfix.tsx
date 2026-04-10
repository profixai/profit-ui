import { AppShell } from "@/components/AppShell";
import { CompetitiveComparison } from "@/components/saas/CompetitiveComparison";
import { FeatureValueMatrix } from "@/components/saas/FeatureValueMatrix";
import { PackagingTiers } from "@/components/saas/PackagingTiers";
import { EnterpriseTrustPanel } from "@/components/saas/EnterpriseTrustPanel";
import { featureValueMatrix, packageTiers } from "@/lib/saas-data";

const WhyProfix = () => (
  <AppShell>
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Why Profix</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Platform positioning, competitive benchmarks, packaging, and enterprise trust.
        </p>
      </div>

      <CompetitiveComparison />

      <FeatureValueMatrix features={featureValueMatrix} />

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Plans & Packaging</h2>
        <PackagingTiers tiers={packageTiers} />
      </div>

      <EnterpriseTrustPanel />
    </div>
  </AppShell>
);

export default WhyProfix;
