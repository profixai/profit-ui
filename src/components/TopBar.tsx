import { Bell, ChevronDown } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export const TopBar = () => {
  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="flex items-center gap-2 border rounded-md px-3 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors">
          <span className="text-sm font-medium">Le Grand Hôtel</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-1 ml-2">
          {["YTD 2024", "Q4 2024", "Dec 2024"].map((period, i) => (
            <button
              key={period}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                i === 0
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-[10px] font-bold flex items-center justify-center text-accent-foreground">
            3
          </span>
        </Button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-medium text-primary-foreground">JD</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none">Jean Dupont</p>
            <p className="text-xs text-muted-foreground">General Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
};
