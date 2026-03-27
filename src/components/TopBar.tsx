import { Bell, ChevronDown, Send } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIntegrationNavigation } from "@/hooks/useIntegrationNavigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const TopBar = () => {
  const { goToTelegramIntegration } = useIntegrationNavigation();

  return (
    <header className="h-12 border-b bg-card/80 backdrop-blur-sm flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-1.5 cursor-pointer group">
          <span className="text-sm font-semibold text-foreground">Le Grand Hôtel</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
        <span className="text-border">|</span>
        <div className="flex items-center gap-0.5">
          {["YTD 2024", "Q4", "Dec"].map((period, i) => (
            <button
              key={period}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors font-medium ${
                i === 0
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={goToTelegramIntegration}
              aria-label="Open Telegram integration settings"
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <Send className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Telegram integration</TooltipContent>
        </Tooltip>
        <button className="relative p-1.5 rounded-md hover:bg-muted transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-destructive text-[9px] font-semibold flex items-center justify-center text-destructive-foreground">
            3
          </span>
        </button>
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-[11px] font-semibold text-primary">JD</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium leading-none text-foreground">J. Dupont</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">GM</p>
          </div>
        </div>
      </div>
    </header>
  );
};
