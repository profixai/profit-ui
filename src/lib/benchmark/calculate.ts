import {
  REGIONS,
  STAR_CATEGORIES,
  NATIONAL,
  Region,
  StarCategory,
  SizeClass,
  getSizeClass,
  getRegionWageCost,
} from './data';

export interface BenchmarkResult {
  inputs: { rooms: number; starCode: string; regionId: string };
  region: Region;
  star: StarCategory;
  sizeClass: SizeClass;
  revpar: number;
  adr: number;
  occupancy: number;
  annualRoomNights: number;
  revenue: {
    total: number;
    rooms: number;
    fb: number;
    other: number;
  };
  pnl: {
    revenue: number;
    suppliers: number;
    payroll: number;
    energy: number;
    maintenance: number;
    sm: number;
    admin: number;
    ebitda: number;
    ebit: number;
    netIncome: number;
    ebitdaMargin: number;
  };
  staffing: {
    total: number;
    fb: number;
    housekeeping: number;
    frontOffice: number;
    admin: number;
    maintenance: number;
    laborCostPerYear: number;
    wagePerStaffYear: number;
  };
  goppar: number;
}

export interface Watchout {
  severity: string;
  text: string;
}

export interface Opportunity {
  icon: string;
  title: string;
  text: string;
}

export interface SustainabilityResult {
  annualOvernights: number;
  estimatedM2: number;
  energyTarget: number;
  energyKwh: number;
  energyCostEst: number;
  annualCo2: number;
  waterPerGn: number;
  annualWaterM3: number;
}

// ============================================================
// Calculation Engine
// ============================================================

export function calculateBenchmark(rooms: number, starCode: string, regionId: string): BenchmarkResult {
  const region = REGIONS[regionId];
  const star = STAR_CATEGORIES[starCode];

  // ADR / RevPAR / Occupancy — adjusted for star
  const adr = region.adr_2025 * star.adr_multiplier;
  const occupancy = Math.min(95, Math.max(20, region.occupancy_2025 + star.occ_uplift));
  const revpar = adr * (occupancy / 100);

  // Annual revenue
  const annualRoomNights = rooms * 365;
  const roomsRevenue = revpar * annualRoomNights;
  const totalRevenue = roomsRevenue / star.rooms_revenue_share;
  const fbRevenue = totalRevenue * star.fb_revenue_share;
  const otherRevenue = totalRevenue * star.other_revenue_share;

  // Staffing
  const totalStaff = Math.round(rooms * star.staff_per_room);
  const sizeClass = getSizeClass(rooms, star.staff_per_room);
  const wagePerStaffYear = getRegionWageCost(regionId);
  const directLaborCost = totalStaff * wagePerStaffYear;

  // P&L (% of total revenue, using Banco de Portugal size-class ratios)
  const suppliersCost = totalRevenue * sizeClass.suppliers;
  // Use the higher of size-class payroll % and actual staff cost
  const calculatedPayrollPct = directLaborCost / totalRevenue;
  const payrollPct = Math.max(sizeClass.payroll, Math.min(0.40, calculatedPayrollPct));
  const payrollCost = totalRevenue * payrollPct;

  const energyCost = totalRevenue * star.energy_pct;
  const maintenanceCost = totalRevenue * star.maintenance_pct;
  const smCost = totalRevenue * star.sm_pct;
  const adminCost = totalRevenue * 0.085;

  // EBITDA per Banco de Portugal benchmarks
  const ebitdaMargin = sizeClass.ebitda;
  const ebitda = totalRevenue * ebitdaMargin;
  const ebit = totalRevenue * sizeClass.ebit;
  const netIncome = totalRevenue * sizeClass.net;

  // GOPPAR
  const goppar = (totalRevenue * star.gop_margin) / annualRoomNights;

  // Departmental staffing split
  const fbStaff = Math.round(totalStaff * 0.45);
  const housekeepingStaff = Math.max(1, Math.ceil(rooms / star.hk_rooms_per_shift) * 2);
  const frontOfficeStaff = Math.max(2, Math.ceil(rooms / 50) * 3);
  const adminStaff = Math.max(1, Math.round(totalStaff * 0.04));
  const maintenanceStaff = Math.max(1, Math.round(rooms / 75));

  return {
    inputs: { rooms, starCode, regionId },
    region, star, sizeClass,
    revpar, adr, occupancy,
    annualRoomNights,
    revenue: {
      total: totalRevenue,
      rooms: roomsRevenue,
      fb: fbRevenue,
      other: otherRevenue
    },
    pnl: {
      revenue: totalRevenue,
      suppliers: suppliersCost,
      payroll: payrollCost,
      energy: energyCost,
      maintenance: maintenanceCost,
      sm: smCost,
      admin: adminCost,
      ebitda, ebit, netIncome,
      ebitdaMargin
    },
    staffing: {
      total: totalStaff,
      fb: fbStaff,
      housekeeping: housekeepingStaff,
      frontOffice: frontOfficeStaff,
      admin: adminStaff,
      maintenance: maintenanceStaff,
      laborCostPerYear: directLaborCost,
      wagePerStaffYear
    },
    goppar
  };
}

// ============================================================
// Watch-outs Engine — personalized warnings
// ============================================================

