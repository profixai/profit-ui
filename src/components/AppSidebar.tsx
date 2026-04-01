import {
  LayoutDashboard,
  Sparkles,
  Upload,
  BarChart2,
  Building2,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["manager", "direction"] },
  { title: "P&L", url: "/pl", icon: BarChart2, roles: ["manager", "direction"] },
  { title: "AI Insights", url: "/insights", icon: Sparkles, roles: ["manager", "direction"] },
  { title: "Stock Entry", url: "/inventory", icon: ClipboardList, roles: ["inventory"] },
  { title: "Data Upload", url: "/data", icon: Upload, roles: ["manager", "inventory"] },
  { title: "Portfolio View", url: "/multi-property", icon: Building2, roles: ["manager", "direction"] },
  { title: "Settings", url: "/settings", icon: Settings, roles: ["manager", "direction", "inventory"] },
];

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

  const filteredNav = navItems.filter((item) => role && item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
            <SidebarMenu>
              {filteredNav.map((item) => (
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
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
