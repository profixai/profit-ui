// Portugal Hotel Benchmark Bible — Data Layer
// All figures sourced from INE, DREM, SREA, Banco de Portugal, HotStats, BEONx,
// Horwath HTL, AHP, JLL, HVS, CBRE, HOTREC, EU BEMP, Shiji ReviewPro

export interface Region {
  name: string;
  revpar_2024: number;
  revpar_2025: number;
  revpar_yoy: number;
  adr_2024: number;
  adr_2025: number;
  occupancy_2024: number;
  occupancy_2025: number;
  alos: number;
  summer_occ_2025: number;
  summer_adr_2025: number;
  seasonality_ratio: number;
  domestic_share: number;
  top_foreign: string;
  top_foreign_share: number;
  risk_profile: "low" | "moderate" | "high" | "very_high";
  solar_yield: number;
  trend_note: string;
  opportunity: string;
  watchouts: string[];
}

export const REGIONS: Record<string, Region> = {
  "grande-lisboa": {
    name: "Grande Lisboa",
    revpar_2024: 106.61, revpar_2025: 105.83, revpar_yoy: -0.7,
    adr_2024: 149.90, adr_2025: 150.00,
    occupancy_2024: 71.1, occupancy_2025: 71.5,
    alos: 2.7,
    summer_occ_2025: 86, summer_adr_2025: 176,
    seasonality_ratio: 3.0,
    domestic_share: 18.6,
    top_foreign: "USA", top_foreign_share: 16.8,
    risk_profile: "high",
    solar_yield: 1650,
    trend_note: "Only region in Portugal with declining RevPAR in 2025 (-0.7%). AHP describes the market as plateaued — airport capacity is the bottleneck and Q4 2025 RevPAR fell -8.8% in November.",
    opportunity: "Direct-booking strategies + US visitor capture (US arrivals +13% YoY).",
    watchouts: [
      "Lisbon plateau confirmed by AHP — limited rate-rise headroom",
      "High USD/international exposure (USA 16.8% top market)",
      "Airport capacity constrains volume growth"
    ]
  },
  "madeira": {
    name: "Madeira",
    revpar_2024: 83.53, revpar_2025: 97.61, revpar_yoy: 16.8,
    adr_2024: 109.28, adr_2025: 125.11,
    occupancy_2024: 76.4, occupancy_2025: 77.5,
    alos: 4.58,
    summer_occ_2025: 91, summer_adr_2025: 140,
    seasonality_ratio: 2.0,
    domestic_share: 17.5,
    top_foreign: "Germany", top_foreign_share: 23.8,
    risk_profile: "high",
    solar_yield: 1700,
    trend_note: "National leader in RevPAR growth (+16.8% YoY). Hotels-only RevPAR €104.83 (+17.2%). Year-round consistency, not seasonal peaks — the region's defining advantage. Q3 2025 domestic stays surged +40.2%.",
    opportunity: "Continue domestic capture + premium positioning. 5-star Q3 RevPAR €194.58 shows luxury headroom.",
    watchouts: [
      "High German market exposure (23.8%)",
      "Wage costs higher (regional min wage €980 vs €920 mainland)",
      "Limited new supply could pressure rates"
    ]
  },
  "algarve": {
    name: "Algarve",
    revpar_2024: 74.39, revpar_2025: 78.10, revpar_yoy: 5.0,
    adr_2024: 126.79, adr_2025: 133.00,
    occupancy_2024: 58.7, occupancy_2025: 58.9,
    alos: 4.8,
    summer_occ_2025: 88, summer_adr_2025: 206,
    seasonality_ratio: 8.5,
    domestic_share: 30,
    top_foreign: "United Kingdom", top_foreign_share: 35.9,
    risk_profile: "very_high",
    solar_yield: 1700,
    trend_note: "AHP 'star of summer 2025' — occupancy 88%, ADR €206. 2024 regional occupancy 59% (all-time high). +3% new supply growth in 2025 and 2,200 rooms under renovation. United Airlines Newark-Faro 4x weekly is driving US demand.",
    opportunity: "US incentive/sports market growth + shoulder season extension. January RevPAR is €21 vs August €178 — massive shoulder upside.",
    watchouts: [
      "Extreme seasonality 8.5x (Aug vs Jan)",
      "Heavy UK/GBP exposure (35.9% top market) — Brexit/currency risk",
      "New supply pressure — competitive ADR risk"
    ]
  },
  "acores": {
    name: "Açores",
    revpar_2024: 62.85, revpar_2025: 65.00, revpar_yoy: 4.0,
    adr_2024: 112.76, adr_2025: 143.00,
    occupancy_2024: 55.7, occupancy_2025: 55.0,
    alos: 3.32,
    summer_occ_2025: 86, summer_adr_2025: 143,
    seasonality_ratio: 2.8,
    domestic_share: 40,
    top_foreign: "USA", top_foreign_share: 17.0,
    risk_profile: "moderate",
    solar_yield: 1500,
    trend_note: "2025 regional overnight stays +4.5%, room revenue growth +7.6% (SREA). Summer 2025 ADR rose to €143 but occupancy softened. Strong US connection (top foreign market).",
    opportunity: "Domestic Easter/winter base + nature/wellness positioning. Regional ADR rising fastest in shoulder months.",
    watchouts: [
      "Air connectivity in low season constrains demand",
      "Wage costs higher (regional min wage €966)",
      "Labor shortages frequently flagged by sector"
    ]
  },
  "norte": {
    name: "Norte (Porto e Norte)",
    revpar_2024: 60.56, revpar_2025: 65.40, revpar_yoy: 8.0,
    adr_2024: 106.49, adr_2025: 110.00,
    occupancy_2024: 53.1, occupancy_2025: 59.5,
    alos: 2.1,
    summer_occ_2025: 76, summer_adr_2025: 130,
    seasonality_ratio: 3.5,
    domestic_share: 50,
    top_foreign: "Spain", top_foreign_share: 16.7,
    risk_profile: "moderate",
    solar_yield: 1450,
    trend_note: "Porto RevPAR €65.40 (+8% YoY) — Norte was the largest absolute growth engine in Portugal in 2025. Hotel revenues +12% (Horwath HTL). Vila Nova de Gaia and Porto both posted strong overnight stay gains.",
    opportunity: "Largest growth engine of Portugal — capture momentum. Diversified source markets reduce risk.",
    watchouts: [
      "24 new hotels in pipeline — supply pressure ahead",
      "Lower ALOS (~2.1 nights) limits room-revenue uplift",
      "Q1 weather can drag shoulder season"
    ]
  },
  "setubal": {
    name: "Península de Setúbal",
    revpar_2024: 53.62, revpar_2025: 61.13, revpar_yoy: 14.0,
    adr_2024: 92.04, adr_2025: 100.00,
    occupancy_2024: 58.3, occupancy_2025: 61.1,
    alos: 2.3,
    summer_occ_2025: 84, summer_adr_2025: 130,
    seasonality_ratio: 3.2,
    domestic_share: 55,
    top_foreign: "Spain", top_foreign_share: 18.0,
    risk_profile: "low",
    solar_yield: 1650,
    trend_note: "RevPAR +14% YoY — strongest secondary-region growth in Portugal. Lisbon spillover plus domestic demand. Comporta investment activity is heating up (Q4 2025 prime asset sale).",
    opportunity: "Capture Lisbon overflow + domestic premium (Comporta effect). Wellness/coastal positioning.",
    watchouts: [
      "Limited international airline access",
      "Seasonal staffing — coastal demand spikes",
      "Watch for over-pricing as Lisbon plateaus"
    ]
  },
  "alentejo": {
    name: "Alentejo",
    revpar_2024: 48.82, revpar_2025: 52.09, revpar_yoy: 6.7,
    adr_2024: 118.59, adr_2025: 124.00,
    occupancy_2024: 41.2, occupancy_2025: 42.0,
    alos: 1.9,
    summer_occ_2025: 72, summer_adr_2025: 195,
    seasonality_ratio: 5.0,
    domestic_share: 66.8,
    top_foreign: "Spain", top_foreign_share: 18.2,
    risk_profile: "low",
    solar_yield: 1700,
    trend_note: "RevPAR +6.7% YoY. Q3 2025 domestic stays +7.3%, international +5.7%. November 2025 overnight stays +4.9% — strongest in Portugal. Rural and wellness positioning is resonating.",
    opportunity: "Wellness, gastronomy, weddings, MICE — premium niches with strong ADR (summer €195). Low international exposure = stable demand.",
    watchouts: [
      "Lowest occupancy nationally (41-42%) — fixed-cost leverage critical",
      "Short ALOS (1.9 nights) constrains operational efficiency",
      "High seasonality 5.0x — winter staffing challenge"
    ]
  },
  "oeste-vale-tejo": {
    name: "Oeste e Vale do Tejo",
    revpar_2024: 33.92, revpar_2025: 38.33, revpar_yoy: 13.0,
    adr_2024: 79.05, adr_2025: 84.00,
    occupancy_2024: 42.9, occupancy_2025: 45.6,
    alos: 1.7,
    summer_occ_2025: 62, summer_adr_2025: 100,
    seasonality_ratio: 3.0,
    domestic_share: 55,
    top_foreign: "Spain", top_foreign_share: 22.5,
    risk_profile: "low",
    solar_yield: 1600,
    trend_note: "RevPAR +13% YoY — a secondary-region outperformer. Q3 2025 saw strong domestic stay growth per INE. Touring and nature routes are gaining visibility.",
    opportunity: "Domestic touring + Spanish weekend traffic. Heritage destinations (Óbidos, Fátima, Tomar). Low-cost expansion.",
    watchouts: [
      "Shortest ALOS in Portugal (~1.7 nights) — high turnover costs",
      "Lowest ADR (~€84) limits absolute revenue",
      "Limited brand recognition for premium positioning"
    ]
  },
  "centro": {
    name: "Centro",
    revpar_2024: 32.86, revpar_2025: 35.32, revpar_yoy: 7.5,
    adr_2024: 81.81, adr_2025: 86.00,
    occupancy_2024: 40.2, occupancy_2025: 41.1,
    alos: 1.62,
    summer_occ_2025: 56, summer_adr_2025: 109,
    seasonality_ratio: 3.2,
    domestic_share: 68.2,
    top_foreign: "Spain", top_foreign_share: 24.6,
    risk_profile: "low",
    solar_yield: 1550,
    trend_note: "RevPAR +7.5% YoY but the only region with declining overnight stays in Q3 2025. Summer 2025 occupancy fell to 56% while ADR rose to €109. November 2025 stays -4.6% — watch closely.",
    opportunity: "Most insulated from international shocks (68.2% domestic). Cultural/gastronomy/university towns. Strong Spanish weekend market.",
    watchouts: [
      "Lowest occupancy and shortest ALOS in Portugal",
      "Cooling demand signals in late 2025 — monitor closely",
      "Limited brand pipeline reduces market visibility"
    ]
  }
};

