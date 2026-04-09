// ─── API Service Layer ─────────────────────────────────────────
// Single source of truth for all backend calls.
// Currently returns mock data via async wrappers.
// When VITE_API_BASE_URL is set, functions will use real fetch calls.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

// ─── Response Envelope ────────────────────────────────────────
export interface APIResponse<T> {
  data: T;
  ok: boolean;
  error?: string;
  requestId: string;
  timestamp: string;
}

function wrapResponse<T>(data: T): APIResponse<T> {
  return {
    data,
    ok: true,
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
}

function delay<T>(data: T, ms = 300): Promise<APIResponse<T>> {
  return new Promise((resolve) => setTimeout(() => resolve(wrapResponse(data)), ms));
}

// ─── Interfaces ───────────────────────────────────────────────
export interface KPIMetric {
  label: string;
  value: number;
  budget: number;
  format: "currency" | "pct";
}

export interface PLRow {
  id: string;
  label: string;
  actual: number;
  budget: number;
  sparkline: number[];
  isSummary?: boolean;
  children?: PLRow[];
}

export interface PLResponse {
  kpis: KPIMetric[];
  rows: PLRow[];
  meta: {
    property: string;
    year: number;
    month: string;
    period: "daily" | "monthly" | "ytd";
    generatedAt: string;
  };
}

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

// ─── Mock Data ────────────────────────────────────────────────

const mockKPIs: KPIMetric[] = [
  { label: "Total Revenue", value: 298900, budget: 285000, format: "currency" },
  { label: "GOP", value: 128400, budget: 120000, format: "currency" },
  { label: "NOI / EBITDA", value: 94200, budget: 90000, format: "currency" },
  { label: "RevPAR", value: 142, budget: 135, format: "currency" },
  { label: "OCC%", value: 74, budget: 72, format: "pct" },
  { label: "ADR", value: 192, budget: 188, format: "currency" },
  { label: "F&B Cost %", value: 33.8, budget: 30, format: "pct" },
  { label: "Flow-Through", value: 62, budget: 65, format: "pct" },
];

const mockPLRows: PLRow[] = [
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
  {
    id: "1", severity: "critical", department: "F&B",
    title: "F&B Cost % exceeded budget by 4.2 pts this week",
    metric: "F&B Cost %", actual: 33.8, threshold: 30,
    context: "F&B Cost of Sales reached 33.8% against a 30% budget target. The primary driver is a 12% increase in protein costs from the main supplier, combined with higher-than-normal wastage rates in the breakfast buffet service.",
    recommendation: "Review portion control and renegotiate supplier contracts. Consider switching to seasonal menu items.",
    acknowledged: false, timestamp: "2026-04-01 08:15",
  },
  {
    id: "2", severity: "critical", department: "Rooms",
    title: "RevPAR declined 11% vs. same period last year",
    metric: "RevPAR", actual: 142, threshold: 160,
    context: "RevPAR dropped from €160 to €142. ADR held steady at €192 but occupancy fell from 83% to 74%. The decline coincides with a new competitor opening 2km away and reduced conference bookings.",
    recommendation: "Launch targeted weekend packages and review OTA commission structure.",
    acknowledged: false, timestamp: "2026-04-01 07:30",
  },
  {
    id: "3", severity: "warning", department: "Energy",
    title: "Electricity consumption 15% above seasonal norm",
    metric: "Electricity kWh", actual: 42000, threshold: 36500,
    context: "March electricity usage spiked to 42,000 kWh vs. the 36,500 kWh seasonal average. HVAC runtime increased by 22% despite moderate outdoor temperatures.",
    recommendation: "Check BMS scheduling and occupancy sensor calibration.",
    acknowledged: false, timestamp: "2026-03-31 18:00",
  },
  {
    id: "4", severity: "warning", department: "Payroll",
    title: "Overtime hours up 18% in Housekeeping",
    metric: "Overtime Hours", actual: 340, threshold: 288,
    context: "Housekeeping logged 340 overtime hours this month, up from 288 last month. Contributing factors include two staff vacancies and a 6% increase in room turnover rate.",
    recommendation: "Accelerate recruitment for open positions and review scheduling efficiency.",
    acknowledged: false, timestamp: "2026-03-31 14:22",
  },
  {
    id: "5", severity: "info", department: "Rooms",
    title: "Weekend occupancy trending above forecast",
    metric: "Weekend OCC%", actual: 88, threshold: 82,
    context: "Weekend OCC% averaged 88% over the last 4 weeks vs. 82% forecast. Consider dynamic pricing adjustments for Fri–Sun to capture additional revenue.",
    recommendation: "Implement dynamic pricing for weekends. Estimated uplift: €2,800/month.",
    acknowledged: false, timestamp: "2026-03-30 09:45",
  },
  {
    id: "6", severity: "info", department: "F&B",
    title: "Room service revenue up 24% after menu refresh",
    metric: "Room Service Revenue", actual: 10200, threshold: 8200,
    context: "The Q1 menu update has driven room service revenue from €8,200 to €10,200/month. Top performers are the new breakfast bowl (+€1,100) and evening tapas selection (+€900).",
    recommendation: "Consider expanding room service availability hours.",
    acknowledged: false, timestamp: "2026-03-29 16:30",
  },
  {
    id: "7", severity: "warning", department: "Energy",
    title: "Water consumption anomaly detected in Q3 data",
    metric: "Water L/guest-night", actual: 520, threshold: 395,
    context: "Water intensity spiked to 520 L/guest-night in Q3 — a 31.6% jump from Q2. This correlates with peak summer occupancy but exceeds the expected proportional increase.",
    recommendation: "Investigate possible leaks or irrigation system issues.",
    acknowledged: false, timestamp: "2026-03-28 11:15",
  },
  {
    id: "8", severity: "critical", department: "Payroll",
    title: "Payroll % of revenue at 30.2% — above 28% threshold",
    metric: "Payroll %", actual: 30.2, threshold: 28,
    context: "Total payroll costs reached €90,300 against €298,900 revenue. The ratio exceeds the USALI mid-scale benchmark of 28%. Key drivers: management salary increases (+3.8%) and unfilled positions requiring agency staff.",
    recommendation: "Review agency staff costs and accelerate direct hiring.",
    acknowledged: false, timestamp: "2026-03-27 08:00",
  },
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

// BACKEND ENDPOINT: GET /api/v1/pl
// Params: PLRequestParams
// Response: APIResponse<PLResponse>
export async function fetchPL(params: {
  property: string;
  year: number;
  month: string;
  period: "daily" | "monthly" | "ytd";
}): Promise<APIResponse<PLResponse>> {
  if (BASE_URL) {
    const res = await fetch(`${BASE_URL}/api/v1/pl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
  return delay({
    kpis: mockKPIs,
    rows: mockPLRows,
    meta: {
      property: params.property,
      year: params.year,
      month: params.month,
      period: params.period,
      generatedAt: new Date().toISOString(),
    },
  });
}

// BACKEND ENDPOINT: GET /api/v1/insights
// Params: { propertyId: string }
// Response: APIResponse<InsightCard[]>
export async function fetchInsights(propertyId: string): Promise<APIResponse<InsightCard[]>> {
  if (BASE_URL) {
    const res = await fetch(`${BASE_URL}/api/v1/insights?propertyId=${propertyId}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
  return delay(mockInsights);
}

// BACKEND ENDPOINT: GET /api/v1/inventory
// Params: { department: string, date: string }
// Response: APIResponse<InventoryEntry[]>
export async function fetchInventory(department: string, date: string): Promise<APIResponse<InventoryEntry[]>> {
  if (BASE_URL) {
    const res = await fetch(`${BASE_URL}/api/v1/inventory?department=${department}&date=${date}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
  return delay(mockInventoryEntries[department] || []);
}

// BACKEND ENDPOINT: POST /api/v1/inventory
// Params: InventorySubmitPayload
// Response: APIResponse<{ success: boolean; submissionId: string }>
export async function submitInventory(entries: InventoryEntry[]): Promise<APIResponse<{ success: boolean; submissionId: string }>> {
  if (BASE_URL) {
    const res = await fetch(`${BASE_URL}/api/v1/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entries),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
  return delay({ success: true, submissionId: crypto.randomUUID() });
}

// BACKEND ENDPOINT: GET /api/v1/multi-property
// Response: APIResponse<PropertySummary[]>
export async function fetchMultiProperty(): Promise<APIResponse<PropertySummary[]>> {
  if (BASE_URL) {
    const res = await fetch(`${BASE_URL}/api/v1/multi-property`);
    return res.json();
  }
  return delay(mockProperties);
}
