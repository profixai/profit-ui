import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ConfidencePill } from "./ConfidencePill";

interface Props {
  label: string;
  value: string;
  confidence: number;
  editable: boolean;
  onChange?: (v: string) => void;
  inputMode?: "text" | "numeric" | "decimal";
  className?: string;
}

export function LabeledFieldWithConfidence({
  label,
  value,
  confidence,
  editable,
  onChange,
  inputMode = "text",
  className,
}: Props) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={!editable}
          inputMode={inputMode}
          className={cn(
            "h-9 flex-1 bg-background/60 text-sm",
            !editable && "cursor-default border-border/60 focus-visible:ring-0 focus-visible:ring-offset-0",
          )}
        />
        <ConfidencePill value={confidence} />
      </div>
    </div>
  );
}
