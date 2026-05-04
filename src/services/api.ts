// CONTRACT — must mirror backend finops-platform-profix exactly
// ─── API Service Layer ─────────────────────────────────────────
// Uses VITE_API_BASE as the single env var for backend URL.
// When empty or on fetch failure, returns mock data in the same
// APIResponse<T> envelope so consumers never see a shape difference.

import type {
  APIResponse,
  USALIKpi,
  USALIRow,
  PLResponse,
  InsightCard,
  InventoryEntry,
  PropertySummary,
  InvoiceUploadResponse,
  InvoiceJob,
} from "@/contracts";

// Re-export types so existing imports from "@/services/api" keep working
export type { APIResponse, InsightCard, InventoryEntry, PropertySummary, InvoiceUploadResponse, InvoiceJob };
export type KPIMetric = USALIKpi;
export type PLRow = USALIRow;
export type { PLResponse };

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { API_BASE as BASE, TENANT_ID_FALLBACK as FALLBACK_TENANT } from "@/config/env";

// ─── Tenant / JWT helpers ─────────────────────────────────────
// Backend RLS uses app.current_tenant_id() from the JWT claim.
// We attach Authorization: Bearer <token> on all authenticated calls.

interface AuthHeaders {
  token: string | null;
  tenantId: string | null;
}

async function getAuthHeaders(): Promise<AuthHeaders> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token ?? null;
    // Prefer claim from the JWT user metadata; fall back to env var for local dev.
    const claimTenant =
      (data.session?.user?.app_metadata as Record<string, unknown> | undefined)?.tenant_id ??
      (data.session?.user?.user_metadata as Record<string, unknown> | undefined)?.tenant_id ??
      null;
    const tenantId = (claimTenant as string | null) ?? (FALLBACK_TENANT || null);
    if (!tenantId) {
      console.warn("[api] tenant_id missing — continuing with mock data");
    }
    return { token, tenantId };
  } catch {
    return { token: null, tenantId: FALLBACK_TENANT || null };
  }
}

export async function getTenantId(): Promise<string | null> {
  return (await getAuthHeaders()).tenantId;
}

// ─── Helpers ──────────────────────────────────────────────────

