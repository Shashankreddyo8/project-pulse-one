import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Search, Bell, User as UserIcon } from "lucide-react";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-[#0B1220]">
          <header className="h-16 flex items-center justify-between border-b border-border px-6 shrink-0 bg-card/50 backdrop-blur-sm relative z-10">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground mr-2" />
              <div className="relative w-full max-w-sm hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search events, projects, or insights..." 
                  className="pl-9 bg-background/50 border-border h-9 text-sm focus-visible:ring-primary/50"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary cursor-pointer hover:bg-primary/30 transition-colors">
                <UserIcon className="w-4 h-4" />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 lg:p-8 space-y-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
