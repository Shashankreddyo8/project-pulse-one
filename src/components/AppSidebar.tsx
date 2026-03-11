import { LayoutDashboard, FolderKanban, Activity, AlertTriangle, Lightbulb, ListChecks, User, Plug } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/app", icon: LayoutDashboard },
    ],
  },
  {
    label: "Work",
    items: [
      { title: "Projects", url: "/app/projects", icon: FolderKanban },
      { title: "Events", url: "/app/events", icon: Activity },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { title: "Signals", url: "/app/signals", icon: AlertTriangle },
      { title: "Insights", url: "/app/insights", icon: Lightbulb },
      { title: "Recommendations", url: "/app/recommendations", icon: ListChecks },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Profile", url: "/app/profile", icon: User },
      { title: "Integrations", url: "/app/integrations", icon: Plug },
    ],
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="pt-6">
        {!collapsed && (
          <div className="px-6 pb-6">
            <h1 className="font-heading text-lg font-semibold text-primary tracking-tight">
              AI Ops Brain
            </h1>
            <p className="text-xs text-muted-foreground mt-1">Operational Intelligence</p>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center pb-4">
            <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-primary" />
            </div>
          </div>
        )}
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="pt-4">
            <SidebarGroupLabel className="text-muted-foreground/50 text-[11px] uppercase tracking-wider font-heading font-semibold mb-2 px-3">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === "/app"}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActive 
                              ? "bg-[#18273F] text-foreground border-l-[3px] border-primary ml-[-3px]" 
                              : "text-muted-foreground hover:text-foreground hover:bg-[#18273F]/50 border-l-[3px] border-transparent ml-[-3px]"
                          }`}
                          activeClassName=""
                        >
                          <item.icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-muted-foreground"}`} />
                          {!collapsed && <span className="font-medium">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