function ok<T>(data: T): APIResponse<T> {
  return {
    ok: true,
    data,
    error: null,
    request_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
}

function err<T>(message: string): APIResponse<T> {
  return {
    ok: false,
    data: null,
    error: message,
    request_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
}

function delay<T>(data: T, ms = 300): Promise<APIResponse<T>> {
  return new Promise((resolve) => setTimeout(() => resolve(ok(data)), ms));
}

/**
 * fetchWithFallback — single helper for all API calls.
 * Tries real fetch when BASE is set; on failure falls back to mock.
 * Always injects Authorization: Bearer <token> when a session exists.
 */
export async function fetchWithFallback<T>(
  path: string,
  mockFactory: () => T,
  init?: RequestInit,
): Promise<APIResponse<T>> {
  if (!BASE) return delay(mockFactory());

  // Resolve session + tenant before every fetch
  let token: string | null = null;
  let tenantId: string | null = FALLBACK_TENANT || null;
  try {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? null;
    const claimTenant =
      (data.session?.user?.app_metadata as Record<string, unknown> | undefined)?.tenant_id ??
      (data.session?.user?.user_metadata as Record<string, unknown> | undefined)?.tenant_id ??
      null;
    tenantId = (claimTenant as string | null) ?? (FALLBACK_TENANT || null);
  } catch {
    // keep fallbacks
  }

  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (tenantId) {
    headers.set("X-Tenant-ID", tenantId);
  } else {
    console.warn(`[api] tenant_id missing for ${path} — continuing without X-Tenant-ID`);
  }
  if (init?.body && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const res = await fetch(`${BASE}${path}`, { ...init, headers });

    if (res.status === 401) {
      await supabase.auth.signOut();
      window.location.replace("/login");
      return {
        ok: false,
        data: null,
        error: "Session expired",
        request_id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };
    }

    if (res.status === 403) {
      toast.error("Access denied — contact your admin");
      return delay(mockFactory());
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error");
      console.warn(`[api] ${path} → ${res.status}: ${text}`);
      return delay(mockFactory());
    }
    return res.json();
  } catch (e) {
    console.warn(`[api] ${path} fetch failed, using mock:`, e);
    return delay(mockFactory());
  }
}

// ─── Mock Data ────────────────────────────────────────────────

const mockKPIs: USALIKpi[] = [
  { label: "Total Revenue", value: 298900, budget: 285000, format: "currency" },
  { label: "GOP", value: 128400, budget: 120000, format: "currency" },
  { label: "NOI / EBITDA", value: 94200, budget: 90000, format: "currency" },
  { label: "RevPAR", value: 142, budget: 135, format: "currency" },
  { label: "OCC%", value: 74, budget: 72, format: "pct" },
  { label: "ADR", value: 192, budget: 188, format: "currency" },
  { label: "F&B Cost %", value: 33.8, budget: 30, format: "pct" },
  { label: "Flow-Through", value: 62, budget: 65, format: "pct" },
];

const mockPLRows: USALIRow[] = [
  {
    id: "rooms-rev", label: "Rooms Revenue", actual: 198500, budget: 190000,
    sparkline: [175000, 180000, 195000, 210000, 200000, 198500],
    children: [
      { id: "rooms-occ", label: "Transient", actual: 142000, budget: 136000, sparkline: [125000, 130000, 140000, 150000, 142000, 142000] },
      { id: "rooms-grp", label: "Group & Contract", actual: 56500, budget: 54000, sparkline: [50000, 50000, 55000, 60000, 58000, 56500] },
    ],
  },
  {
    id: "fb-rev", label: "F&B Revenue", actual: 78400, budget: 75000,
    sparkline: [65000, 68000, 72000, 80000, 76000, 78400],
    children: [
      { id: "fb-rest", label: "Restaurant", actual: 48200, budget: 46000, sparkline: [40000, 42000, 44000, 50000, 47000, 48200] },
      { id: "fb-bar", label: "Bar & Lounge", actual: 18200, budget: 17000, sparkline: [15000, 15500, 16000, 18000, 17500, 18200] },
      { id: "fb-banq", label: "Banquets & Events", actual: 12000, budget: 12000, sparkline: [10000, 10500, 12000, 12000, 11500, 12000] },
    ],
  },
  { id: "other-rev", label: "Other Revenue", actual: 22000, budget: 20000, sparkline: [18000, 19000, 20000, 22000, 21000, 22000] },
  { id: "total-rev", label: "Total Revenue", actual: 298900, budget: 285000, sparkline: [258000, 267000, 287000, 312000, 297000, 298900], isSummary: true },
  {
    id: "rooms-exp", label: "Rooms Expense", actual: 48200, budget: 46000,
    sparkline: [44000, 45000, 46000, 50000, 48000, 48200],
    children: [
      { id: "rooms-labor", label: "Labor", actual: 38000, budget: 36000, sparkline: [34000, 35000, 36000, 40000, 38000, 38000] },
      { id: "rooms-other", label: "Other Expenses", actual: 10200, budget: 10000, sparkline: [10000, 10000, 10000, 10000, 10000, 10200] },
    ],
  },
  {
    id: "fb-exp", label: "F&B Expense", actual: 43000, budget: 38000,
    sparkline: [35000, 36000, 38000, 44000, 42000, 43000],
    children: [
      { id: "fb-cos", label: "Cost of Sales", actual: 21000, budget: 18000, sparkline: [17000, 17500, 18000, 22000, 20500, 21000] },
      { id: "fb-labor2", label: "Labor", actual: 22000, budget: 20000, sparkline: [18000, 18500, 20000, 22000, 21500, 22000] },
    ],
  },
  {
    id: "undist", label: "Undistributed Expenses", actual: 56400, budget: 54000,
    sparkline: [50000, 52000, 54000, 58000, 56000, 56400],
    children: [
      { id: "admin", label: "Administrative & General", actual: 22400, budget: 21000, sparkline: [20000, 21000, 21000, 23000, 22000, 22400] },
      { id: "sales", label: "Sales & Marketing", actual: 9800, budget: 9500, sparkline: [8500, 9000, 9500, 10000, 9800, 9800] },
      { id: "propops", label: "Property Operations", actual: 8600, budget: 8500, sparkline: [8000, 8200, 8500, 9000, 8700, 8600] },
      { id: "utilities", label: "Utilities", actual: 15600, budget: 15000, sparkline: [13500, 14000, 15000, 16000, 15500, 15600] },
    ],
  },
  { id: "gop", label: "Gross Operating Profit (GOP)", actual: 128400, budget: 120000, sparkline: [110000, 115000, 120000, 135000, 128000, 128400], isSummary: true },
  {
    id: "fixed", label: "Fixed Charges", actual: 34200, budget: 30000,
    sparkline: [30000, 30000, 30000, 34000, 34000, 34200],
    children: [
      { id: "rent", label: "Rent / Lease", actual: 18000, budget: 18000, sparkline: [18000, 18000, 18000, 18000, 18000, 18000] },
      { id: "insurance", label: "Insurance", actual: 6200, budget: 6000, sparkline: [6000, 6000, 6000, 6200, 6200, 6200] },
      { id: "depreciation", label: "Depreciation", actual: 10000, budget: 6000, sparkline: [6000, 6000, 6000, 10000, 10000, 10000] },
    ],
  },
  { id: "noi", label: "NOI / EBITDA", actual: 94200, budget: 90000, sparkline: [80000, 85000, 90000, 101000, 94000, 94200], isSummary: true },
];

const mockInsights: InsightCard[] = [
  { id: "1", severity: "critical", department: "F&B", title: "F&B Cost % exceeded budget by 4.2 pts this week", metric: "F&B Cost %", actual: 33.8, threshold: 30, context: "F&B Cost of Sales reached 33.8% against a 30% budget target.", recommendation: "Review portion control and renegotiate supplier contracts.", acknowledged: false, timestamp: "2026-04-01 08:15" },
  { id: "2", severity: "critical", department: "Rooms", title: "RevPAR declined 11% vs. same period last year", metric: "RevPAR", actual: 142, threshold: 160, context: "RevPAR dropped from €160 to €142. ADR held steady at €192 but occupancy fell from 83% to 74%.", recommendation: "Launch targeted weekend packages and review OTA commission structure.", acknowledged: false, timestamp: "2026-04-01 07:30" },
  { id: "3", severity: "warning", department: "Energy", title: "Electricity consumption 15% above seasonal norm", metric: "Electricity kWh", actual: 42000, threshold: 36500, context: "March electricity usage spiked to 42,000 kWh vs. the 36,500 kWh seasonal average.", recommendation: "Check BMS scheduling and occupancy sensor calibration.", acknowledged: false, timestamp: "2026-03-31 18:00" },
  { id: "4", severity: "warning", department: "Payroll", title: "Overtime hours up 18% in Housekeeping", metric: "Overtime Hours", actual: 340, threshold: 288, context: "Housekeeping logged 340 overtime hours this month.", recommendation: "Accelerate recruitment for open positions.", acknowledged: false, timestamp: "2026-03-31 14:22" },
  { id: "5", severity: "info", department: "Rooms", title: "Weekend occupancy trending above forecast", metric: "Weekend OCC%", actual: 88, threshold: 82, context: "Weekend OCC% averaged 88% over the last 4 weeks vs. 82% forecast.", recommendation: "Implement dynamic pricing for weekends. Estimated uplift: €2,800/month.", acknowledged: false, timestamp: "2026-03-30 09:45" },
  { id: "6", severity: "info", department: "F&B", title: "Room service revenue up 24% after menu refresh", metric: "Room Service Revenue", actual: 10200, threshold: 8200, context: "The Q1 menu update has driven room service revenue from €8,200 to €10,200/month.", recommendation: "Consider expanding room service availability hours.", acknowledged: false, timestamp: "2026-03-29 16:30" },
  { id: "7", severity: "warning", department: "Energy", title: "Water consumption anomaly detected in Q3 data", metric: "Water L/guest-night", actual: 520, threshold: 395, context: "Water intensity spiked to 520 L/guest-night in Q3.", recommendation: "Investigate possible leaks or irrigation system issues.", acknowledged: false, timestamp: "2026-03-28 11:15" },
  { id: "8", severity: "critical", department: "Payroll", title: "Payroll % of revenue at 30.2% — above 28% threshold", metric: "Payroll %", actual: 30.2, threshold: 28, context: "Total payroll costs reached €90,300 against €298,900 revenue.", recommendation: "Review agency staff costs and accelerate direct hiring.", acknowledged: false, timestamp: "2026-03-27 08:00" },
];

const mockInventoryEntries: Record<string, InventoryEntry[]> = {
  fb: [
    { id: "inv-1", department: "fb", category: "Beverage Cost", quantity: 1, unit: "lot", value: 1200, date: "2026-04-06", submittedBy: "inventory", status: "draft" },
    { id: "inv-2", department: "fb", category: "Food Cost", quantity: 1, unit: "lot", value: 1800, date: "2026-04-06", submittedBy: "inventory", status: "draft" },
    { id: "inv-3", department: "fb", category: "Wastage", quantity: 1, unit: "lot", value: 220, date: "2026-04-06", submittedBy: "inventory", status: "draft" },
    { id: "inv-4", department: "fb", category: "Disposables", quantity: 1, unit: "lot", value: 200, date: "2026-04-06", submittedBy: "inventory", status: "draft" },
  ],
  rooms: [
    { id: "inv-5", department: "rooms", category: "Linen & Towels", quantity: 1, unit: "lot", value: 450, date: "2026-04-06", submittedBy: "inventory", status: "draft" },
    { id: "inv-6", department: "rooms", category: "Minibar Restock", quantity: 1, unit: "lot", value: 380, date: "2026-04-06", submittedBy: "inventory", status: "draft" },
    { id: "inv-7", department: "rooms", category: "Amenities", quantity: 1, unit: "lot", value: 520, date: "2026-04-06", submittedBy: "inventory", status: "draft" },
    { id: "inv-8", department: "rooms", category: "Cleaning Supplies", quantity: 1, unit: "lot", value: 500, date: "2026-04-06", submittedBy: "inventory", status: "draft" },
  ],
  housekeeping: [
    { id: "inv-9", department: "housekeeping", category: "Cleaning Chemicals", quantity: 1, unit: "lot", value: 340, date: "2026-04-06", submittedBy: "inventory", status: "draft" },
    { id: "inv-10", department: "housekeeping", category: "Equipment Maintenance", quantity: 1, unit: "lot", value: 280, date: "2026-04-06", submittedBy: "inventory", status: "draft" },
    { id: "inv-11", department: "housekeeping", category: "Laundry Consumables", quantity: 1, unit: "lot", value: 300, date: "2026-04-06", submittedBy: "inventory", status: "draft" },
  ],
  maintenance: [
    { id: "inv-12", department: "maintenance", category: "Spare Parts", quantity: 1, unit: "lot", value: 620, date: "2026-04-06", submittedBy: "inventory", status: "draft" },
    { id: "inv-13", department: "maintenance", category: "Electrical Supplies", quantity: 1, unit: "lot", value: 280, date: "2026-04-06", submittedBy: "inventory", status: "draft" },
    { id: "inv-14", department: "maintenance", category: "Plumbing Supplies", quantity: 1, unit: "lot", value: 340, date: "2026-04-06", submittedBy: "inventory", status: "draft" },
    { id: "inv-15", department: "maintenance", category: "HVAC Filters", quantity: 1, unit: "lot", value: 300, date: "2026-04-06", submittedBy: "inventory", status: "draft" },
  ],
};

const mockProperties: PropertySummary[] = [
  { id: "le-grand", name: "Le Grand Hôtel", revpar: 142, occ: 74, adr: 192, gop: 128400, gopBudget: 120000, anomalies: ["F&B Cost % at 33.8% exceeds 30% threshold"] },
  { id: "riviera", name: "Riviera Palace", revpar: 198, occ: 81, adr: 245, gop: 185400, gopBudget: 180000, anomalies: [] },
  { id: "alpine", name: "Alpine Lodge", revpar: 88, occ: 58, adr: 152, gop: 52000, gopBudget: 60000, anomalies: ["Revenue 8.2% below budget", "OCC% dropped 7pts"] },
];

// ─── API Functions ────────────────────────────────────────────

export async function fetchPL(params: {
  property: string;
  year: number;
  month: string;
  period: "daily" | "monthly" | "ytd";
}): Promise<APIResponse<PLResponse>> {
  return fetchWithFallback<PLResponse>(
    "/api/v1/pl",
    () => ({
      kpis: mockKPIs,
      rows: mockPLRows,
      metadata: {
        property_id: params.property,
        period: `${params.year}-${params.month}-${params.period}`,
        generated_at: new Date().toISOString(),
      },
    }),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    },
  );
}

export async function fetchInsights(propertyId: string): Promise<APIResponse<InsightCard[]>> {
  return fetchWithFallback<InsightCard[]>(
    `/api/v1/insights?propertyId=${propertyId}`,
    () => mockInsights,
  );
}

export async function fetchInventory(department: string, date: string): Promise<APIResponse<InventoryEntry[]>> {
  return fetchWithFallback<InventoryEntry[]>(
    `/api/v1/inventory?department=${department}&date=${date}`,
    () => mockInventoryEntries[department] || [],
  );
}

export async function submitInventory(entries: InventoryEntry[]): Promise<APIResponse<{ success: boolean; submissionId: string }>> {
  return fetchWithFallback<{ success: boolean; submissionId: string }>(
    "/api/v1/inventory",
    () => ({ success: true, submissionId: crypto.randomUUID() }),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entries),
    },
  );
}

