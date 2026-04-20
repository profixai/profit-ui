import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { USALISplit } from "@/lib/mock-invoices";
import { USALI_CATEGORIES, USALI_SUBCATEGORIES } from "@/lib/mock-invoices";
import { ConfidencePill } from "./ConfidencePill";

interface Props {
  splits: USALISplit[];
  editable: boolean;
  onChange: (next: USALISplit[]) => void;
}

export function USALIClassificationSplits({ splits, editable, onChange }: Props) {
  const total = splits.reduce((sum, s) => sum + s.percent, 0);
  const balanced = total === 100;

  const update = (idx: number, patch: Partial<USALISplit>) => {
    onChange(splits.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const addSplit = () => {
    const remaining = Math.max(0, 100 - total);
    onChange([
      ...splits,
      {
        id: `split-${splits.length + 1}-${Date.now()}`,
        percent: remaining,
        category: { value: USALI_CATEGORIES[0], confidence: 0 },
        subcategory: { value: USALI_SUBCATEGORIES[USALI_CATEGORIES[0]][0], confidence: 0 },
      },
    ]);
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">USALI Classification</h3>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "font-mono-data text-xs tabular-nums",
              balanced ? "text-positive" : "text-warning",
            )}
          >
            Total: {total}%
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={addSplit}
            disabled={!editable || total >= 100}
            aria-label="Add split"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {splits.map((split, idx) => {
          const subOptions =
            USALI_SUBCATEGORIES[split.category.value] ?? USALI_SUBCATEGORIES[USALI_CATEGORIES[0]];
          return (
            <div
              key={split.id}
              className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/30 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Split {idx + 1}</span>
                <div className="flex items-center gap-2">
                  <Input
                    value={String(split.percent)}
                    readOnly={!editable}
                    inputMode="numeric"
                    onChange={(e) => {
                      const n = Number(e.target.value.replace(/[^0-9]/g, ""));
                      if (!Number.isNaN(n)) update(idx, { percent: Math.max(0, Math.min(100, n)) });
                    }}
                    className="h-8 w-16 text-right font-mono-data text-xs tabular-nums"
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Category
                  </Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={split.category.value}
                      onValueChange={(v) =>
                        update(idx, {
                          category: { ...split.category, value: v },
                          subcategory: {
                            ...split.subcategory,
                            value: USALI_SUBCATEGORIES[v]?.[0] ?? split.subcategory.value,
                          },
                        })
                      }
                      disabled={!editable}
                    >
                      <SelectTrigger className="h-9 flex-1 bg-background/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {USALI_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ConfidencePill value={split.category.confidence} />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Subcategory
                  </Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={split.subcategory.value}
                      onValueChange={(v) =>
                        update(idx, { subcategory: { ...split.subcategory, value: v } })
                      }
                      disabled={!editable}
                    >
                      <SelectTrigger className="h-9 flex-1 bg-background/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {subOptions.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ConfidencePill value={split.subcategory.confidence} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
