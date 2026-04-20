import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FileText, ShoppingCart, FilePen, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickAction {
  key: string;
  label: string;
  icon: React.ElementType;
  onClick: (navigate: ReturnType<typeof useNavigate>) => void;
}

const ACTIONS: QuickAction[] = [
  {
    key: "upload-invoice",
    label: "Upload Invoice",
    icon: FileText,
    onClick: (nav) => nav("/data"),
  },
  {
    key: "create-po",
    label: "Create Purchase Order",
    icon: ShoppingCart,
    onClick: () =>
      toast("Purchase orders not wired yet", {
        description: "Backend endpoint pending.",
      }),
  },
  {
    key: "add-contract",
    label: "Add Contract",
    icon: FilePen,
    onClick: () =>
      toast("Contract management not wired yet", {
        description: "Backend endpoint pending.",
      }),
  },
  {
    key: "review-approvals",
    label: "Review Approvals",
    icon: CheckCircle,
    onClick: (nav) => nav("/invoices/INV-2024-001"),
  },
];

export function QuickActionsCard() {
  const navigate = useNavigate();

  return (
    <Card className="p-4 flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold">Quick Actions</h2>
        <p className="text-[11px] text-muted-foreground">Common tasks</p>
      </div>
      <div className="flex flex-col gap-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.key}
              onClick={() => action.onClick(navigate)}
              className={cn(
                "flex items-center gap-3 rounded-full border border-border/60 bg-muted/10 px-4 py-2.5 text-left text-sm transition-colors",
                "hover:bg-muted/30 hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{action.label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