export async function fetchMultiProperty(): Promise<APIResponse<PropertySummary[]>> {
  return fetchWithFallback<PropertySummary[]>(
    "/api/v1/multi-property",
    () => mockProperties,
  );
}

// ─── Invoice ingestion ────────────────────────────────────────
// Backend canonical routes (DO NOT change paths):
//   POST  {API_BASE}/upload/invoices    → InvoiceUploadResponse
//   GET   {API_BASE}/invoices/{job_id}  → InvoiceJob

export function mockInvoiceJobs(): InvoiceJob[] {
  return [
    {
      job_id: "job-001", status: "complete", invoice_number: "INV-2026-001",
      vendor_id: "v-001", vendor_name: "Laundry Co.", invoice_date: "2026-04-01",
      total_amount: 1420.0, currency: "EUR", confidence_score: 0.96,
      extractor: "hybrid", lines_count: 4,
      s3_raw_key: "mock/job-001/raw.pdf",
      s3_processed_key: "mock/job-001/processed.json",
      data_vault_key: "dv/job-001",
    },
    {
      job_id: "job-002", status: "queued", invoice_number: "INV-2026-002",
      vendor_id: "v-002", vendor_name: "Tech Repairs Ltd", invoice_date: "2026-04-15",
      total_amount: 890.5, currency: "EUR", confidence_score: null,
      extractor: null, lines_count: 0,
      s3_raw_key: "mock/job-002/raw.pdf",
      s3_processed_key: null,
      data_vault_key: "dv/job-002",
    },
    {
      job_id: "job-003", status: "error", invoice_number: null,
      vendor_id: "v-003", vendor_name: "Food Supplies SA", invoice_date: "2026-04-28",
      total_amount: null, currency: "EUR", confidence_score: 0.41,
      extractor: "ocr_llm", lines_count: 2,
      s3_raw_key: "mock/job-003/raw.pdf",
      s3_processed_key: null,
      data_vault_key: "dv/job-003",
    },
  ];
}