export interface StarCategory {
  label: string;
  name: string;
  adr_multiplier: number;
  occ_uplift: number;
  staff_per_room: number;
  payroll_pct: number;
  rooms_revenue_share: number;
  fb_revenue_share: number;
  other_revenue_share: number;
  gop_margin: number;
  maintenance_pct: number;
  energy_pct: number;
  hk_rooms_per_shift: number;
  fb_cost_pct: number;
  sm_pct: number;
  notes: string;
}

export const STAR_CATEGORIES: Record<string, StarCategory> = {
  "1": {
    label: "1–2 Stars (Budget)",
    name: "Budget / Economy",
    adr_multiplier: 0.55,
    occ_uplift: -2,
    staff_per_room: 0.4,
    payroll_pct: 0.20,
    rooms_revenue_share: 0.73,
    fb_revenue_share: 0.12,
    other_revenue_share: 0.15,
    gop_margin: 0.41,
    maintenance_pct: 0.04,
    energy_pct: 0.045,
    hk_rooms_per_shift: 19,
    fb_cost_pct: 0.28,
    sm_pct: 0.03,
    notes: "Lean operations, often owner-operated. Highest GOP margins from low labor intensity."
  },
  "3": {
    label: "3 Stars (Midscale)",
    name: "3-Star Midscale",
    adr_multiplier: 0.80,
    occ_uplift: 0,
    staff_per_room: 0.65,
    payroll_pct: 0.255,
    rooms_revenue_share: 0.625,
    fb_revenue_share: 0.225,
    other_revenue_share: 0.15,
    gop_margin: 0.37,
    maintenance_pct: 0.045,
    energy_pct: 0.05,
    hk_rooms_per_shift: 15,
    fb_cost_pct: 0.31,
    sm_pct: 0.045,
    notes: "Sweet spot for Portuguese independents (20–60 rooms). Banco de Portugal Pequena enterprises average 32.5% EBITDA margin here."
  },
  "4": {
    label: "4 Stars (Upscale)",
    name: "4-Star Upscale",
    adr_multiplier: 1.00,
    occ_uplift: 2,
    staff_per_room: 1.00,
    payroll_pct: 0.30,
    rooms_revenue_share: 0.585,
    fb_revenue_share: 0.285,
    other_revenue_share: 0.13,
    gop_margin: 0.35,
    maintenance_pct: 0.05,
    energy_pct: 0.05,
    hk_rooms_per_shift: 14,
    fb_cost_pct: 0.32,
    sm_pct: 0.05,
    notes: "Largest segment in Portugal (47% of rooms). Full-service expectations drive labor up. F&B becomes meaningful."
  },
  "5": {
    label: "5 Stars (Luxury)",
    name: "5-Star Luxury",
    adr_multiplier: 1.45,
    occ_uplift: 4,
    staff_per_room: 1.25,
    payroll_pct: 0.325,
    rooms_revenue_share: 0.54,
    fb_revenue_share: 0.32,
    other_revenue_share: 0.14,
    gop_margin: 0.36,
    maintenance_pct: 0.065,
    energy_pct: 0.055,
    hk_rooms_per_shift: 13,
    fb_cost_pct: 0.32,
    sm_pct: 0.055,
    notes: "60% of Portugal's pipeline is 5-star — competitive supply growth ahead. Higher staffing but premium ADRs."
  }
};

