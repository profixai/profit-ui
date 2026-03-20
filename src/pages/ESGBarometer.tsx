import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, Area, ComposedChart } from "recharts";
import { Leaf, Zap, Droplets, Trash2, ChevronDown, ArrowRight, AlertTriangle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  type HotelCategory,
  COUNTRY_OPTIONS,
  computeESGScore,
  computePathway,
  getSDGActions,
  BENCHMARKS,
  type ESGScoreResult,
} from "@/lib/esg-benchmarks";

// ─── Circular Gauge ─────────────────────────────────────────────
function ESGGauge({ score, label }: { score: number; label: string }) {
  const radius = 80;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const colorClass =
    score >= 70 ? "text-positive" : score >= 40 ? "text-accent" : "text-destructive";
  const strokeColor =
    score >= 70
      ? "hsl(152 63% 29%)"
      : score >= 40
        ? "hsl(37 78% 56%)"
        : "hsl(4 70% 46%)";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={stroke}
          />
          <motion.circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            transform="rotate(-90 100 100)"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold font-mono ${colorClass}`}>{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <Badge
        variant="outline"
        className={
          score >= 70
            ? "border-positive text-positive"
            : score >= 40
              ? "border-accent text-accent"
              : "border-destructive text-destructive"
        }
      >
        {label}
      </Badge>
    </div>
  );
}

// ─── Benchmark Bar ───────────────────────────────────────────────
function BenchmarkBar({
  value,
  range,
  unit,
}: {
  value: number;
  range: { frontrunner: number; efficient: number; average: number; high: number; worst: number };
  unit: string;
}) {
  const min = range.frontrunner * 0.8;
  const max = range.worst * 1.1;
  const pos = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const zones = [
    { start: ((range.frontrunner - min) / (max - min)) * 100, end: ((range.efficient - min) / (max - min)) * 100, color: "bg-positive/30" },
    { start: ((range.efficient - min) / (max - min)) * 100, end: ((range.average - min) / (max - min)) * 100, color: "bg-positive/15" },
    { start: ((range.average - min) / (max - min)) * 100, end: ((range.high - min) / (max - min)) * 100, color: "bg-accent/20" },
    { start: ((range.high - min) / (max - min)) * 100, end: ((range.worst * 1.1 - min) / (max - min)) * 100, color: "bg-destructive/15" },
  ];

  return (
    <div className="space-y-1">
      <div className="relative h-3 rounded-full bg-muted overflow-hidden">
        {zones.map((z, i) => (
          <div
            key={i}
            className={`absolute top-0 h-full ${z.color}`}
            style={{ left: `${Math.max(0, z.start)}%`, width: `${Math.max(0, z.end - z.start)}%` }}
          />
        ))}
        <motion.div
          className="absolute top-0 h-full w-1 bg-foreground rounded-full"
          style={{ left: `${pos}%` }}
          initial={{ left: "0%" }}
          animate={{ left: `${pos}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Frontrunner ({range.frontrunner} {unit})</span>
        <span>High ({range.high} {unit})</span>
      </div>
    </div>
  );
}

// ─── Dimension Card ──────────────────────────────────────────────
const DIMENSION_META = {
  carbon: { icon: Leaf, label: "Carbon", unit: "kgCO₂e / room-night", sdg: "SDG 13" },
  energy: { icon: Zap, label: "Energy", unit: "kWh / room-night", sdg: "SDG 7" },
  water: { icon: Droplets, label: "Water", unit: "L / guest-night", sdg: "SDG 6" },
  waste: { icon: Trash2, label: "Waste", unit: "kg / room-night", sdg: "SDG 12" },
} as const;

