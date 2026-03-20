// Mock data for the Profix platform

// ─── Financial P&L Data ─────────────────────────────────────────
export const mockMonthlyMargin = [
  { month: "2024-01", revenue: 267300, costs: 150700, gop: 116600, gop_margin_pct: 43.62 },
  { month: "2024-02", revenue: 244700, costs: 128250, gop: 116450, gop_margin_pct: 47.59 },
  { month: "2024-03", revenue: 289100, costs: 168400, gop: 120700, gop_margin_pct: 41.75 },
  { month: "2024-04", revenue: 312500, costs: 181200, gop: 131300, gop_margin_pct: 42.02 },
  { month: "2024-05", revenue: 298700, costs: 179300, gop: 119400, gop_margin_pct: 39.97 },
  { month: "2024-06", revenue: 341200, costs: 192600, gop: 148600, gop_margin_pct: 43.55 },
  { month: "2024-07", revenue: 378400, costs: 208100, gop: 170300, gop_margin_pct: 45.0 },
  { month: "2024-08", revenue: 395200, costs: 225800, gop: 169400, gop_margin_pct: 42.86 },
  { month: "2024-09", revenue: 321600, costs: 198400, gop: 123200, gop_margin_pct: 38.31 },
  { month: "2024-10", revenue: 287300, costs: 192100, gop: 95200, gop_margin_pct: 33.14 },
  { month: "2024-11", revenue: 265400, costs: 159800, gop: 105600, gop_margin_pct: 39.79 },
  { month: "2024-12", revenue: 298900, costs: 170500, gop: 128400, gop_margin_pct: 42.96 },
];

export const mockCostDrivers = [
  { rank: 1, account_name: "Rooms Labor", department: "Rooms", amount: 38000, pct_of_total_cost: 25.22, delta_pct: 4.2 },
  { rank: 2, account_name: "F&B Labor", department: "Food & Beverage", amount: 22000, pct_of_total_cost: 14.60, delta_pct: -2.1 },
  { rank: 3, account_name: "F&B Cost of Sales", department: "Food & Beverage", amount: 21000, pct_of_total_cost: 13.93, delta_pct: 8.5 },
  { rank: 4, account_name: "Management Labor", department: "Administrative & General", amount: 15000, pct_of_total_cost: 9.95, delta_pct: 1.3 },
  { rank: 5, account_name: "Electricity", department: "Utilities", amount: 11200, pct_of_total_cost: 7.43, delta_pct: 38.2 },
];

export const mockDepartmentCosts = [
  { department: "Rooms", total: 48200, pct: 32.0 },
  { department: "Food & Beverage", total: 43000, pct: 28.5 },
  { department: "Administrative & General", total: 22400, pct: 14.9 },
  { department: "Utilities", total: 18700, pct: 12.4 },
  { department: "Sales & Marketing", total: 9800, pct: 6.5 },
  { department: "Property Operations", total: 8600, pct: 5.7 },
];

export const mockBreakeven = {
  breakeven_occupancy_pct: 62,
  current_occupancy_pct: 74,
  rooms_per_night_needed: 86,
  months_below: 2,
  total_months: 12,
};

export const mockKPIs = {
  total_revenue: 3509300,
  total_costs: 2055150,
  gop: 1454150,
  gop_margin_pct: 41.44,
  revenue_delta: 6.2,
  costs_delta: 3.8,
  gop_delta: 9.1,
  margin_delta: 1.2,
};

// ─── Quarterly Ledger Data ───────────────────────────────────────
export interface QuarterData {
  quarter: string;
  period: string;
  revenue: number;
  costs: number;
  gop: number;
  gopMarginPct: number;
  carbonIntensity: number; // kgCO₂e/room-night
  waterIntensity: number;  // L/guest-night
  energyIntensity: number; // kWh/room-night
  utilityCost: number;
  occupancyPct: number;
  actionsDeployed: string[];
  sourceFiles: { name: string; type: "pl" | "utility"; uploadedAt: string }[];
  deltas: {
    gopMargin: number;
    energyCost: number;
    carbonIntensity: number;
    waterIntensity: number;
  };
}

