import { useState } from "react";
import { motion } from "framer-motion";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";
import { AppShell } from "@/components/AppShell";
import { AskProfixPanel } from "@/components/AskProfixPanel";
import { ExplainButton } from "@/components/ExplainButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { mockMaterialityDimensions, type MaterialityDimension } from "@/lib/mock-data";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const formatCurrency = (v: number) => {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`;
  return `€${v}`;
};

const QUADRANT_LABELS = [
  { x: 25, y: 80, label: "Monitor", sub: "Low impact, high financial risk" },
  { x: 75, y: 80, label: "Critical", sub: "High impact & financial risk" },
  { x: 25, y: 20, label: "Low Priority", sub: "Low on both axes" },
  { x: 75, y: 20, label: "Impact Focus", sub: "High impact, low financial risk" },
];

const COLORS: Record<string, string> = {
  energy: "#0D4F5C",
  water: "#3B82F6",
  waste: "#E8A838",
  labor: "#C0392B",
  carbon: "#1A7A4A",
};

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "improving") return <TrendingUp className="h-3 w-3 text-positive" />;
  if (trend === "worsening") return <TrendingDown className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
};

// Custom dot for the scatter chart
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const size = Math.max(12, Math.min(40, payload.currentCost / 5000));
  const color = COLORS[payload.id] || "#6B6B6B";

  return (
    <g>
      <circle cx={cx} cy={cy} r={size} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={4} fill={color} />
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d: MaterialityDimension = payload[0].payload;
  return (
    <div className="bg-card border rounded-lg shadow-lg p-4 max-w-xs text-sm space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{d.label}</span>
        <Badge variant="outline" className="text-[10px]">{formatCurrency(d.currentCost)}/yr</Badge>
      </div>
      <div className="space-y-1.5">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase">Financial Risk</p>
          <p className="text-xs text-muted-foreground">{d.financialRisk}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase">Impact Risk</p>
          <p className="text-xs text-muted-foreground">{d.impactRisk}</p>
        </div>
      </div>
    </div>
  );
};

export default function MaterialityMatrix() {
  const [askOpen, setAskOpen] = useState(false);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Double Materiality Matrix</h1>
            <p className="text-sm text-muted-foreground">
              Mapping financial risk against environmental & social impact
            </p>
          </div>
          <ExplainButton onClick={() => setAskOpen(true)} />
        </div>

        {/* Matrix Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Impact vs. Financial Risk</CardTitle>
              <CardDescription className="text-xs">
                Bubble size reflects current annual cost. Hover for detailed risk assessment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Quadrant labels */}
                <div className="absolute inset-0 pointer-events-none z-10">
                  {QUADRANT_LABELS.map((q) => (
                    <div
                      key={q.label}
                      className="absolute text-center"
                      style={{
                        left: `${q.x < 50 ? 15 : 65}%`,
                        top: `${q.y > 50 ? 12 : 72}%`,
                      }}
                    >
                      <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">{q.label}</p>
                    </div>
                  ))}
                </div>

                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(35, 12%, 89%)" />
                    <XAxis
                      type="number"
                      dataKey="environmentalImpact"
                      name="Environmental Impact"
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: "#6B6B6B" }}
                      label={{ value: "Impact on Environment & Society →", position: "insideBottom", offset: -10, fontSize: 11, fill: "#6B6B6B" }}
                    />
                    <YAxis
                      type="number"
                      dataKey="financialImpact"
                      name="Financial Impact"
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: "#6B6B6B" }}
                      label={{ value: "Financial Impact on Hotel →", angle: -90, position: "insideLeft", offset: 10, fontSize: 11, fill: "#6B6B6B" }}
                    />
                    <ZAxis type="number" dataKey="currentCost" range={[100, 2000]} />
                    <Tooltip content={<CustomTooltip />} />
                    {/* Quadrant dividers */}
                    <Scatter
                      data={mockMaterialityDimensions}
                      shape={<CustomDot />}
                    />
                  </ScatterChart>
                </ResponsiveContainer>

                {/* Midpoint lines */}
                <div className="absolute left-[calc(50%+20px)] top-5 bottom-10 w-px border-l border-dashed border-muted-foreground/20" />
                <div className="absolute left-[60px] right-5 top-[calc(50%)] h-px border-t border-dashed border-muted-foreground/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dimension detail cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockMaterialityDimensions.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Card className="h-full">
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ background: COLORS[d.id] }} />
                      <span className="text-sm font-semibold">{d.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendIcon trend={d.trend} />
                      <Badge variant="outline" className="text-[10px] capitalize">{d.trend}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Environmental</p>
                      <p className="font-bold font-mono-data text-lg">{d.environmentalImpact}<span className="text-xs text-muted-foreground">/100</span></p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Financial</p>
                      <p className="font-bold font-mono-data text-lg">{d.financialImpact}<span className="text-xs text-muted-foreground">/100</span></p>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground border-t pt-2">
                    <span className="font-medium text-foreground">{formatCurrency(d.currentCost)}/yr</span> current exposure
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <AskProfixPanel
        externalOpen={askOpen}
        onClose={() => setAskOpen(false)}
        prefillQuestion="Explain the double materiality matrix — which dimensions pose the highest combined risk and what actions should we prioritise?"
        contextLabel="Double Materiality Matrix"
      />
    </AppShell>
  );
}
