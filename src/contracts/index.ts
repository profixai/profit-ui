// CONTRACT — must mirror backend finops-platform-profix exactly
// ─── API Contracts ─────────────────────────────────────────────
// ⚠️  CONTRACT-LOCKED — coordinate any change with finops-platform-profix/backend.

// ─── Canonical Response Envelope ──────────────────────────────
export interface APIResponse<T> {
  ok: boolean;
  data: T | null;
  error?: string | null;
  request_id?: string;
  timestamp?: string;
  tier?: "free" | "team" | "enterprise";
  upgrade_prompt?: string | null;
}

// ─── USALI-aligned P&L types ──────────────────────────────────
export interface USALIKpi {
  label: string;
  value: number;
  budget: number;
  format: "currency" | "pct";
}

export interface USALIRow {
  id: string;
  label: string;
  actual: number;
  budget: number;
  sparkline: number[];
  isSummary?: boolean;
  children?: USALIRow[];
}

export interface PLMetadata {
  property_id: string;
  period: string;
  generated_at: string;
}

export interface PLResponse {
  kpis: USALIKpi[];
  rows: USALIRow[];
  metadata: PLMetadata;
}

// ─── Insight ──────────────────────────────────────────────────
// Backend canonical fields: id, severity (high|medium|low), category,
// title, body, department?, generated_at.
// UI extended fields (kept for current Insights page UX): metric, actual,
// threshold, context, recommendation, acknowledged, timestamp.
// The mapping helpers below normalize between backend and UI severity.
export type BackendSeverity = "high" | "medium" | "low";
export type UISeverity = "critical" | "warning" | "info";

export interface InsightCard {
  id: string;
  severity: UISeverity;          // UI-facing
  backendSeverity?: BackendSeverity;
  category?: string;
  title: string;
  body?: string;
  department: string;
  generated_at?: string;
  // ── UI-only extensions (optional on backend) ──
  metric: string;
  actual: number;
  threshold: number;
  context: string;
  recommendation: string;
  acknowledged: boolean;
  timestamp: string;
}

export const backendToUISeverity: Record<BackendSeverity, UISeverity> = {
  high: "critical",
  medium: "warning",
  low: "info",
};

// ─── Inventory ────────────────────────────────────────────────
export interface InventoryEntry {
  id: string;
  department: string;
  category: string;
  quantity: number;
  unit: string;
  value: number;
  date: string;
  submittedBy: string;
  status: "draft" | "submitted";
}

// ─── Multi-Property ───────────────────────────────────────────
export interface PropertySummary {
  id: string;
  name: string;
  revpar: number;
  occ: number;
  adr: number;
  gop: number;
  gopBudget: number;
  anomalies: string[];
}

// ─── Auth contract (JWT payload shape) ────────────────────────
export interface AuthToken {
  sub: string;
  role: "inventory" | "manager" | "direction";
  displayName: string;
  propertyIds: string[];
  iat: number;
  exp: number;
}

// ─── Request params ───────────────────────────────────────────
export interface PLRequestParams {
  propertyId: string;
  year: number;
  month: string;
  period: "daily" | "monthly" | "ytd";
}

export interface InventorySubmitPayload {
  propertyId: string;
  department: string;
  date: string;
  entries: Array<{
    category: string;
    quantity: number;
    unit: string;
    value: number;
  }>;
  submittedBy: string;
}