function DimensionCard({
  dimension,
  score,
  value,
  category,
  estimated,
}: {
  dimension: keyof typeof DIMENSION_META;
  score: number;
  value: number;
  category: HotelCategory;
  estimated: boolean;
}) {
  const meta = DIMENSION_META[dimension];
  const Icon = meta.icon;
  const bench = BENCHMARKS[category][dimension];

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm">{meta.label}</CardTitle>
              <CardDescription className="text-xs">{meta.unit}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-xs font-mono">{meta.sdg}</Badge>
            {estimated && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                <Info className="h-3 w-3" /> Estimated
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono">
            {dimension === "waste" ? value.toFixed(1) : Math.round(value)}
          </span>
          <span className="text-sm text-muted-foreground">{meta.unit}</span>
          <span className={`ml-auto text-sm font-mono font-semibold ${
            score >= 70 ? "text-positive" : score >= 40 ? "text-accent" : "text-destructive"
          }`}>
            {score}/100
          </span>
        </div>
        <BenchmarkBar value={value} range={bench} unit={meta.unit.split(" ")[0]} />
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function ESGBarometer() {
  const [setup, setSetup] = useState<{
    country: string;
    category: HotelCategory;
    rooms: number;
    targetYear: number;
  } | null>(null);

  const [formState, setFormState] = useState({
    country: "",
    category: "" as HotelCategory | "",
    rooms: "",
    targetYear: "2026",
  });

  const [actionsOpen, setActionsOpen] = useState(true);

  const esgResult = useMemo<ESGScoreResult | null>(() => {
    if (!setup) return null;
    return computeESGScore(setup.category);
  }, [setup]);

  const pathwayData = useMemo(() => {
    if (!setup || !esgResult) return [];
    return computePathway(2024, setup.targetYear, esgResult.carbonIndex);
  }, [setup, esgResult]);

  const sdgActions = useMemo(() => {
    if (!setup) return [];
    return getSDGActions(setup.category, setup.country);
  }, [setup]);

  const interpretation = useMemo(() => {
    if (!esgResult) return "";
    const parts: string[] = [];
    if (esgResult.energyIndex >= 60) parts.push("above average for energy efficiency");
    else parts.push("below average for energy efficiency");
    if (esgResult.waterIndex < 50)
      parts.push(`water consumption is ${Math.round(((esgResult.waterValue / BENCHMARKS[setup!.category].water.efficient) - 1) * 100)}% above the frontrunner benchmark`);
    return `Your property performs ${parts.join(", but ")}.`;
  }, [esgResult, setup]);

  const handleSubmit = () => {
    if (!formState.country || !formState.category || !formState.rooms) return;
    setSetup({
      country: formState.country,
      category: formState.category as HotelCategory,
      rooms: parseInt(formState.rooms),
      targetYear: parseInt(formState.targetYear),
    });
  };

  const pathwayChartConfig = {
    required: { label: "Required Path", color: "hsl(var(--positive))" },
    projected: { label: "Your Trajectory", color: "hsl(var(--accent))" },
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ESG Barometer</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Location-aware ESG scoring based on global hospitality benchmarks
          </p>
        </div>

        {/* ─── Section A: Onboarding ─────────────────────────── */}
        <AnimatePresence mode="wait">
          {!setup && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Set up your property</CardTitle>
                  <CardDescription>
                    No file upload required — we'll score your property against global benchmarks immediately.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Country</label>
                      <Select value={formState.country} onValueChange={(v) => setFormState((s) => ({ ...s, country: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                        <SelectContent>
                          {COUNTRY_OPTIONS.map((c) => (
                            <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Hotel category</label>
                      <Select value={formState.category} onValueChange={(v) => setFormState((s) => ({ ...s, category: v as HotelCategory }))}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="budget">Budget</SelectItem>
                          <SelectItem value="midscale">Mid-scale</SelectItem>
                          <SelectItem value="upscale">Upscale</SelectItem>
                          <SelectItem value="luxury">Luxury</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Number of rooms</label>
                      <Input
                        type="number"
                        placeholder="e.g. 120"
                        value={formState.rooms}
                        onChange={(e) => setFormState((s) => ({ ...s, rooms: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Target year</label>
                      <Select value={formState.targetYear} onValueChange={(v) => setFormState((s) => ({ ...s, targetYear: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleSubmit} className="mt-4 bg-primary text-primary-foreground">
                    Calculate ESG Score
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Results ────────────────────────────────────────── */}
        {esgResult && setup && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Section B: Score Hero */}
            <Card>
              <CardContent className="py-8 flex flex-col md:flex-row items-center gap-8">
                <ESGGauge score={esgResult.composite} label={esgResult.sdgLabel} />
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-lg font-semibold">Composite ESG Score</h2>
                    <p className="text-sm text-muted-foreground mt-1">{interpretation}</p>
                  </div>
                  {esgResult.estimatedDimensions.length > 0 && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-accent/10 border border-accent/20">
                      <AlertTriangle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        {esgResult.estimatedDimensions.length === 4
                          ? "All dimensions estimated from benchmarks. Upload utilities data for actual scoring."
                          : `Estimated: ${esgResult.estimatedDimensions.join(", ")}. Upload data to refine.`}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSetup(null)}>
                      Reconfigure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section C: Dimension Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DimensionCard dimension="carbon" score={esgResult.carbonIndex} value={esgResult.carbonValue} category={setup.category} estimated={esgResult.estimatedDimensions.includes("carbon")} />
              <DimensionCard dimension="energy" score={esgResult.energyIndex} value={esgResult.energyValue} category={setup.category} estimated={esgResult.estimatedDimensions.includes("energy")} />
              <DimensionCard dimension="water" score={esgResult.waterIndex} value={esgResult.waterValue} category={setup.category} estimated={esgResult.estimatedDimensions.includes("water")} />
              <DimensionCard dimension="waste" score={esgResult.wasteIndex} value={esgResult.wasteValue} category={setup.category} estimated={esgResult.estimatedDimensions.includes("waste")} />
            </div>

            {/* Section D: 2030 Pathway */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">2030 Pathway Tracker</CardTitle>
                <CardDescription>
                  Carbon reduction trajectory vs. Sustainable Hospitality Alliance target (−66% by 2030)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={pathwayChartConfig} className="h-[260px] w-full">
                  <ComposedChart data={pathwayData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="year" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="projected"
                      fill="hsl(var(--accent) / 0.15)"
                      stroke="none"
                    />
                    <Line
                      type="monotone"
                      dataKey="required"
                      stroke="hsl(var(--positive))"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      dot={false}
                      name="required"
                    />
                    <Line
                      type="monotone"
                      dataKey="projected"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "hsl(var(--accent))" }}
                      name="projected"
                    />
                    <ReferenceLine y={34} stroke="hsl(var(--positive))" strokeDasharray="4 4" label={{ value: "2030 Target", position: "right", className: "text-[10px] fill-positive" }} />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Section E: SDG Actions */}
            <Collapsible open={actionsOpen} onOpenChange={setActionsOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">SDG Action Suggestions</CardTitle>
                        <CardDescription>
                          Location-relevant actions to improve your ESG score
                        </CardDescription>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${actionsOpen ? "rotate-180" : ""}`} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="divide-y divide-border">
                      {sdgActions.map((action, i) => (
                        <div key={i} className="py-3 first:pt-0 last:pb-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] font-mono">{action.sdg}</Badge>
                                <span className="text-sm font-medium">{action.action}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{action.impact}</p>
                              <p className="text-[10px] text-muted-foreground">Source: {action.source}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="shrink-0 text-xs gap-1">
                              View in Roadmap <ArrowRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
