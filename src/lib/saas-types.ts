// ─── SaaS Value Framework Types ─────────────────────────────────

export type Tier = "free" | "team" | "enterprise";
export type Timeline = "table-stakes" | "differentiator-6-12mo" | "defensible-12-24mo";
export type ProofAssetType = "demo" | "benchmark" | "case-study" | "roi-calculator" | "audit-report";

export interface FeatureValue {
  id: string;
  name: string;
  description: string;
  tier: Tier;
  buyerValue: string;
  valueMetric: string;
  benchmarkSet: {
    internalBuild: string;
    genericTools: string;
    enterpriseIncumbent: string;
  };
  conditions: string[];
  timeline: Timeline;
  proofAsset: ProofAssetType;
  magnitude: number;   // 1–10
  certainty: number;   // 1–10
  defensibility: number; // 1–10
  friction: number;    // 1–10
}

export function computeValueIndex(f: FeatureValue): number {
  return Math.round(((f.magnitude * f.certainty * f.defensibility) / Math.max(f.friction, 1)) * 10) / 10;
}

export interface PackageTier {
  tier: Tier;
  name: string;
  tagline: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export interface WhyThisMattersBlock {
  outcome: string;
  metric: string;
  benchmark: string;
  condition: string;
  timeline: Timeline;
}

export const timelineLabel: Record<Timeline, string> = {
  "table-stakes": "Table Stakes — Now",
  "differentiator-6-12mo": "Differentiator — 6–12 months",
  "defensible-12-24mo": "Defensible Bet — 12–24 months",
};

export const tierLabel: Record<Tier, string> = {
  free: "Free",
  team: "Team",
  enterprise: "Enterprise",
};

export const tierColor: Record<Tier, string> = {
  free: "bg-muted text-muted-foreground",
  team: "bg-primary/10 text-primary",
  enterprise: "bg-accent/10 text-accent-foreground",
};
