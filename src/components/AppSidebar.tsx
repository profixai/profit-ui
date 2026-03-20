import {
  LayoutDashboard,
  Upload,
  Map,
  Settings,
  FileText,
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
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Upload", url: "/upload", icon: Upload },
  { title: "Roadmap", url: "/roadmap", icon: Map },
  { title: "Settings", url: "/settings", icon: Settings },
];

const mockUploads = [
  { name: "PL_Q4_2024.xlsx", date: "15 Mar 2026", status: "processed" },
  { name: "PL_Q3_2024.xlsx", date: "10 Jan 2026", status: "processed" },
  { name: "Utilities_2024.csv", date: "8 Jan 2026", status: "processed" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

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
            {!collapsed && "Navigation"}
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
                {mockUploads.map((upload) => (
                  <div key={upload.name} className="flex items-start gap-2 py-1.5">
                    <FileText className="h-3.5 w-3.5 mt-0.5 text-sidebar-muted shrink-0" />
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
