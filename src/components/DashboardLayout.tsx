import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Search, Bell, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full font-body bg-background text-foreground">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b border-border/40 px-6 shrink-0 bg-background/80 backdrop-blur-xl relative z-10">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground mr-2 transition-colors" />
              <div className="relative w-full max-w-md hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search projects, analysis, or reports... (Cmd+K)" 
                  className="pl-9 bg-card/50 border-border/50 h-9 text-sm focus-visible:ring-primary/50 rounded-lg shadow-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-[1.5px] border-background"></span>
              </button>
              <Link to="/app/profile">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary cursor-pointer hover:bg-primary/20 transition-colors shadow-sm shadow-primary/10">
                  <UserIcon className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto space-y-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
