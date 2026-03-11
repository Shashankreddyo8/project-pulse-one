import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Activity, AlertTriangle, ArrowLeft, ArrowUpRight, CheckCircle2, FileText, Github, Globe, Lightbulb, Link2, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ActivityFeed } from "@/components/ActivityFeed";

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: latestInsights } = useQuery({
    queryKey: ["project-insights", id],
    queryFn: async () => {
      const { data } = await supabase.from("insights").select("*").eq("project_id", id).order("created_at", { ascending: false }).limit(4);
      return data ?? [];
    },
    enabled: !!id,
  });

  // Mock data for the activity sparkline trend over a month
  const trendData = Array.from({ length: 30 }).map((_, i) => ({
    date: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 40) + 10 + (i * 0.5) // Slight upward trend
  }));

  if (isProjectLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-32 space-y-4">
        <h2 className="text-2xl font-bold text-white">Project not found</h2>
        <Button onClick={() => navigate("/app/projects")} variant="outline">Back to Projects</Button>
      </div>
    );
  }

  // Calculate mock health score based on name length for visual consistency in demo
  const healthScore = (project.name.length * 7) % 100 || 85;
  const isHealthy = healthScore >= 80;
  const isWarning = healthScore >= 50 && healthScore < 80;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-[-1rem]">
        <button onClick={() => navigate("/app/projects")} className="hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Projects
        </button>
        <span>/</span>
        <span className="text-foreground">{project.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-card border border-border/50 flex items-center justify-center font-heading text-3xl font-bold text-white shadow-xl shadow-black/20">
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-heading font-bold tracking-tight text-white mb-1">{project.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                isHealthy ? 'bg-success/10 text-success border border-success/20' : 
                isWarning ? 'bg-warning/10 text-warning border border-warning/20' : 
                'bg-destructive/10 text-destructive border border-destructive/20'
              }`}>
                {isHealthy ? 'Healthy' : isWarning ? 'At Risk' : 'Critical'}
              </span>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <Link2 className="w-4 h-4" /> {project.description?.replace("Analyzed from: ", "") || "https://github.com/org/repo"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 bg-card/40 border border-border/50 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-heading mb-1">Health Score</p>
            <div className="flex items-center gap-3">
               <span className={`text-4xl font-bold ${isHealthy ? 'text-success' : isWarning ? 'text-warning' : 'text-destructive'}`}>
                 {healthScore}
               </span>
               <div className="flex flex-col">
                 <span className="text-xs text-muted-foreground">/ 100</span>
                 <span className="text-[10px] text-success flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> +2%</span>
               </div>
            </div>
          </div>
          <div className="w-px h-12 bg-border/50" />
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20">
            Analyze Again <ArrowUpRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* AI Insights Bento Box */}
          <div className="rounded-2xl border border-border/50 bg-card/30 p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <h2 className="text-lg font-heading font-semibold text-white mb-6 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" /> What You Need To Know
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-warning/20 bg-warning/5 p-5">
                 <div className="flex items-start gap-3">
                   <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                   <div>
                     <h4 className="font-medium text-warning-foreground mb-1 text-sm">Documentation is Stale</h4>
                     <p className="text-sm text-warning-foreground/80 leading-relaxed">
                       Code changes are frequent, but the main docs site hasn't been updated in 3 months. Risk of integration errors for new users.
                     </p>
                   </div>
                 </div>
              </div>
              <div className="rounded-xl border border-success/20 bg-success/5 p-5">
                 <div className="flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                   <div>
                     <h4 className="font-medium text-success-foreground mb-1 text-sm">High Review Velocity</h4>
                     <p className="text-sm text-success-foreground/80 leading-relaxed">
                       Pull requests are merged 40% faster this week. The team is unblocked and shipping efficiently.
                     </p>
                   </div>
                 </div>
              </div>
              {latestInsights && latestInsights.map((insight) => (
                <div key={insight.id} className="rounded-xl border border-border/40 bg-background/40 p-5 hover:border-primary/30 transition-colors">
                  <h4 className="font-medium text-foreground mb-1 text-sm">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Trends */}
          <div className="rounded-2xl border border-border/50 bg-card/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
                 <Activity className="w-5 h-5 text-muted-foreground" /> Activity Trends
              </h2>
              <select className="bg-background/50 border border-border/40 text-xs rounded-lg px-3 py-1.5 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-background/80 transition-colors">
                <option>Last 30 Days</option>
                <option>All Time</option>
              </select>
            </div>
            
            <div className="flex-1 w-full min-h-[240px] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorProject" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="date" hide />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip
                    cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: "3 3" }}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.3)" }}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorProject)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="rounded-2xl border border-border/50 bg-card/30 p-6 overflow-hidden">
             <h2 className="text-lg font-heading font-semibold text-white mb-6">Project Timeline</h2>
             <div className="h-[300px] overflow-y-auto pr-2 -mr-2">
                <ActivityFeed />
             </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Extracted Links & Sources */}
          <div className="rounded-2xl border border-border/50 bg-card/40 p-6">
            <h2 className="text-[11px] font-heading font-semibold text-muted-foreground uppercase tracking-widest mb-4">Analyzed Sources</h2>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-background/50 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                <div className="w-8 h-8 rounded bg-[#24292e] flex items-center justify-center text-white shrink-0">
                  <Github className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">Core Repository</p>
                  <p className="text-xs text-muted-foreground truncate">github.com/org/repo</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-background/50 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">Documentation</p>
                  <p className="text-xs text-muted-foreground truncate">docs.project.com</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </a>
              <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-background/50 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">Marketing Site</p>
                  <p className="text-xs text-muted-foreground truncate">project.com</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </a>
            </div>
            
            <Button variant="outline" className="w-full mt-4 border-dashed bg-transparent hover:bg-muted/10">
              <Plus className="w-4 h-4 mr-2" /> Add Link
            </Button>
          </div>
          
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
            <h2 className="text-[11px] font-heading font-semibold text-destructive uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" /> Risk Factors
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                <p className="text-sm text-foreground/90">Authentication module has 3 stale PRs blocking main deployment.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                <p className="text-sm text-foreground/90">Test coverage dropped by 4% in the last 2 releases.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
