// ESG Benchmarks — static lookup table keyed by hotel category
// Sources: HCMI, IEA Emission Factors 2025, Hotel Yearbook 2025, HWMI/Made Blue 2024

export type HotelCategory = "budget" | "midscale" | "upscale" | "luxury";

export interface BenchmarkRange {
  frontrunner: number; // top 10%, score = 100
  efficient: number;   // score = 75
  average: number;     // score = 50
  high: number;        // score = 25
  worst: number;       // score = 0
}

export interface CategoryBenchmarks {
  carbon: BenchmarkRange; // kgCO₂e per occupied room-night
  energy: BenchmarkRange; // kWh per occupied room-night
  water: BenchmarkRange;  // litres per guest-night
  waste: BenchmarkRange;  // kg per occupied room-night
}

export const BENCHMARKS: Record<HotelCategory, CategoryBenchmarks> = {
  budget: {
    carbon: { frontrunner: 10, efficient: 15, average: 20, high: 25, worst: 35 },
    energy: { frontrunner: 12, efficient: 18, average: 22, high: 28, worst: 40 },
    water:  { frontrunner: 140, efficient: 200, average: 300, high: 450, worst: 600 },
    waste:  { frontrunner: 0.3, efficient: 0.6, average: 1.0, high: 1.5, worst: 2.5 },
  },
  midscale: {
    carbon: { frontrunner: 20, efficient: 28, average: 35, high: 45, worst: 60 },
    energy: { frontrunner: 20, efficient: 28, average: 35, high: 45, worst: 65 },
    water:  { frontrunner: 150, efficient: 250, average: 380, high: 520, worst: 700 },
    waste:  { frontrunner: 0.5, efficient: 0.8, average: 1.2, high: 2.0, worst: 3.0 },
  },
  upscale: {
    carbon: { frontrunner: 30, efficient: 40, average: 52, high: 65, worst: 85 },
    energy: { frontrunner: 30, efficient: 40, average: 55, high: 70, worst: 90 },
    water:  { frontrunner: 200, efficient: 320, average: 450, high: 600, worst: 850 },
    waste:  { frontrunner: 0.6, efficient: 1.0, average: 1.5, high: 2.5, worst: 4.0 },
  },
  luxury: {
    carbon: { frontrunner: 40, efficient: 55, average: 68, high: 80, worst: 110 },
    energy: { frontrunner: 40, efficient: 55, average: 70, high: 85, worst: 120 },
    water:  { frontrunner: 250, efficient: 400, average: 550, high: 750, worst: 1000 },
    waste:  { frontrunner: 0.8, efficient: 1.2, average: 2.0, high: 3.0, worst: 5.0 },
  },
};

// IEA grid emission factors (gCO₂/kWh) by country
export const GRID_FACTORS: Record<string, number> = {
  FR: 41.3, DE: 331.3, ES: 180, GB: 220, IT: 250, PT: 160,
  AT: 90, CH: 20, NL: 310, BE: 145, SE: 8, NO: 7,
  US: 380, AE: 440, TH: 490, JP: 450, AU: 580, BR: 60,
  GR: 340, TR: 400, HR: 180, CZ: 380, PL: 620, RO: 260,
};

