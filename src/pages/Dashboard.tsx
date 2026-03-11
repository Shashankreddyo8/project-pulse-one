import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { FolderKanban, ListChecks, AlertTriangle, Lightbulb } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { PageHeader } from "@/components/PageHeader";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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
      const { count } = await supabase.from("signals").select("*", { count: "exact", head: true }).eq("resolved", false);
      return count ?? 0;
    },
  });

  const { data: insights } = useQuery({
    queryKey: ["insights-count"],
    queryFn: async () => {
      const { count } = await supabase.from("insights").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: recentEvents } = useQuery({
    queryKey: ["recent-events"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").order("event_timestamp", { ascending: false }).limit(10);
      return data ?? [];
    },
  });

  const { data: latestInsights } = useQuery({
    queryKey: ["latest-insights"],
    queryFn: async () => {
      const { data } = await supabase.from("insights").select("*").order("created_at", { ascending: false }).limit(5);
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

  return (
    <div>
      <PageHeader title="Dashboard" description="Operational intelligence overview" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Projects" value={projects ?? 0} icon={<FolderKanban className="w-5 h-5" />} variant="signal" />
        <MetricCard title="Tasks" value={tasks ?? 0} icon={<ListChecks className="w-5 h-5" />} />
        <MetricCard title="Active Signals" value={signals ?? 0} icon={<AlertTriangle className="w-5 h-5" />} variant="warning" />
        <MetricCard title="Insights" value={insights ?? 0} icon={<Lightbulb className="w-5 h-5" />} variant="insight" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Source Chart */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-heading text-sm font-medium text-foreground mb-4">Events by Source</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 22%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(215 20% 75%)", fontSize: 12, fontFamily: "'Space Grotesk'" }} />
                <YAxis tick={{ fill: "hsl(215 20% 75%)", fontSize: 12, fontFamily: "'Space Grotesk'" }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(217 33% 17%)",
                    border: "1px solid hsl(217 33% 22%)",
                    borderRadius: "0.5rem",
                    color: "hsl(215 20% 75%)",
                    fontFamily: "'Inter'",
                  }}
                />
                <Bar dataKey="count" fill="hsl(187 72% 61%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
                <div key={insight.id} className="py-4 border-b border-border last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{insight.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{insight.description}</p>
                      {insight.confidence_score && (
                        <span className="text-[10px] font-heading text-accent mt-1 inline-block">
                          {Math.round(insight.confidence_score * 100)}% confidence
                        </span>
                      )}
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
    </div>
  );
}