export const mockQuarterlyLedger: QuarterData[] = [
  {
    quarter: "Q1 2025",
    period: "Jan – Mar 2025",
    revenue: 801100,
    costs: 457150,
    gop: 343950,
    gopMarginPct: 42.9,
    carbonIntensity: 38,
    waterIntensity: 410,
    energyIntensity: 34,
    utilityCost: 33600,
    occupancyPct: 68,
    actionsDeployed: [],
    sourceFiles: [
      { name: "PL_Q1_2025.xlsx", type: "pl", uploadedAt: "2025-04-05" },
      { name: "Utilities_Q1_2025.csv", type: "utility", uploadedAt: "2025-04-06" },
    ],
    deltas: { gopMargin: 0, energyCost: 0, carbonIntensity: 0, waterIntensity: 0 },
  },
  {
    quarter: "Q2 2025",
    period: "Apr – Jun 2025",
    revenue: 952400,
    costs: 553200,
    gop: 399200,
    gopMarginPct: 41.9,
    carbonIntensity: 36,
    waterIntensity: 395,
    energyIntensity: 32,
    utilityCost: 35100,
    occupancyPct: 76,
    actionsDeployed: ["Deployed smart HVAC scheduling"],
    sourceFiles: [
      { name: "PL_Q2_2025.xlsx", type: "pl", uploadedAt: "2025-07-04" },
      { name: "Utilities_Q2_2025.csv", type: "utility", uploadedAt: "2025-07-05" },
    ],
    deltas: { gopMargin: -1.0, energyCost: 4.5, carbonIntensity: -5.3, waterIntensity: -3.7 },
  },
  {
    quarter: "Q3 2025",
    period: "Jul – Sep 2025",
    revenue: 1095200,
    costs: 631600,
    gop: 463600,
    gopMarginPct: 42.3,
    carbonIntensity: 32,
    waterIntensity: 520,
    energyIntensity: 29,
    utilityCost: 31200,
    occupancyPct: 84,
    actionsDeployed: ["LED retrofit — corridors & lobby"],
    sourceFiles: [
      { name: "PL_Q3_2025.xlsx", type: "pl", uploadedAt: "2025-10-03" },
      { name: "Utilities_Q3_2025.csv", type: "utility", uploadedAt: "2025-10-04" },
    ],
    deltas: { gopMargin: 0.4, energyCost: -11.1, carbonIntensity: -11.1, waterIntensity: 31.6 },
  },
  {
    quarter: "Q4 2025",
    period: "Oct – Dec 2025",
    revenue: 851600,
    costs: 498300,
    gop: 353300,
    gopMarginPct: 41.5,
    carbonIntensity: 30,
    waterIntensity: 380,
    energyIntensity: 27,
    utilityCost: 28900,
    occupancyPct: 71,
    actionsDeployed: ["Low-flow showerheads installed", "Linen reuse programme launched"],
    sourceFiles: [
      { name: "PL_Q4_2025.xlsx", type: "pl", uploadedAt: "2026-01-06" },
      { name: "Utilities_Q4_2025.csv", type: "utility", uploadedAt: "2026-01-07" },
    ],
    deltas: { gopMargin: -0.8, energyCost: -7.4, carbonIntensity: -6.3, waterIntensity: -26.9 },
  },
];

// ─── Double Materiality Matrix Data ──────────────────────────────
export interface MaterialityDimension {
  id: string;
  label: string;
  environmentalImpact: number; // 0–100 X-axis
  financialImpact: number;     // 0–100 Y-axis
  currentCost: number;         // bubble size
  financialRisk: string;
  impactRisk: string;
  trend: "improving" | "stable" | "worsening";
}

export const mockMaterialityDimensions: MaterialityDimension[] = [
  {
    id: "energy",
    label: "Energy Consumption",
    environmentalImpact: 72,
    financialImpact: 68,
    currentCost: 134400,
    financialRisk: "Currently 8% of total revenue. Projected to hit 11% by 2028 due to grid price hikes.",
    impactRisk: "Current intensity 34 kWh/room (Mid). 15% above 2030 sector pathway.",
    trend: "improving",
  },
  {
    id: "water",
    label: "Water Scarcity",
    environmentalImpact: 58,
    financialImpact: 42,
    currentCost: 48200,
    financialRisk: "3% of revenue. Moderate risk — water tariffs stable but scarcity premiums expected in Med region.",
    impactRisk: "380 L/guest-night. 27% above frontrunner benchmark for mid-scale.",
    trend: "improving",
  },
  {
    id: "waste",
    label: "Food Waste",
    environmentalImpact: 45,
    financialImpact: 52,
    currentCost: 62000,
    financialRisk: "F&B waste runs at 34% of food cost. Portion optimisation could save €2,100/mo.",
    impactRisk: "1.2 kg/room-night. At industry average — room for improvement.",
    trend: "stable",
  },
  {
    id: "labor",
    label: "Labor & Fair Pay",
    environmentalImpact: 25,
    financialImpact: 82,
    currentCost: 180000,
    financialRisk: "42% of total costs. Labor inflation at +4.2% YoY. Highest single cost category.",
    impactRisk: "Social dimension — living wage compliance verified. Low environmental footprint.",
    trend: "worsening",
  },
  {
    id: "carbon",
    label: "Carbon Emissions",
    environmentalImpact: 85,
    financialImpact: 55,
    currentCost: 28900,
    financialRisk: "Direct cost low, but EU ETS exposure starting 2027. Carbon tax risk: +€15K/yr.",
    impactRisk: "30 kgCO₂e/room-night. On track for 2030 pathway but margin is thin.",
    trend: "improving",
  },
];

