import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface BreakevenCardProps {
  breakeven_occupancy_pct: number;
  current_occupancy_pct: number;
  rooms_per_night_needed: number;
  months_below: number;
  total_months: number;
  active: boolean;
  onClick: () => void;
}

export const BreakevenCard = ({
  breakeven_occupancy_pct,
  current_occupancy_pct,
  rooms_per_night_needed,
  months_below,
  total_months,
  active,
  onClick,
}: BreakevenCardProps) => {
  const above = current_occupancy_pct >= breakeven_occupancy_pct;
  const buffer = current_occupancy_pct - breakeven_occupancy_pct;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      onClick={onClick}
      className={`w-full text-left bg-card rounded-lg border-2 p-5 transition-shadow cursor-pointer ${
        above ? "border-positive/40" : "border-destructive/40"
      } ${active ? "ring-2 ring-primary/30 shadow-md" : "hover:shadow-sm"}`}
    >
      <h2 className="text-sm font-semibold mb-4">Breakeven Analysis</h2>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="space-y-1">
          <p className="text-4xl font-bold font-mono-data text-primary">{breakeven_occupancy_pct}%</p>
          <p className="text-xs text-muted-foreground">Breakeven occupancy</p>
          <p className="text-xs text-muted-foreground">
            Need <span className="font-medium text-foreground">{rooms_per_night_needed} rooms/night</span> to cover fixed costs
          </p>
        </div>
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>0%</span><span>100%</span>
          </div>
          <div className="h-4 bg-muted rounded-full relative overflow-hidden">
            <div
              className="absolute left-0 top-0 bottom-0 bg-primary rounded-full transition-all"
              style={{ width: `${current_occupancy_pct}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-accent"
              style={{ left: `${breakeven_occupancy_pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-primary font-medium">Current: {current_occupancy_pct}% ({buffer > 0 ? "+" : ""}{buffer} pts)</span>
            <span className="text-accent font-medium">Breakeven: {breakeven_occupancy_pct}%</span>
          </div>
        </div>
      </div>
      {months_below > 0 && (
        <p className="text-xs text-destructive mt-3 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {months_below} of {total_months} months were below breakeven
        </p>
      )}
    </motion.button>
  );
};
