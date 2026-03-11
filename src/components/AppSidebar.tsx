import { LayoutDashboard, FolderKanban, Activity, AlertTriangle, Lightbulb, ListChecks, User, Plug, PieChart } from "lucide-react";
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
    label: "Platform",
    items: [
      { title: "Dashboard", url: "/app", icon: LayoutDashboard },
      { title: "Projects", url: "/app/projects", icon: FolderKanban },
      { title: "Analysis", url: "/app/events", icon: Activity },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { title: "Risk Signals", url: "/app/signals", icon: AlertTriangle },
      { title: "AI Insights", url: "/app/insights", icon: Lightbulb },
      { title: "Recommendations", url: "/app/recommendations", icon: ListChecks },
    ],
  },
  {
    label: "Configuration",
    items: [
      { title: "Integrations", url: "/app/integrations", icon: Plug },
      { title: "Profile Settings", url: "/app/profile", icon: User },
    ],
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40 bg-card/30">
      <SidebarContent className="pt-6">
        {!collapsed && (
          <div className="px-6 pb-8">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shadow-sm shadow-primary/20">
                P
              </div>
              <h1 className="font-heading text-lg font-semibold text-white tracking-tight">
                Project Pulse
              </h1>
            </div>
            <p className="text-xs text-muted-foreground ml-8">Health Monitoring</p>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center pb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
               <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-6">
          {navGroups.map((group) => (
            <SidebarGroup key={group.label} className="px-3">
              <SidebarGroupLabel className="text-muted-foreground/60 text-[10px] uppercase tracking-widest font-heading font-semibold mb-2 px-3">
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
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${
                              isActive 
                                ? "bg-primary/10 text-primary font-medium" 
                                : "text-muted-foreground hover:text-foreground hover:bg-card"
                            }`}
                            activeClassName=""
                          >
                            <item.icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"}`} />
                            {!collapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
