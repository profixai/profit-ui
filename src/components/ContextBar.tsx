import { useAuth } from "@/contexts/AuthContext";
import { useProperty, properties } from "@/contexts/PropertyContext";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Circle } from "lucide-react";

const roleLabel: Record<string, string> = {
  direction: "Admin",
  manager: "Manager",
  inventory: "Operator",
};

const roleBadgeClass: Record<string, string> = {
  direction: "bg-primary/10 text-primary border-primary/20",
  manager: "bg-positive/10 text-positive border-positive/20",
  inventory: "bg-accent/10 text-accent-foreground border-accent/20",
};

const monthNames: Record<string, string> = {
  jan: "Jan", feb: "Feb", mar: "Mar", apr: "Apr", may: "May", jun: "Jun",
  jul: "Jul", aug: "Aug", sep: "Sep", oct: "Oct", nov: "Nov", dec: "Dec",
};

const granularityLabel: Record<string, string> = {
  daily: "Daily",
  monthly: "Monthly",
  ytd: "YTD",
};

export const ContextBar = () => {
  const { role } = useAuth();
  const { propertyId, propertyName, setProperty, period } = useProperty();

  const canSwitch = role === "manager" || role === "direction";

  return (
    <div className="h-9 border-b bg-card/80 backdrop-blur flex items-center px-4 lg:px-6 gap-3 shrink-0 z-10 text-xs">
      {/* Property selector or read-only label */}
      {canSwitch ? (
        <Select
          value={propertyId}
          onValueChange={(id) => {
            const p = properties.find((pr) => pr.id === id);
            if (p) setProperty(p.id, p.name);
          }}
        >
          <SelectTrigger className="w-40 h-7 text-xs border-none bg-muted/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <span className="font-medium text-foreground">{propertyName}</span>
      )}

      <span className="text-muted-foreground">·</span>

      {/* Period badge */}
      <Badge variant="outline" className="text-[10px] font-normal">
        {monthNames[period.month] || period.month} {period.year} · {granularityLabel[period.granularity]}
      </Badge>

      <span className="text-muted-foreground">·</span>

      {/* Data freshness */}
      <div className="flex items-center gap-1.5">
        <Circle className="h-2 w-2 fill-positive text-positive" />
        <span className="text-muted-foreground">Synced 2h ago</span>
      </div>

      <div className="ml-auto">
        {role && (
          <Badge variant="outline" className={`text-[10px] ${roleBadgeClass[role] || ""}`}>
            {roleLabel[role] || role}
          </Badge>
        )}
      </div>
    </div>
  );
};
