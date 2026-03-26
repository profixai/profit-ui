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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28, duration: 0.3 }}
      onClick={onClick}
      className={`w-full text-left bg-card rounded-lg border p-5 transition-all cursor-pointer ${
        active ? "ring-1 ring-primary/20 shadow-sm" : "hover:border-primary/15"
      }`}
    >
      <h2 className="text-sm font-semibold mb-4">Breakeven</h2>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="space-y-1 shrink-0">
          <p className="text-3xl font-semibold font-mono-data text-foreground">{breakeven_occupancy_pct}%</p>
          <p className="text-[11px] text-muted-foreground">
            {rooms_per_night_needed} rooms/night required
          </p>
        </div>
        <div className="flex-1 w-full">
          <div className="h-2 bg-muted rounded-full relative overflow-hidden">
            <div
              className={`absolute left-0 top-0 bottom-0 rounded-full transition-all ${above ? "bg-positive" : "bg-destructive"}`}
              style={{ width: `${Math.min(current_occupancy_pct, 100)}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-px bg-foreground/40"
              style={{ left: `${breakeven_occupancy_pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1.5">
            <span className={`font-medium ${above ? "text-positive" : "text-destructive"}`}>
              {current_occupancy_pct}% current ({buffer > 0 ? "+" : ""}{buffer} pts)
            </span>
            <span className="text-muted-foreground">{breakeven_occupancy_pct}% BE</span>
          </div>
        </div>
      </div>
      {months_below > 0 && (
        <p className="text-[11px] text-destructive mt-3 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {months_below}/{total_months} months below breakeven
        </p>
      )}
    </motion.button>
  );
};