export function generateWatchouts(b: BenchmarkResult): Watchout[] {
  const watchouts: Watchout[] = [];

  // Region-specific
  b.region.watchouts.forEach(w => watchouts.push({ severity: "regional", text: w }));

  // Size-related
  if (b.sizeClass.code === "micro") {
    watchouts.push({ severity: "size", text: "Microempresa scale shows notably lower EBITDA (17.3%) vs Pequena (32.5%). Consider whether you can grow to 10+ employees or focus on owner-operated efficiency." });
  }

  // Occupancy
  if (b.occupancy < 50) {
    watchouts.push({ severity: "operational", text: `Occupancy of ${b.occupancy.toFixed(1)}% is below 50% — fixed-cost leverage is critical. Focus on revenue management and seasonal pricing.` });
  }

  // ADR positioning
  const nationalAdr = NATIONAL.adr_2025;
  if (b.adr < nationalAdr * 0.7) {
    watchouts.push({ severity: "positioning", text: `Your ADR of €${b.adr.toFixed(0)} is well below national average (€${nationalAdr}). Star upgrade or repositioning may unlock 10–20% ADR lift.` });
  }

  // OTA dependency warning
  if (b.inputs.rooms < 20) {
    watchouts.push({ severity: "distribution", text: "Hotels with <20 rooms typically have 54%+ OTA share. Aggressive direct-booking strategy is essential — EU DMA now allows lower direct rates than Booking.com." });
  }

  // High seasonality
  if (b.region.seasonality_ratio >= 5) {
    watchouts.push({ severity: "seasonal", text: `Extreme seasonality (${b.region.seasonality_ratio}x peak-to-trough). Year-round staff retention, off-season closure, and shoulder-month strategies are critical decisions.` });
  }

  // EBITDA reality check
  if (b.pnl.ebitdaMargin < NATIONAL.ebitda_median) {
    watchouts.push({ severity: "financial", text: `Modeled EBITDA margin (${(b.pnl.ebitdaMargin*100).toFixed(1)}%) is below national median (20.9%). Top-quartile hotels achieve 38%+ — significant improvement room.` });
  }

  // 2025 plateau warning
  if (b.region.revpar_yoy < 0) {
    watchouts.push({ severity: "trend", text: "Your region is the ONLY one in Portugal with declining RevPAR in 2025. Don't rely on rate growth — focus on cost discipline and ancillary revenue." });
  }

  return watchouts;
}

// ============================================================
// Opportunities Engine
// ============================================================

export function generateOpportunities(b: BenchmarkResult): Opportunity[] {
  const opps: Opportunity[] = [];

  opps.push({ icon: "🎯", title: "Regional opportunity", text: b.region.opportunity });

  // Shoulder season
  opps.push({ icon: "📈", title: "Shoulder season strategy", text: `Strongest 2025 RevPAR growth in shoulder months: April +10.9%, January +10.4%. Your region's ALOS is ${b.region.alos} nights — bundle 2-3 night packages for shoulder demand.` });

  // Domestic engine
  if (b.region.domestic_share > 40) {
    opps.push({ icon: "🇵🇹", title: "Domestic demand engine", text: `Your region is ${b.region.domestic_share}% domestic-dependent. Portuguese travel grew +5.4% in 2025 — direct outreach to PT market is high-ROI.` });
  }

  // Solar
  opps.push({ icon: "☀️", title: "Solar PV payback", text: `Your region's solar yield is ${b.region.solar_yield} kWh/kWp/yr — payback in 4–7 years at €800–1,200/kWp. Hotels have ideal daytime load profile (70–90% self-consumption).` });

  // F&B IVA advantage
  if (parseInt(b.inputs.starCode) >= 3) {
    opps.push({ icon: "🍽️", title: "F&B margin advantage", text: "Portugal's 10% IVA on restaurant services (vs 23% standard) gives F&B operations a strong margin advantage. Banquet/catering growth is +9.5% YoY industry-wide." });
  }

  // Direct booking
  opps.push({ icon: "💻", title: "Direct booking lift", text: "EU DMA (Nov 2024) removed rate parity. You can legally undercut Booking.com on your own site by 5–10%. Direct bookings have ~18% cancellation rate vs OTA ~50%." });

  return opps;
}

// ============================================================
// Sustainability Benchmarks for this property
// ============================================================

export function generateSustainability(b: BenchmarkResult): SustainabilityResult {
  // Approximate annual guest-nights and m2
  const annualOvernights = b.annualRoomNights * (b.occupancy / 100) * 1.6; // ~1.6 guests/room average
  const estimatedM2 = b.inputs.rooms * 40; // ~40m2 per room including common areas

  // Energy benchmark — use Portugal 4-5 star band (165-196 kWh/m2)
  const energyTarget = parseInt(b.inputs.starCode) >= 4 ? 196 : 240;
  const energyKwh = energyTarget * estimatedM2;
  const energyCostEst = energyKwh * 0.108;

  // CO2
  const annualCo2 = (energyKwh * 80) / 1000; // 80 gCO2/kWh Portugal grid

  // Water (l/guest-night)
  const waterPerGn = 250; // efficient operations
  const annualWaterM3 = (annualOvernights * waterPerGn) / 1000;

  return {
    annualOvernights, estimatedM2,
    energyTarget, energyKwh, energyCostEst,
    annualCo2, waterPerGn, annualWaterM3
  };
}

// ============================================================
// Formatting helpers
// ============================================================

export function fmtEur(n: number, decimals = 0): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  if (Math.abs(n) >= 1e6) return `€${(n/1e6).toFixed(2)}M`;
  if (Math.abs(n) >= 1e3) return `€${(n/1e3).toFixed(0)}k`;
  return `€${n.toFixed(decimals)}`;
}

export function fmtEurExact(n: number): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return "€" + Math.round(n).toLocaleString("en-US");
}

export function fmtPct(n: number, decimals = 1): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return `${(n * 100).toFixed(decimals)}%`;
}

export function fmtNum(n: number, decimals = 0): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: decimals });
}
