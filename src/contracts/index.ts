// ─── API Contracts ─────────────────────────────────────────────
// Re-exports all service interfaces plus backend-specific contracts.

export type {
  APIResponse,
  KPIMetric,
  PLRow,
  PLResponse,
  InsightCard,
  InventoryEntry,
  PropertySummary,
} from "@/services/api";

// Auth contract — describes what the backend JWT payload must contain
export interface AuthToken {
  sub: string;           // username
  role: "inventory" | "manager" | "direction";
  displayName: string;
  propertyIds: string[]; // which properties this user can access
  iat: number;
  exp: number;
}

// API request params — what the frontend will send
export interface PLRequestParams {
  propertyId: string;
  year: number;
  month: string;         // "jan" | "feb" | ... | "dec"
  period: "daily" | "monthly" | "ytd";
}

export interface InventorySubmitPayload {
  propertyId: string;
  department: string;
  date: string;          // ISO 8601
  entries: Array<{
    category: string;
    quantity: number;
    unit: string;
    value: number;
  }>;
  submittedBy: string;
}
