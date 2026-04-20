import { FileText, LayoutGrid, TrendingUp, FolderOpen, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface RailItem {
  label: string;
  to: string;
  icon: React.ElementType;
  match?: (pathname: string) => boolean;
}

const items: RailItem[] = [
  { label: "Invoices", to: "/invoices/INV-2024-001", icon: FileText, match: (p) => p.startsWith("/invoices") },
  { label: "Dashboard", to: "/dashboard", icon: LayoutGrid },
  { label: "Insights", to: "/insights", icon: TrendingUp },
  { label: "Data", to: "/data", icon: FolderOpen },
  { label: "Settings", to: "/settings", icon: Settings },
];

export function InvoiceSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="flex h-full w-14 flex-col items-center border-r border-sidebar-border bg-sidebar py-4">
      <nav className="flex flex-1 flex-col items-center gap-1">
        {items.map((item) => {
          const active = item.match ? item.match(pathname) : pathname === item.to;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              aria-label={item.label}
              title={item.label}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-muted hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
