import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { FolderKanban, ListChecks, AlertTriangle, Lightbulb, Plug, CheckCircle, Link2 } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { PageHeader } from "@/components/PageHeader";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { useNavigate } from "react-router-dom";
import { ActivityFeed } from "@/components/ActivityFeed";

export default function Dashboard() {
  const { data: projects } = useQuery({
    queryKey: ["projects-count"],
    queryFn: async () => {
      const { count } = await supabase.from("projects").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: tasks } = useQuery({
    queryKey: ["tasks-count"],
    queryFn: async () => {
      const { count } = await supabase.from("tasks").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: signals } = useQuery({
    queryKey: ["signals-active"],
    queryFn: async () => {
      const { data: ints } = await supabase.from("integrations").select("tool_name").eq("status", "connected");
      const tools = ints?.map(i => i.tool_name) || [];
      if (tools.length === 0) return 0;

      const { count } = await supabase.from("signals").select("*", { count: "exact", head: true }).eq("resolved", false).in("tool_source", tools);
      return count ?? 0;
    },
  });

  const { data: insights } = useQuery({
    queryKey: ["insights-count"],
    queryFn: async () => {
      const { data: ints } = await supabase.from("integrations").select("tool_name").eq("status", "connected");
      const tools = ints?.map(i => i.tool_name) || [];
      if (tools.length === 0) return 0;

      const { count } = await supabase.from("insights").select("*", { count: "exact", head: true }).in("tool_source", tools);
      return count ?? 0;
    },
  });

  const { data: integrations } = useQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const { data } = await supabase.from("integrations").select("*").eq("status", "connected");
      return data ?? [];
    },
  });

  const { data: recentEvents } = useQuery({
    queryKey: ["recent-events"],
    queryFn: async () => {
      const { data: ints } = await supabase.from("integrations").select("tool_name").eq("status", "connected");
      const tools = ints?.map(i => i.tool_name) || [];
      if (tools.length === 0) return [];

      const { data } = await supabase.from("events").select("*").in("tool_source", tools).order("event_timestamp", { ascending: false }).limit(10);
      return data ?? [];
    },
  });

  const { data: latestInsights } = useQuery({
    queryKey: ["latest-insights"],
    queryFn: async () => {
      const { data: ints } = await supabase.from("integrations").select("tool_name").eq("status", "connected");
      const tools = ints?.map(i => i.tool_name) || [];
      if (tools.length === 0) return [];

      const { data } = await supabase.from("insights").select("*").in("tool_source", tools).order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  // Build chart data from recent events by tool source
  const chartData = recentEvents?.reduce((acc: { name: string; count: number }[], event) => {
    const existing = acc.find((d) => d.name === event.tool_source);
    if (existing) existing.count++;
    else acc.push({ name: event.tool_source, count: 1 });
    return acc;
  }, []) ?? [];

  const navigate = useNavigate();

  const toolIcons: Record<string, string> = {
    GitHub: "#24292e",
    Slack: "#4A154B",
    Jira: "#0052CC",
    Notion: "#000000",
    CRM: "#00A1E0",
  };

  return (
    <div>
      <PageHeader title="Dashboard" description="Operational intelligence overview" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <MetricCard title="Projects" value={projects ?? 0} subtitle="Active repositories" icon={<FolderKanban className="w-5 h-5" />} variant="signal" href="/app/projects" />
        <MetricCard title="Tasks" value={tasks ?? 0} subtitle="Open tasks" icon={<ListChecks className="w-5 h-5" />} href="/app/tasks" />
        <MetricCard 
          title="Active Signals" 
          value={signals ?? 0} 
          subtitle={(signals ?? 0) > 0 ? `🔴 Critical  🟡 Warning` : "Healthy 🟢"} 
          icon={<AlertTriangle className="w-5 h-5" />} 
          variant="warning" 
          href="/app/signals" 
        />
        <MetricCard title="Insights" value={insights ?? 0} subtitle="AI-generated" icon={<Lightbulb className="w-5 h-5" />} variant="insight" href="/app/insights" />
        <MetricCard title="Integrations" value={`${integrations?.length ?? 0}/5`} subtitle="Active connections" icon={<Plug className="w-5 h-5" />} variant="signal" href="/app/events" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Source Chart */}
        <div className="rounded-lg border border-border bg-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-sm font-medium text-foreground">Events by Source</h2>
            <select className="bg-muted/50 border border-border text-xs rounded-md px-2 py-1 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>All time</option>
            </select>
          </div>
          
          {chartData.length > 0 ? (
            <>
              <div className="flex-1 w-full min-h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 22%)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "hsl(215 20% 75%)", fontSize: 11, fontFamily: "'Inter'" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(215 20% 75%)", fontSize: 11, fontFamily: "'Inter'" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'hsl(217 33% 22% / 0.5)' }}
                      contentStyle={{
                        background: "hsl(217 44% 15%)",
                        border: "1px solid hsl(219 33% 22%)",
                        borderRadius: "0.5rem",
                        color: "hsl(215 20% 75%)",
                        fontFamily: "'Inter'",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.5)",
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={toolIcons[entry.name] || "hsl(198 78% 64%)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-border/40 justify-center">
                {chartData.map(entry => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-heading">
                    <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: toolIcons[entry.name] || "hsl(198 78% 64%)" }}></div>
                    {entry.name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
              No events yet. Add events to see activity breakdown.
            </div>
          )}
        </div>

        {/* Latest Insights */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-heading text-sm font-medium text-foreground mb-4">Latest Insights</h2>
          {latestInsights && latestInsights.length > 0 ? (
            <div className="space-y-0">
              {latestInsights.map((insight) => (
                <div key={insight.id} className="py-5 border-b border-border last:border-0 hover:bg-muted/20 transition-colors -mx-6 px-6 cursor-default">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Lightbulb className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{insight.title}</p>
                        {insight.confidence_score && (
                          <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded shrink-0">
                            {Math.round(insight.confidence_score * 100)}% Match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{insight.description}</p>
                      
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/30">
                        <button className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors">
                          View details
                        </button>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <button className="text-[11px] font-medium text-foreground hover:text-primary transition-colors">
                          Create Task
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
              No insights yet.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>

        {/* Connected Integrations */}
        <div className="rounded-lg border border-border bg-card p-6 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-sm font-medium text-foreground">Connected Integrations</h2>
            <button
              onClick={() => navigate("/app/events")}
              className="text-xs text-primary hover:text-primary/80 font-heading transition-colors"
            >
              Manage →
            </button>
          </div>
          {integrations && integrations.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: toolIcons[integration.tool_name] || "#666" }}
                  >
                    {integration.tool_name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-foreground">{integration.tool_name}</span>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                </div>
              ))}
              {(integrations.length < 5) && (
                <button
                  onClick={() => navigate("/app/events")}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border hover:border-primary/40 transition-colors group"
                >
                  <Link2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                    Add more
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 py-4">
              <Plug className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">No integrations connected yet</p>
                  <button
                  onClick={() => navigate("/app/events")}
                  className="text-xs text-primary hover:text-primary/80 mt-1 font-heading transition-colors"
                >
                  Connect GitHub, Slack, Jira, Notion, or CRM →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
