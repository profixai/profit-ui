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
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    onClick={onClick}
    className={`bg-card rounded-lg border p-4 text-left transition-shadow cursor-pointer ${
      active ? "ring-2 ring-primary/30 shadow-md" : "hover:shadow-sm"
    }`}
  >
    <p className="text-xs text-muted-foreground font-medium">{label}</p>
    <p className="text-2xl font-bold font-mono-data mt-1">{value}</p>
    <div className="mt-1">
      <DeltaBadge value={delta} />
    </div>
  </motion.button>
);
