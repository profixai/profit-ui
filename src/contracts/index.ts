// ─── API Contracts ─────────────────────────────────────────────
// ⚠️  CONTRACT-LOCKED — must mirror backend exactly.
// Any change here must be coordinated with finops-platform-profix/backend.

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
export interface InsightCard {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  metric: string;
  actual: number;
  threshold: number;
  context: string;
  recommendation: string;
  acknowledged: boolean;
  department: string;
  timestamp: string;
}

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