export async function uploadInvoice(file: File): Promise<APIResponse<InvoiceUploadResponse>> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("source", "manual_upload");

  return fetchWithFallback<InvoiceUploadResponse>(
    "/upload/invoices",
    () => ({
      job_id: `job-${Math.random().toString(36).slice(2, 8)}`,
      status: "queued",
      invoice_count: 1,
      data_vault_key: `dv/${file.name}`,
      invoice_number: null,
      vendor_id: null,
      s3_raw_key: `mock/${file.name}`,
    }),
    { method: "POST", body: fd },
  );
}

export async function getInvoiceJob(jobId: string): Promise<APIResponse<InvoiceJob>> {
  // Backend mounts invoices.router under prefix="/upload" in main.py:35,
  // so the GET endpoint is /upload/invoices/{job_id} — not /invoices/{job_id}.
  // Without the /upload prefix this returned 404 every poll cycle and silently
  // fell through to mock data even when the upload itself succeeded.
  return fetchWithFallback<InvoiceJob>(
    `/upload/invoices/${jobId}`,
    () => {
      const found = mockInvoiceJobs().find((j) => j.job_id === jobId);
      if (found) return found;
      return {
        job_id: jobId, status: "complete",
        invoice_number: `INV-${jobId.slice(-4).toUpperCase()}`,
        vendor_id: "v-mock", vendor_name: "Mock Vendor",
        invoice_date: new Date().toISOString().slice(0, 10),
        currency: "EUR", total_amount: 1234.56, confidence_score: 0.92,
        extractor: "hybrid", lines_count: 3,
        s3_raw_key: `mock/${jobId}/raw.pdf`,
        s3_processed_key: `mock/${jobId}/processed.json`,
        data_vault_key: `dv/${jobId}`,
      };
    },
  );
}
