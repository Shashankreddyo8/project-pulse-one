import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/PageHeader";

const priorityStyles: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-warning/20 text-warning",
  critical: "bg-destructive/20 text-destructive",
};

const actionIcons: Record<string, string> = {
  reassign_task: "↻",
  add_reviewer: "+",
  split_task: "⧫",
  adjust_scope: "⇔",
};

export default function RecommendationsPage() {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["recommendations"],
    queryFn: async () => {
      const { data: ints } = await supabase.from("integrations").select("tool_name").eq("status", "connected");
      const tools = ints?.map(i => i.tool_name) || [];
      if (tools.length === 0) return [];

      const { data } = await supabase.from("recommendations").select("*, projects(name)").in("tool_source", tools).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div>
      <PageHeader title="Recommendations" description="Actionable suggestions to improve your workflow" />
      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading recommendations…</div>
      ) : recommendations && recommendations.length > 0 ? (
        <div className="space-y-0">
          {recommendations.map((rec) => (
            <div key={rec.id} className="py-6 border-b border-border animate-fade-in">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center font-heading text-lg text-primary">
                    {actionIcons[rec.action_type] || "→"}
                  </div>
                  <div>
                    <p className="font-heading font-medium text-foreground">{rec.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-heading uppercase tracking-wider text-muted-foreground">
                        {rec?.action_type?.replace(/_/g, " ") || rec?.action_type || "Action"}
                      </span>
                      {(rec as any).projects?.name && (
                        <span className="text-[10px] text-primary">
                          {(rec as any).projects.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-[10px] font-heading uppercase tracking-wider px-2 py-1 rounded ${priorityStyles[rec.priority ?? "medium"]}`}>
                    {rec.priority}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-heading capitalize">{rec.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground text-sm">
          No recommendations yet. Recommendations will be generated from insights.
        </div>
      )}
    </div>
  );
}
