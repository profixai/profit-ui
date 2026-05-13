import { useState } from "react";
import { Edit3 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  src: string;
  alt?: string;
}

const ZOOMS = [0.75, 1, 1.25, 1.5];

export function InvoiceViewer({ src, alt = "Invoice document" }: Props) {
  const [zoomIdx, setZoomIdx] = useState(1);
  const [errored, setErrored] = useState(false);
  const zoom = ZOOMS[zoomIdx];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border p-4">
        <h2 className="text-base font-semibold tracking-tight">Invoice Document</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setZoomIdx((i) => Math.max(0, i - 1))}
            disabled={zoomIdx === 0}
          >
            <Edit3 className="mr-1.5 h-3.5 w-3.5" />
            Zoom Out
          </Button>
          <span className="font-mono-data text-xs text-muted-foreground tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setZoomIdx((i) => Math.min(ZOOMS.length - 1, i + 1))}
            disabled={zoomIdx === ZOOMS.length - 1}
          >
            Next
            <Edit3 className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto bg-muted/40 p-6">
        <div
          className={cn(
            "mx-auto overflow-hidden rounded-md border border-border bg-background shadow-sm transition-transform",
          )}
          style={{ width: `${zoom * 100}%`, maxWidth: 640 }}
        >
          <img src={src} alt={alt} className="block w-full select-none" draggable={false} />
        </div>
      </CardContent>
    </Card>
  );
}
