import { ReactNode, useState, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { AskProfixPanel } from "@/components/AskProfixPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BarChart2,
  Sparkles,
  Shield,
  Settings,
  ClipboardList,
  Upload,
  Building2,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { tierLabel, type Tier } from "@/lib/saas-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AskProfixContext {
  openAskProfix: (question: string, contextLabel: string) => void;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { title: "Overview", url: "/overview", icon: LayoutDashboard, roles: ["manager", "direction"] },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["manager", "direction"] },
      { title: "P&L Reporting", url: "/pl", icon: BarChart2, roles: ["manager", "direction"] },
      { title: "Stock Entry", url: "/inventory", icon: ClipboardList, roles: ["inventory"] },
      { title: "Data Upload", url: "/data", icon: Upload, roles: ["manager", "inventory"] },
      { title: "Portfolio", url: "/multi-property", icon: Building2, roles: ["manager", "direction"] },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "AI Insights", url: "/insights", icon: Sparkles, roles: ["manager", "direction"] },
    ],
  },
  {
    label: "Enterprise",
    items: [
      { title: "Security & Governance", url: "/enterprise", icon: Shield, roles: ["manager", "direction"] },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "Settings", url: "/settings", icon: Settings, roles: ["manager", "direction", "inventory"] },
    ],
  },
];

const roleLabel: Record<UserRole, string> = {
  direction: "Director",
  manager: "Manager",
  inventory: "Operations",
};

const roleBadgeClass: Record<UserRole, string> = {
  direction: "bg-primary/10 text-primary border-primary/20",
  manager: "bg-positive/10 text-positive border-positive/20",
  inventory: "bg-accent/10 text-accent-foreground border-accent/20",
};

// Simulated tier — in production would come from subscription state
const currentTier: Tier = "team";

const envBadge = "Production";

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [prefill, setPrefill] = useState("");
  const [contextLabel, setContextLabel] = useState("");

  const openAskProfix = useCallback((question: string, label: string) => {
    setPrefill(question);
    setContextLabel(label);
    setAskOpen(true);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const allNavItems = navSections.flatMap((s) => s.items).filter((item) => role && item.roles.includes(role));

  const isActive = (url: string) => location.pathname === url;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Top Header ──────────────────────────────────────── */}
      <header className="h-14 border-b bg-card flex items-center justify-between px-4 lg:px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-1.5 rounded-md hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2">
            <img src="/profix-logo.svg" alt="Profix" className="h-7 w-7" />
            <span className="text-sm font-semibold tracking-tight text-foreground">Profix</span>
          </Link>

          <Badge variant="outline" className="text-[9px] ml-1 hidden sm:flex bg-primary/5 text-primary border-primary/20">
            {tierLabel[currentTier]}
          </Badge>
          <Badge variant="outline" className="text-[9px] hidden sm:flex bg-muted text-muted-foreground">
            {envBadge}
          </Badge>
        </div>

        {/* ── Primary Nav (desktop) ─────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-1">
          {allNavItems.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isActive(item.url)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* ── Right section ─────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {role && (
            <Badge variant="outline" className={`text-[9px] hidden sm:flex ${roleBadgeClass[role]}`}>
              {roleLabel[role]}
            </Badge>
          )}
          <button className="relative p-1.5 rounded-md hover:bg-muted transition-colors">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-destructive text-[9px] font-semibold flex items-center justify-center text-destructive-foreground">
              3
            </span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 p-1 rounded-md hover:bg-muted transition-colors">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-primary">
                    {user ? user.displayName.split(" ").map((w) => w[0]).join("") : "?"}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {user && (
                <div className="px-2 py-1.5 border-b">
                  <p className="text-xs font-medium">{user.displayName}</p>
                  <p className="text-[10px] text-muted-foreground">{role && roleLabel[role]}</p>
                </div>
              )}
              <DropdownMenuItem className="text-xs" onClick={() => navigate("/settings")}>
                <Settings className="h-3.5 w-3.5 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-destructive" onClick={handleLogout}>
                <LogOut className="h-3.5 w-3.5 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── Mobile Nav ──────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b bg-card px-4 py-3 space-y-1 z-10">
          {allNavItems.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                isActive(item.url)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </div>
      )}

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="flex-1 overflow-auto p-4 lg:p-6">
        {typeof children === "function"
          ? (children as (ctx: AskProfixContext) => ReactNode)({ openAskProfix })
          : children}
      </main>

      <AskProfixPanel
        externalOpen={askOpen}
        onClose={() => setAskOpen(false)}
        prefillQuestion={prefill}
        contextLabel={contextLabel}
      />
    </div>
  );
};
