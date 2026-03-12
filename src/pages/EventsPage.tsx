import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  RefreshCw,
  Filter,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  CheckCircle2,
  Zap,
  Info,
  Globe,
} from "lucide-react";

const EVENT_TYPE_CONFIG: Record<string, { label: string; icon: JSX.Element; color: string; bg: string }> = {
  code_update: {
    label: "Code Update",
    icon: <GitCommit className="w-4 h-4" />,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  system_sync: {
    label: "Sync",
    icon: <RefreshCw className="w-4 h-4" />,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  system_alert: {
    label: "Alert",
    icon: <AlertCircle className="w-4 h-4" />,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  pull_request_opened: {
    label: "Pull Request",
    icon: <GitPullRequest className="w-4 h-4" />,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  task_completed: {
    label: "Task Done",
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "text-success",
    bg: "bg-success/10",
  },
};

function getEventConfig(type: string) {
  return EVENT_TYPE_CONFIG[type] ?? {
    label: type.replace(/_/g, " "),
    icon: <Info className="w-4 h-4" />,
    color: "text-muted-foreground",
    bg: "bg-muted/30",
  };
}

export default function EventsPage() {
  const [filterType, setFilterType] = useState<string>("all");
  const queryClient = useQueryClient();

  // Get first project (MVP assumption)
  const { data: projectId } = useQuery({
    queryKey: ["first-project-id"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id").limit(1);
      return data?.[0]?.id ?? null;
    },
  });

  // Fetch events for the project from our backend
  const { data: events, isLoading } = useQuery({
    queryKey: ["project-events", projectId, filterType],
    enabled: !!projectId,
    queryFn: async () => {
      const url =
        filterType === "all"
          ? `/api/project-events/${projectId}`
          : `/api/project-events/${projectId}?type=${filterType}`;
      const res = await fetch(url);
      if (!res.ok) {
        // Fallback to Supabase direct query if backend unreachable
        const { data } = await supabase
          .from("events")
          .select("*")
          .eq("project_id", projectId)
          .order("event_timestamp", { ascending: false })
          .limit(50);
        return data ?? [];
      }
      const json = await res.json();
      return json.events ?? [];
    },
  });

  // Fetch connected GitHub tool info
  const { data: connectedTools } = useQuery({
    queryKey: ["connected-github-tools", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data } = await supabase
        .from("tools" as any)
        .select("tool_type, url, status, connected_at")
        .eq("project_id", projectId)
        .eq("status", "connected");
      return data ?? [];
    },
  });

  const githubTools = (connectedTools as any[])?.filter(
    (t: any) => t.tool_type?.toLowerCase() === "github"
  );

  // Refresh mutation — re-scrapes tools and regenerates events
  const refreshEvents = useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error("No project found.");
      const res = await fetch(`/api/refresh-events/${projectId}`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || json.error || "Refresh failed");
      }
      return json;
    },
    onSuccess: (data) => {
      toast.success(`Refreshed ${data.toolsRefreshed} tool(s). Events updated.`);
      queryClient.invalidateQueries({ queryKey: ["project-events"] });
      queryClient.invalidateQueries({ queryKey: ["risks-active"] });
      queryClient.invalidateQueries({ queryKey: ["latest-recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["recent-events"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const uniqueTypes = Array.from(new Set(events?.map((e: any) => e.event_type) ?? []));

  return (
    <div>
      <PageHeader
        title="GitHub Events"
        description="Live activity events extracted from your connected GitHub repositories and tools"
        actions={
          <Button
            onClick={() => refreshEvents.mutate()}
            disabled={refreshEvents.isPending || !projectId}
            size="sm"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshEvents.isPending ? "animate-spin" : ""}`}
            />
            {refreshEvents.isPending ? "Refreshing…" : "Refresh from GitHub"}
          </Button>
        }
      />

      <div className="mt-6 space-y-6">
        {/* Connected GitHub Sources Banner */}
        {githubTools && githubTools.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {(githubTools as any[]).map((tool: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-primary/20 text-sm"
              >
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span className="text-foreground font-medium truncate max-w-[200px]">
                  {tool.url}
                </span>
                <Badge
                  variant="default"
                  className="text-[10px] bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground mr-1">Filter:</span>
          <button
            onClick={() => setFilterType("all")}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              filterType === "all"
                ? "bg-primary/20 border-primary/40 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            All
          </button>
          {uniqueTypes.map((type) => {
            const cfg = getEventConfig(type as string);
            return (
              <button
                key={type}
                onClick={() => setFilterType(type as string)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1 ${
                  filterType === type
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-card border border-border animate-pulse"
              />
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="space-y-2">
            {events.map((event: any) => {
              const cfg = getEventConfig(event.event_type);
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/20 hover:bg-card/80 transition-all"
                >
                  {/* Icon */}
                  <div
                    className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}
                  >
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-xs font-semibold font-heading uppercase tracking-wider ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                      <Zap className="w-3 h-3 text-muted-foreground/50" />
                      <span className="text-xs text-muted-foreground">Pulse Engine</span>
                    </div>
                    <p className="text-sm text-foreground">
                      {event.description || event.event_type?.replace(/_/g, " ")}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <time className="text-[11px] text-muted-foreground font-mono shrink-0 mt-0.5">
                    {event.event_timestamp
                      ? new Date(event.event_timestamp).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </time>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <GitCommit className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">No events yet</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-6">
              Connect a GitHub repository from the Integrations page, then click{" "}
              <strong>Refresh from GitHub</strong> to pull live events.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshEvents.mutate()}
              disabled={refreshEvents.isPending}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
