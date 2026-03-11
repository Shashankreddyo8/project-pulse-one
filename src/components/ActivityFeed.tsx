import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { CheckCircle, AlertCircle, MessageSquare, GitPullRequest, Settings, Terminal } from "lucide-react";

const getEventIcon = (type: string) => {
  if (type.includes("pull_request")) return <GitPullRequest className="w-4 h-4" />;
  if (type.includes("message")) return <MessageSquare className="w-4 h-4" />;
  if (type.includes("task_completed")) return <CheckCircle className="w-4 h-4 text-green-500" />;
  if (type.includes("task")) return <CheckCircle className="w-4 h-4 text-muted-foreground" />;
  if (type.includes("deployment")) return <Terminal className="w-4 h-4 text-accent" />;
  return <AlertCircle className="w-4 h-4" />;
};

export function ActivityFeed() {
  const { data: recentEvents, isLoading } = useQuery({
    queryKey: ["recent-events", "feed"],
    queryFn: async () => {
      const { data: ints } = await supabase.from("integrations").select("tool_name").eq("status", "connected");
      const tools = ints?.map(i => i.tool_name) || [];
      if (tools.length === 0) return [];

      const { data } = await supabase
        .from("events")
        .select("*")
        .in("tool_source", tools)
        .order("event_timestamp", { ascending: false })
        .limit(8);
      return data ?? [];
    },
  });

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground border border-border rounded-lg bg-card">Loading activity...</div>;
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-base font-semibold text-foreground">Recent Activity</h2>
        <button className="text-[12px] text-primary hover:text-primary/80 transition-colors font-medium">View All</button>
      </div>

      {recentEvents && recentEvents.length > 0 ? (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {recentEvents.map((event) => (
            <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-fade-in">
              {/* Icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-muted text-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                {getEventIcon(event?.event_type || "")}
              </div>
              
              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-border bg-card/50 shadow-sm transition-all hover:bg-muted/30 hover:shadow-md hover:border-primary/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-heading text-xs font-semibold text-primary/80 capitalize">
                    {event.tool_source}
                  </span>
                  <time className="text-[10px] text-muted-foreground font-mono">
                    {new Date(event.event_timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </time>
                </div>
                <p className="text-sm font-medium text-foreground">
                  <span className="text-muted-foreground font-normal mr-1">{event?.actor || "System"}</span>
                  {event?.event_type?.replace(/_/g, " ") || event?.event_type || "Event"}
                </p>
                {event?.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{event.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <Settings className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-foreground mb-1">No activity yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Activity from connected tools will appear here in real-time.
          </p>
        </div>
      )}
    </div>
  );
}
