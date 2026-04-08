import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timelineLabel, type WhyThisMattersBlock, type Timeline } from "@/lib/saas-types";
import { Target, BarChart3, Scale, CheckCircle2, Clock } from "lucide-react";

interface Props {
  block: WhyThisMattersBlock;
}

const timelineColor: Record<Timeline, string> = {
  "table-stakes": "bg-positive/10 text-positive border-positive/20",
  "differentiator-6-12mo": "bg-primary/10 text-primary border-primary/20",
  "defensible-12-24mo": "bg-accent/10 text-accent-foreground border-accent/20",
};

export const WhyThisMatters = ({ block }: Props) => (
  <Card className="p-4 bg-muted/30 border-dashed">
    <div className="flex items-center gap-2 mb-3">
      <Target className="h-3.5 w-3.5 text-primary" />
      <span className="text-[11px] font-semibold text-foreground uppercase tracking-wide">Why This Matters</span>
      <Badge variant="outline" className={`text-[9px] ml-auto ${timelineColor[block.timeline]}`}>
        {timelineLabel[block.timeline]}
      </Badge>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="flex items-start gap-2">
        <BarChart3 className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] text-muted-foreground font-medium">Outcome</p>
          <p className="text-xs">{block.outcome}</p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Target className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] text-muted-foreground font-medium">Metric</p>
          <p className="text-xs font-mono-data">{block.metric}</p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Scale className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] text-muted-foreground font-medium">Benchmark</p>
          <p className="text-xs">{block.benchmark}</p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] text-muted-foreground font-medium">Condition</p>
          <p className="text-xs">{block.condition}</p>
        </div>
      </div>
    </div>
  </Card>
);
