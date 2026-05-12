import {
  LayoutDashboard,
  Sparkles,
  Upload,
  BarChart2,
  Building2,
  ClipboardList,
  Settings,
  LogOut,
  Compass,
  Leaf,
  Hammer,
  Grid3x3,
  Briefcase,
  HelpCircle,
  BookOpen,
  FileText,
  Map,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: UserRole[];
}

// Issue #22 — exactly 6 MVP items, in this order.
const mvpNav: NavItem[] = [
  { title: "Overview", url: "/overview", icon: Compass, roles: ["manager", "direction"] },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["manager", "direction"] },
  { title: "P&L", url: "/pl", icon: BarChart2, roles: ["manager", "direction"] },
  { title: "Insights", url: "/insights", icon: Sparkles, roles: ["manager", "direction"] },
  { title: "Data Vault", url: "/data", icon: Upload, roles: ["manager", "inventory"] },
  { title: "Settings", url: "/settings", icon: Settings, roles: ["manager", "direction", "inventory"] },
];

// Hidden behind VITE_FEATURE_LAB=true. Routes still exist in App.tsx; only the
// sidebar entries are gated. ProtectedRoute role checks apply regardless.
const labNav: NavItem[] = [
  { title: "Inventory", url: "/inventory", icon: ClipboardList, roles: ["inventory"] },
  { title: "Multi-Property", url: "/multi-property", icon: Building2, roles: ["manager", "direction"] },
  { title: "ESG Barometer", url: "/esg", icon: Leaf, roles: ["manager", "direction"] },
  { title: "CAPEX Roadmap", url: "/capex", icon: Hammer, roles: ["manager", "direction"] },
  { title: "Materiality Matrix", url: "/materiality", icon: Grid3x3, roles: ["direction"] },
  { title: "Enterprise", url: "/enterprise", icon: Briefcase, roles: ["direction"] },
  { title: "Why Profix", url: "/why-profix", icon: HelpCircle, roles: ["direction"] },
  { title: "Ledger", url: "/ledger", icon: BookOpen, roles: ["manager", "direction"] },
  { title: "Reporting", url: "/reporting", icon: FileText, roles: ["manager", "direction"] },
  { title: "Roadmap", url: "/roadmap", icon: Map, roles: ["manager", "direction"] },
];

const SHOW_LAB_ROUTES = import.meta.env.VITE_FEATURE_LAB === "true";

const roleLabel: Record<UserRole, string> = {
  direction: "Direction",
  manager: "Manager",
  inventory: "Inventory Staff",
};

const roleColor: Record<UserRole, string> = {
  direction: "bg-primary/20 text-primary-foreground border-primary/30",
  manager: "bg-positive/20 text-positive border-positive/30",
  inventory: "bg-accent/20 text-accent-foreground border-accent/30",
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const filteredMvp = mvpNav.filter((item) => role && item.roles.includes(role));
  const filteredLab = labNav.filter((item) => role && item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderItem = (item: NavItem) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          end
          className="hover:bg-sidebar-accent/50"
          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        >
          <item.icon className="mr-2 h-4 w-4" />
          {!collapsed && <span>{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <img src="/profix-logo.svg" alt="Profix" className="h-7 w-7" />
          {!collapsed && (
            <span className="text-sm font-semibold text-sidebar-primary tracking-tight">
              Profix
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{filteredMvp.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {SHOW_LAB_ROUTES && filteredLab.length > 0 && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel>Coming soon</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>{filteredLab.map(renderItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        {user && !collapsed && (
          <div className="space-y-1.5">
            <p className="text-xs text-sidebar-foreground font-medium truncate">{user.displayName}</p>
            {role && (
              <Badge variant="outline" className={`text-[9px] ${roleColor[role]}`}>
                {roleLabel[role]}
              </Badge>
            )}
          </div>
        )}
        {user && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-sidebar-muted hover:text-sidebar-foreground transition-colors w-full"
          >
            <LogOut className="h-3.5 w-3.5" />
            {!collapsed && <span>Sign out</span>}
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