// ─── CAPEX Roadmap Data ──────────────────────────────────────────
export interface CAPEXAction {
  id: string;
  action: string;
  materialityTarget: string;
  capex: number;
  financialROI: number;     // payback months
  impactROI: string;        // e.g. "-15% kgCO₂e/room"
  status: "Planned" | "In Progress" | "Deployed - Tracking";
  deployedQuarter?: string;
  predicted: number[];      // monthly savings predicted
  actual: number[];         // monthly savings actual (for deployed)
  co2Reduction: number;     // kg/year
  waterSaving: number;      // m³/year
}

export const mockCAPEXActions: CAPEXAction[] = [
  {
    id: "1",
    action: "Dynamic chiller sequencing (BMS upgrade)",
    materialityTarget: "Energy",
    capex: 45000,
    financialROI: 14,
    impactROI: "-18% kgCO₂e/room",
    status: "Planned",
    predicted: [2800, 2800, 2800, 3000, 3200, 3200],
    actual: [],
    co2Reduction: 2400,
    waterSaving: 0,
  },
  {
    id: "2",
    action: "LED retrofit — guestrooms & corridors",
    materialityTarget: "Energy",
    capex: 22000,
    financialROI: 8,
    impactROI: "-15% energy intensity",
    status: "Deployed - Tracking",
    deployedQuarter: "Q3 2025",
    predicted: [960, 960, 960, 960, 960, 960],
    actual: [920, 980, 1010, 1050, 980, 940],
    co2Reduction: 1200,
    waterSaving: 0,
  },
  {
    id: "3",
    action: "IoT water meters (per-floor monitoring)",
    materialityTarget: "Water",
    capex: 18000,
    financialROI: 12,
    impactROI: "-20% water per guest-night",
    status: "In Progress",
    predicted: [600, 700, 750, 800, 800, 800],
    actual: [],
    co2Reduction: 180,
    waterSaving: 420,
  },
  {
    id: "4",
    action: "Low-flow showerheads & sensor taps",
    materialityTarget: "Water",
    capex: 8500,
    financialROI: 6,
    impactROI: "-15% water consumption",
    status: "Deployed - Tracking",
    deployedQuarter: "Q4 2025",
    predicted: [720, 720, 720, 720, 720, 720],
    actual: [680, 710, 750, 740],
    co2Reduction: 90,
    waterSaving: 360,
  },
  {
    id: "5",
    action: "Smart HVAC occupancy controls",
    materialityTarget: "Energy",
    capex: 35000,
    financialROI: 10,
    impactROI: "-12% energy intensity",
    status: "Deployed - Tracking",
    deployedQuarter: "Q2 2025",
    predicted: [1700, 1700, 1700, 1700, 1700, 1700],
    actual: [1580, 1650, 1720, 1780, 1810, 1750, 1690, 1720],
    co2Reduction: 1800,
    waterSaving: 0,
  },
  {
    id: "6",
    action: "Renewable energy tariff switch",
    materialityTarget: "Carbon",
    capex: 0,
    financialROI: 0,
    impactROI: "-25% carbon intensity",
    status: "Planned",
    predicted: [0, 0, 0, 0, 0, 0],
    actual: [],
    co2Reduction: 3600,
    waterSaving: 0,
  },
];

// ─── CSRD Reporting Readiness ────────────────────────────────────
export interface ReportingDataPoint {
  id: string;
  label: string;
  standard: string; // ESRS reference
  status: "complete" | "partial" | "missing";
  coverage: string;
  detail: string;
}

