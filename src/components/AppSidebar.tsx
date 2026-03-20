import {
  BookOpen,
  Grid3X3,
  Map,
  Database,
  FileText,
  Settings,
  FileSpreadsheet,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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

const navItems = [
  { title: "The Ledger", url: "/ledger", icon: BookOpen },
  { title: "Materiality Matrix", url: "/materiality", icon: Grid3X3 },
  { title: "CAPEX Roadmap", url: "/roadmap", icon: Map },
  { title: "Data Vault", url: "/data", icon: Database },
  { title: "Reporting (CSRD)", url: "/reporting", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

const recentUploads = [
  { name: "PL_Q4_2025.xlsx", date: "6 Jan 2026" },
  { name: "Utilities_Q4_2025.csv", date: "7 Jan 2026" },
  { name: "PL_Q3_2025.xlsx", date: "3 Oct 2025" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-sidebar-ring flex items-center justify-center">
            <span className="text-sm font-bold text-sidebar-background">P</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-primary tracking-tight">Profix</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-xs uppercase tracking-wider">
            {!collapsed && "Platform"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
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

        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted text-xs uppercase tracking-wider">
              Recent uploads
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-1 px-2">
                {recentUploads.map((upload) => (
                  <div key={upload.name} className="flex items-start gap-2 py-1.5">
                    <FileSpreadsheet className="h-3.5 w-3.5 mt-0.5 text-sidebar-muted shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-sidebar-foreground truncate">{upload.name}</p>
                      <p className="text-[10px] text-sidebar-muted">{upload.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2">
            <div className="h-2 w-2 rounded-full bg-positive" />
            <span className="text-xs text-sidebar-muted">Telegram connected</span>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
