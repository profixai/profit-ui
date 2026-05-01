import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useTier, type Tier } from "@/contexts/TierContext";
import { toast } from "sonner";

interface TierGateProps {
  requires: Tier;
  children: ReactNode;
  /** Optional label describing the gated feature */
  feature?: string;
}

const tierLabel: Record<Tier, string> = {
  free: "Free",
  team: "Team",
  enterprise: "Enterprise",
};

export const TierGate = ({ requires, children, feature }: TierGateProps) => {
  const { hasTier } = useTier();
  if (hasTier(requires)) return <>{children}</>;

  return (
    <Card className="flex flex-col items-center justify-center py-10 px-6 text-center border-dashed border-muted-foreground/20">
      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center mb-3">
        <Lock className="h-4 w-4 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">
        {feature ? `${feature} — ` : ""}Available on {tierLabel[requires]} plan
      </h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        Upgrade to unlock this capability for your team.
      </p>
      <Badge variant="outline" className="mt-3 text-[10px] text-muted-foreground border-muted-foreground/30">
        {tierLabel[requires]} tier
      </Badge>
      <Button
        size="sm"
        variant="outline"
        className="mt-3 text-xs"
        onClick={() => toast.success("Request sent — our team will reach out shortly.")}
      >
        Request access
      </Button>
    </Card>
  );
};