export const mockReportingReadiness: ReportingDataPoint[] = [
  { id: "1", label: "Financial P&L Data", standard: "ESRS E1-6", status: "complete", coverage: "Q1–Q4 2025", detail: "4 quarterly uploads processed. 4,680 rows across 8 USALI departments." },
  { id: "2", label: "Utilities & Energy Data", standard: "ESRS E1-5", status: "complete", coverage: "Q1–Q4 2025", detail: "Electricity, gas, and water consumption per quarter. Grid factor applied." },
  { id: "3", label: "Water Consumption Data", standard: "ESRS E3-4", status: "complete", coverage: "Q1–Q4 2025", detail: "Municipal supply metered. No grey/rainwater reuse data." },
  { id: "4", label: "Scope 1 Emissions (Direct)", standard: "ESRS E1-4", status: "partial", coverage: "Q1–Q3 2025", detail: "Gas boiler & fleet fuel. Missing: refrigerant leakage data for Q4." },
  { id: "5", label: "Scope 2 Emissions (Grid)", standard: "ESRS E1-4", status: "complete", coverage: "Q1–Q4 2025", detail: "Market-based and location-based calculated from IEA grid factors." },
  { id: "6", label: "Scope 3 Estimates (Supply Chain)", standard: "ESRS E1-6", status: "missing", coverage: "—", detail: "Missing linen supplier data, F&B sourcing breakdown, and guest transport estimates." },
  { id: "7", label: "Waste Generation Data", standard: "ESRS E5-5", status: "partial", coverage: "Q2–Q4 2025", detail: "General waste tracked. Missing: hazardous waste classification and recycling rates." },
  { id: "8", label: "Social & Governance (S1/G1)", standard: "ESRS S1, G1", status: "missing", coverage: "—", detail: "Employee data, pay ratios, training hours not yet uploaded." },
];

// ─── Data Vault (uploaded files) ─────────────────────────────────
export interface VaultFile {
  id: string;
  name: string;
  type: "pl" | "utility" | "other";
  uploadedAt: string;
  period: string;
  rows: number;
  status: "processed" | "processing" | "error";
  anomalies: { row: number; field: string; message: string; severity: "warning" | "critical" }[];
}

export const mockVaultFiles: VaultFile[] = [
  {
    id: "f1", name: "PL_Q4_2025.xlsx", type: "pl", uploadedAt: "2026-01-06",
    period: "Q4 2025", rows: 1170, status: "processed", anomalies: [],
  },
  {
    id: "f2", name: "Utilities_Q4_2025.csv", type: "utility", uploadedAt: "2026-01-07",
    period: "Q4 2025", rows: 48, status: "processed", anomalies: [],
  },
  {
    id: "f3", name: "PL_Q3_2025.xlsx", type: "pl", uploadedAt: "2025-10-03",
    period: "Q3 2025", rows: 1165, status: "processed", anomalies: [],
  },
  {
    id: "f4", name: "Utilities_Q3_2025.csv", type: "utility", uploadedAt: "2025-10-04",
    period: "Q3 2025", rows: 52, status: "processed",
    anomalies: [
      { row: 34, field: "water_m3", message: "Q3 water bill implies 520 L/guest-night — a 31.6% spike from Q2. Possible leak or data entry error.", severity: "critical" },
    ],
  },
  {
    id: "f5", name: "PL_Q2_2025.xlsx", type: "pl", uploadedAt: "2025-07-04",
    period: "Q2 2025", rows: 1180, status: "processed", anomalies: [],
  },
  {
    id: "f6", name: "Utilities_Q2_2025.csv", type: "utility", uploadedAt: "2025-07-05",
    period: "Q2 2025", rows: 45, status: "processed", anomalies: [],
  },
  {
    id: "f7", name: "PL_Q1_2025.xlsx", type: "pl", uploadedAt: "2025-04-05",
    period: "Q1 2025", rows: 1150, status: "processed", anomalies: [],
  },
  {
    id: "f8", name: "Utilities_Q1_2025.csv", type: "utility", uploadedAt: "2025-04-06",
    period: "Q1 2025", rows: 44, status: "processed",
    anomalies: [
      { row: 12, field: "kwh", message: "Electricity reading 15% higher than seasonal norm. Verify meter reading.", severity: "warning" },
    ],
  },
];
