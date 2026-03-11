import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/PageHeader";

export default function InsightsPage() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["insights-all"],
    queryFn: async () => {
      const { data } = await supabase.from("insights").select("*, projects(name)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div>
      <PageHeader title="Insights" description="AI-generated intelligence from your operational data" />
      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading insights…</div>
      ) : insights && insights.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <div key={insight.id} className="rounded-lg border border-accent/20 bg-card p-6 animate-fade-in" style={{ background: "var(--gradient-insight)" }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  {insight.category && (
                    <span className="text-[10px] font-heading text-accent uppercase tracking-wider">{insight.category}</span>
                  )}
                </div>
                {insight.confidence_score != null && (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${insight.confidence_score * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-heading text-accent">{Math.round(insight.confidence_score * 100)}%</span>
                  </div>
                )}
              </div>
              <h3 className="font-heading font-medium text-foreground">{insight.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{insight.description}</p>
              {(insight as any).projects?.name && (
                <p className="text-xs text-muted-foreground mt-3">
                  Project: <span className="text-primary">{(insight as any).projects.name}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground text-sm">
          No insights generated yet. Insights will appear as the system analyzes your data.
        </div>
      )}
    </div>
  );
}
