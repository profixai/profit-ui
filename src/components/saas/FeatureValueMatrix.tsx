import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import {
  computeValueIndex,
  tierLabel,
  tierColor,
  timelineLabel,
  type FeatureValue,
  type Tier,
} from "@/lib/saas-types";

interface Props {
  features: FeatureValue[];
}

export const FeatureValueMatrix = ({ features }: Props) => {
  const [sortBy, setSortBy] = useState<"score" | "name">("score");
  const [filterTier, setFilterTier] = useState<"all" | Tier>("all");

  const filtered = features.filter((f) => filterTier === "all" || f.tier === filterTier);
  const sorted = [...filtered].sort((a, b) =>
    sortBy === "score" ? computeValueIndex(b) - computeValueIndex(a) : a.name.localeCompare(b.name)
  );

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold">Feature Value Matrix</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Value Index = (Magnitude × Certainty × Defensibility) / Friction
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filterTier} onValueChange={(v) => setFilterTier(v as "all" | Tier)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={() => setSortBy(sortBy === "score" ? "name" : "score")}
          >
            <ArrowUpDown className="h-3 w-3" />
            {sortBy === "score" ? "By Score" : "By Name"}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs w-[180px]">Feature</TableHead>
              <TableHead className="text-xs">Buyer Value</TableHead>
              <TableHead className="text-xs w-[100px]">Metric</TableHead>
              <TableHead className="text-xs w-[80px]">Tier</TableHead>
              <TableHead className="text-xs w-[120px]">Timeline</TableHead>
              <TableHead className="text-xs w-[70px] text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((f) => {
              const score = computeValueIndex(f);
              return (
                <TableRow key={f.id}>
                  <TableCell>
                    <p className="text-xs font-medium">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{f.description}</p>
                  </TableCell>
                  <TableCell className="text-xs">{f.buyerValue}</TableCell>
                  <TableCell className="text-xs font-mono-data">{f.valueMetric}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[9px] ${tierColor[f.tier]}`}>
                      {tierLabel[f.tier]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px]">
                      {timelineLabel[f.timeline].split("—")[0].trim()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`text-xs font-mono-data font-semibold ${
                      score >= 100 ? "text-positive" : score >= 50 ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {score}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
