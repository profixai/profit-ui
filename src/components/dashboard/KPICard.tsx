import { motion } from "framer-motion";
import { DeltaBadge } from "./DeltaBadge";

interface KPICardProps {
  label: string;
  value: string;
  delta: number;
  index: number;
  active: boolean;
  onClick: () => void;
}

export const KPICard = ({ label, value, delta, index, active, onClick }: KPICardProps) => (
  <motion.button
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04, duration: 0.3 }}
    onClick={onClick}
    className={`bg-card rounded-lg border p-4 text-left transition-all cursor-pointer ${
      active ? "ring-1 ring-primary/20 shadow-sm" : "hover:border-primary/15"
    }`}
  >
    <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
    <p className="text-xl font-semibold font-mono-data mt-1.5 text-foreground">{value}</p>
    <div className="mt-2">
      <DeltaBadge value={delta} />
    </div>
  </motion.button>
);
