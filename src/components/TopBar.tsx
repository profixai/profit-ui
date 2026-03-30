import { Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const TopBar = () => {
  return (
    <header className="h-12 border-b bg-card flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="text-sm font-semibold text-foreground">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-1.5 rounded-md hover:bg-muted transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-destructive text-[9px] font-semibold flex items-center justify-center text-destructive-foreground">
            3
          </span>
        </button>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          <span className="text-xs font-semibold text-muted-foreground">JD</span>
        </div>
      </div>
    </header>
  );
};