export const COUNTRY_OPTIONS = [
  { code: "FR", name: "France" }, { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" }, { code: "GB", name: "United Kingdom" },
  { code: "IT", name: "Italy" }, { code: "PT", name: "Portugal" },
  { code: "AT", name: "Austria" }, { code: "CH", name: "Switzerland" },
  { code: "NL", name: "Netherlands" }, { code: "BE", name: "Belgium" },
  { code: "SE", name: "Sweden" }, { code: "NO", name: "Norway" },
  { code: "US", name: "United States" }, { code: "AE", name: "UAE" },
  { code: "TH", name: "Thailand" }, { code: "JP", name: "Japan" },
  { code: "AU", name: "Australia" }, { code: "BR", name: "Brazil" },
  { code: "GR", name: "Greece" }, { code: "TR", name: "Turkey" },
  { code: "HR", name: "Croatia" }, { code: "CZ", name: "Czech Republic" },
  { code: "PL", name: "Poland" }, { code: "RO", name: "Romania" },
];

// Score a single value against a benchmark range (lower = better)
export function scoreDimension(value: number, range: BenchmarkRange): number {
  if (value <= range.frontrunner) return 100;
  if (value >= range.worst) return 0;

  // Linear interpolation between thresholds
  const thresholds = [
    { val: range.frontrunner, score: 100 },
    { val: range.efficient, score: 75 },
    { val: range.average, score: 50 },
    { val: range.high, score: 25 },
    { val: range.worst, score: 0 },
  ];

  for (let i = 0; i < thresholds.length - 1; i++) {
    const upper = thresholds[i];
    const lower = thresholds[i + 1];
    if (value >= upper.val && value <= lower.val) {
      const ratio = (value - upper.val) / (lower.val - upper.val);
      return Math.round(upper.score - ratio * (upper.score - lower.score));
    }
  }
  return 50;
}

export type SDGLabel = "Leading" | "On Track" | "Developing" | "At Risk";

export function getSDGLabel(score: number): SDGLabel {
  if (score >= 80) return "Leading";
  if (score >= 60) return "On Track";
  if (score >= 40) return "Developing";
  return "At Risk";
}

export interface ESGScoreResult {
  composite: number;
  carbonIndex: number;
  energyIndex: number;
  waterIndex: number;
  wasteIndex: number;
  sdgLabel: SDGLabel;
  estimatedDimensions: string[];
  carbonValue: number;
  energyValue: number;
  waterValue: number;
  wasteValue: number;
}

export function computeESGScore(
  category: HotelCategory,
  actuals?: { carbon?: number; energy?: number; water?: number; waste?: number }
): ESGScoreResult {
  const bench = BENCHMARKS[category];
  const estimated: string[] = [];

  const carbonValue = actuals?.carbon ?? bench.carbon.average;
  const energyValue = actuals?.energy ?? bench.energy.average;
  const waterValue = actuals?.water ?? bench.water.average;
  const wasteValue = actuals?.waste ?? bench.waste.average;

  if (!actuals?.carbon) estimated.push("carbon");
  if (!actuals?.energy) estimated.push("energy");
  if (!actuals?.water) estimated.push("water");
  if (!actuals?.waste) estimated.push("waste");

  const carbonIndex = scoreDimension(carbonValue, bench.carbon);
  const energyIndex = scoreDimension(energyValue, bench.energy);
  const waterIndex = scoreDimension(waterValue, bench.water);
  const wasteIndex = scoreDimension(wasteValue, bench.waste);

  const composite = Math.round(
    0.40 * carbonIndex + 0.30 * energyIndex + 0.20 * waterIndex + 0.10 * wasteIndex
  );

  return {
    composite,
    carbonIndex,
    energyIndex,
    waterIndex,
    wasteIndex,
    sdgLabel: getSDGLabel(composite),
    estimatedDimensions: estimated,
    carbonValue,
    energyValue,
    waterValue,
    wasteValue,
  };
}

// 2030 pathway: 66% reduction from baseline by 2030
export function computePathway(
  baselineYear: number,
  targetYear: number,
  currentCarbonIndex: number
) {
  const years: { year: number; required: number; projected: number }[] = [];
  const baselineValue = 100; // starting score target
  const target2030Reduction = 0.66;
  const target2030Score = Math.round(baselineValue * target2030Reduction);

  for (let y = baselineYear; y <= 2030; y++) {
    const progress = (y - baselineYear) / (2030 - baselineYear);
    const required = Math.round(baselineValue - progress * (baselineValue - target2030Score));
    // Linear projection from current
    const projProgress = (y - baselineYear) / (targetYear - baselineYear);
    const projected = Math.round(currentCarbonIndex + projProgress * (currentCarbonIndex * 0.15));
    years.push({ year: y, required: Math.min(required, 100), projected: Math.min(projected, 100) });
  }
  return years;
}

// SDG actions by dimension
export interface SDGAction {
  sdg: string;
  dimension: string;
  action: string;
  impact: string;
  indexGain: number;
  source: string;
}

export function getSDGActions(category: HotelCategory, countryCode: string): SDGAction[] {
  const gridFactor = GRID_FACTORS[countryCode] ?? 300;
  const isLowCarbon = gridFactor < 100;

  return [
    {
      sdg: "SDG 7 — Energy",
      dimension: "energy",
      action: "LED retrofit across guestrooms and corridors",
      impact: "−15% energy intensity, +8 pts Energy Index",
      indexGain: 8,
      source: "IEA / Hotel Yearbook 2025",
    },
    {
      sdg: "SDG 7 — Energy",
      dimension: "energy",
      action: "Install smart HVAC controls with occupancy sensors",
      impact: "−12% energy intensity, +6 pts Energy Index",
      indexGain: 6,
      source: "Hotel Yearbook 2025",
    },
    {
      sdg: "SDG 6 — Water",
      dimension: "water",
      action: "Install low-flow showerheads and sensor-controlled taps",
      impact: "−20% water per guest-night, +12 pts Water Index",
      indexGain: 12,
      source: "HWMI / Made Blue 2024",
    },
    {
      sdg: "SDG 6 — Water",
      dimension: "water",
      action: "Implement towel and linen reuse programme",
      impact: "−10% water consumption, +5 pts Water Index",
      indexGain: 5,
      source: "UNWTO SDG Framework",
    },
    {
      sdg: "SDG 13 — Climate",
      dimension: "carbon",
      action: isLowCarbon
        ? `Maintain renewable grid tariff (${countryCode} grid: ${gridFactor} gCO₂/kWh)`
        : `Switch to renewable energy tariff (${countryCode} grid: ${gridFactor} gCO₂/kWh)`,
      impact: isLowCarbon
        ? "Maintain low carbon intensity, +5 pts Carbon Index"
        : "−25% carbon intensity, +15 pts Carbon Index",
      indexGain: isLowCarbon ? 5 : 15,
      source: "IEA Emission Factors 2025",
    },
  ];
}
