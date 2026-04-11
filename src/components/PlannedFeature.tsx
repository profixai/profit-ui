import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface PlannedFeatureProps {
  title: string;
  description?: string;
  /** Inline badge only — no card wrapper */
  inline?: boolean;
}

/** Mark a feature as intentionally unavailable (planned for future release) */
export const PlannedFeature = ({ title, description, inline }: PlannedFeatureProps) => {
  if (inline) {
    return (
      <Badge variant="outline" className="text-[10px] gap-1 text-muted-foreground border-muted-foreground/30">
        <Lock className="h-2.5 w-2.5" /> Planned
      </Badge>
    );
  }

  return (
    <Card className="flex flex-col items-center justify-center py-16 px-6 text-center border-dashed border-muted-foreground/20">
      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
        <Lock className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>
      )}
      <Badge variant="outline" className="mt-3 text-[10px] text-muted-foreground border-muted-foreground/30">
        Coming Soon
      </Badge>
    </Card>
  );
};
