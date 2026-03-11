import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { FolderKanban, ListChecks, AlertTriangle, Lightbulb, Plug, CheckCircle, Link2, Activity, ArrowUpRight, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, AreaChart, Area } from "recharts";
import { useNavigate } from "react-router-dom";
import { ActivityFeed } from "@/components/ActivityFeed";

export default function Dashboard() {
  const { data: projectsCount } = useQuery({
    queryKey: ["projects-count"],
    queryFn: async () => {
      const { count } = await supabase.from("projects").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: risks } = useQuery({
    queryKey: ["risks-active"],
    queryFn: async () => {
      // Assuming we get the first project in this MVP
      const { data: projects } = await supabase.from("projects").select("id").limit(1);
      const projectId = projects?.[0]?.id;
      if (!projectId) return 0;
      
      const { count } = await supabase.from("risks" as any).select("*", { count: "exact", head: true }).eq("project_id", projectId).eq("resolved", false);
      return count ?? 0;
    },
  });

  const { data: recentEvents } = useQuery({
    queryKey: ["recent-events"],
    queryFn: async () => {
      const { data: projects } = await supabase.from("projects").select("id").limit(1);
      const projectId = projects?.[0]?.id;
      if (!projectId) return [];
      
      const { data } = await supabase.from("events").select("*").eq("project_id", projectId).order("event_timestamp", { ascending: false }).limit(30);
      return data ?? [];
    },
  });

  const { data: latestRecommendations } = useQuery({
    queryKey: ["latest-recommendations"],
    queryFn: async () => {
      const { data: projects } = await supabase.from("projects").select("id").limit(1);
      const projectId = projects?.[0]?.id;
      if (!projectId) return [];

      const { data } = await supabase.from("recommendations" as any).select("*").eq("project_id", projectId).order("created_at", { ascending: false }).limit(3);
      return data ?? [];
    },
  });

  // Mock data for the activity sparkline trend over a month
  const trendData = Array.from({ length: 30 }).map((_, i) => ({
    date: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 40) + 10 + (i * 0.5) // Slight upward trend
  }));

  const navigate = useNavigate();

  // Temporary Aggregated Health Score (Mock logic based on unresolved signals)
  const healthScore = Math.max(0, 100 - (risks || 0) * 5);
  const healthStatusColor = healthScore >= 80 ? "text-success" : healthScore >= 50 ? "text-warning" : "text-destructive";
  const healthStrokeColor = healthScore >= 80 ? "hsl(var(--success))" : healthScore >= 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  return (
    <div className="space-y-6">
      {/* Welcome & Global KPI Row */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-white">Platform Overview</h1>
          <p className="text-muted-foreground mt-1 text-sm">Real-time pulse of your connected repositories and workspaces.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-success"></span>
          <span className="text-xs font-medium text-muted-foreground">System Operational</span>
        </div>
      </div>

      {/* Hero Widget: Global Health & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Health Score Card */}
        <div className="lg:col-span-1 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
          <h2 className="text-sm font-semibold text-muted-foreground tracking-wide font-heading uppercase mb-6 self-start">Average Portfolio Health</h2>
          
          <div className="relative w-48 h-48 flex items-center justify-center mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
              <circle 
                cx="50" cy="50" r="45" fill="none" 
                stroke={healthStrokeColor} 
                strokeWidth="6" 
                strokeDasharray="283" 
                strokeDashoffset={283 - (283 * healthScore) / 100}
                className="transition-all duration-1000 ease-out drop-shadow-lg"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-5xl font-bold ${healthStatusColor} tracking-tighter`}>{healthScore}</span>
              <span className="text-sm font-medium text-muted-foreground mt-1">Score</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-success bg-success/10 px-3 py-1 rounded-full w-fit">
            <TrendingUp className="w-4 h-4" />
            <span>+4% from last week</span>
          </div>
        </div>

        {/* Global Trend Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 flex flex-col shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent pointer-events-none" />
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground tracking-wide font-heading uppercase">Activity Velocity</h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-white">{recentEvents?.length ?? 1248}</span>
                <span className="text-sm text-muted-foreground">events</span>
              </div>
            </div>
            <select className="bg-background/50 border border-border/40 text-xs rounded-lg px-3 py-1.5 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-background/80 transition-colors">
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>
          
          <div className="flex-1 w-full min-h-[160px] -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <Tooltip
                  cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    color: "hsl(var(--foreground))",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3)",
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/50 bg-card/40 p-5 hover:bg-card/60 transition-colors cursor-pointer" onClick={() => navigate('/app/projects')}>
          <div className="flex justify-between items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{projectsCount ?? 0}</h3>
          <p className="text-sm text-muted-foreground">Active Projects</p>
        </div>
        
        <div className="rounded-xl border border-border/50 bg-card/40 p-5 hover:bg-card/60 transition-colors cursor-pointer group" onClick={() => navigate('/app/signals')}>
          <div className="flex justify-between items-center mb-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${(risks || 0) > 0 ? 'bg-destructive/10' : 'bg-success/10'}`}>
              <AlertTriangle className={`w-5 h-5 ${(risks || 0) > 0 ? 'text-destructive' : 'text-success'}`} />
            </div>
            {(risks || 0) > 0 && <span className="flex h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />}
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{risks || 0}</h3>
          <p className="text-sm text-muted-foreground">Active Risk Signals</p>
        </div>

        <div className="col-span-2 rounded-xl border border-border/50 bg-card/40 p-5 hidden md:flex flex-col justify-between overflow-hidden relative group">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
           <div className="flex items-center justify-between z-10">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                 <Link2 className="w-5 h-5 text-secondary" />
               </div>
               <div>
                 <h3 className="font-semibold text-white">Analyze a new project</h3>
                 <p className="text-sm text-muted-foreground">Paste repository or documentation links</p>
               </div>
             </div>
             <button onClick={() => navigate('/app/projects')} className="bg-primary hover:bg-primary/90 text-white p-2.5 rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
               <ArrowUpRight className="w-5 h-5" />
             </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Alerts & AI Insights (Right Column in previous view, now spanning left) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border/50 bg-card/40 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-heading font-semibold text-white">AI Project Insights & Recommendations</h2>
              <button 
                onClick={() => navigate('/app/insights')}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                View all →
              </button>
            </div>
            
            {latestRecommendations && latestRecommendations.length > 0 ? (
              <div className="space-y-4">
                {latestRecommendations.map((insight: any) => (
                  <div key={insight.id} className="p-4 rounded-lg bg-background/50 border border-border/40 hover:border-primary/30 transition-colors group cursor-default">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <Lightbulb className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center justify-between gap-2 mb-1">
                           <h4 className="font-medium text-foreground text-sm">{insight.title}</h4>
                           <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-sm">High Confidence</span>
                         </div>
                         <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{insight.recommendation_text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center rounded-lg border border-dashed border-border/50 text-muted-foreground text-sm bg-background/30">
                Connect a project to generate AI Insights.
              </div>
            )}
          </div>
          
          <div className="rounded-xl border border-border/50 bg-card/40 p-6 overflow-hidden">
             <h2 className="text-lg font-heading font-semibold text-white mb-6">Generated Events</h2>
             <div className="h-[400px] overflow-y-auto pr-2 -mr-2">
                <ActivityFeed />
             </div>
          </div>
        </div>

        {/* Recent Scans / Projects List (Sidebar) */}
        <div className="rounded-xl border border-border/50 bg-card/40 flex flex-col h-fit">
          <div className="p-5 border-b border-border/40 flex items-center justify-between">
             <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-widest">Recent Scans</h2>
          </div>
          <div className="flex-1">
             {/* Mocking recent project scans based on current data for layout fidelity */}
             {[
               { name: "Frontend Monorepo", score: 92, trend: "up", time: "2h ago" },
               { name: "Auth Service API", score: 76, trend: "down", time: "5h ago" },
               { name: "Public Documentation", score: 45, trend: "down", time: "1d ago" },
             ].map((scan, i) => (
               <div key={i} className="p-4 border-b border-border/30 last:border-0 hover:bg-muted/10 transition-colors flex items-center justify-between cursor-pointer" onClick={() => navigate('/app/projects')}>
                 <div>
                   <h4 className="text-sm font-medium text-white mb-1">{scan.name}</h4>
                   <span className="text-xs text-muted-foreground">Scanned {scan.time}</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-6 rounded flex items-center justify-center shrink-0">
                     {scan.trend === 'up' ? 
                       <TrendingUp className="w-4 h-4 text-success" /> : 
                       <TrendingUp className="w-4 h-4 text-destructive rotate-180" />
                     }
                   </div>
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                     scan.score >= 80 ? 'bg-success/20 text-success' : 
                     scan.score >= 50 ? 'bg-warning/20 text-warning' : 
                     'bg-destructive/20 text-destructive'
                   }`}>
                     {scan.score}
                   </div>
                 </div>
               </div>
             ))}
          </div>
          <div className="p-4 border-t border-border/40 bg-muted/5">
            <button onClick={() => navigate('/app/events')} className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors bg-background/50 rounded-lg border border-border/50 hover:border-border">
              View All History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