export interface SizeClass {
  code: string;
  name: string;
  suppliers: number;
  payroll: number;
  ebitda: number;
  ebit: number;
  net: number;
}

export type SizeClassCode = "micro" | "pequena" | "media" | "grande";

export function getSizeClass(rooms: number, staffPerRoom: number): SizeClass {
  const employees = Math.round(rooms * staffPerRoom);
  if (employees < 10) return {
    code: "micro", name: "Microempresa (<10 employees)",
    suppliers: 0.29, payroll: 0.18, ebitda: 0.173, ebit: 0.07, net: 0.024
  };
  if (employees < 50) return {
    code: "pequena", name: "Pequena (10–49 employees)",
    suppliers: 0.442, payroll: 0.249, ebitda: 0.325, ebit: 0.231, net: 0.155
  };
  if (employees < 250) return {
    code: "media", name: "Média (50–249 employees)",
    suppliers: 0.456, payroll: 0.242, ebitda: 0.292, ebit: 0.204, net: 0.126
  };
  return {
    code: "grande", name: "Grande (250+ employees)",
    suppliers: 0.466, payroll: 0.222, ebitda: 0.306, ebit: 0.244, net: 0.184
  };
}

// Wage costs by region (Banco de Portugal 2026 hospitality CBA)
export const WAGE_COST = {
  mainland: 15939,
  madeira: 16979,
  acores: 16736
};

export function getRegionWageCost(regionId: string): number {
  if (regionId === "madeira") return WAGE_COST.madeira;
  if (regionId === "acores") return WAGE_COST.acores;
  return WAGE_COST.mainland;
}

// Sustainability benchmarks (EU BEMP)
export const SUSTAINABILITY = {
  energy_kwh_m2: { excellent: 180, good: 240, average: 273, poor: 330 },
  water_l_gn: { excellent: 140, efficient: 300, average: 500 },
  waste_kg_gn: { excellent: 0.6, good: 0.8, average: 1.0 },
  co2_kg_gn: { excellent: 5, good: 15, average: 30 }
};

// National 2025 benchmarks
export const NATIONAL = {
  revpar_2025: 72.38,
  adr_2025: 120.00,
  occupancy_2025: 57.9,
  revpar_yoy: 4.3,
  adr_yoy: 4.0,
  total_revenue: 7.2,
  total_overnights: 82.1,
  domestic_growth: 5.4,
  intl_growth: 0.8,
  ebitda_median: 0.209,
  gop_europe: 0.37,
  gop_southern_europe: 0.42
};
