import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

const severityStyles: Record<string, string> = {
  low: "bg-primary/10 text-primary",
  medium: "bg-warning/20 text-warning",
  high: "bg-destructive/20 text-destructive",
  critical: "bg-destructive/30 text-destructive",
};

const bloomClass: Record<string, string> = {
  low: "signal-bloom signal-bloom-signal",
  medium: "signal-bloom signal-bloom-warning",
  high: "signal-bloom signal-bloom-warning",
  critical: "signal-bloom signal-bloom-warning",
};

export default function SignalsPage() {
  const queryClient = useQueryClient();

  const { data: signals, isLoading } = useQuery({
    queryKey: ["signals"],
    queryFn: async () => {
      const { data: ints } = await supabase.from("integrations").select("tool_name").eq("status", "connected");
      const tools = ints?.map(i => i.tool_name) || [];
      if (tools.length === 0) return [];

      const { data } = await supabase.from("signals").select("*").in("tool_source", tools).order("detected_at", { ascending: false });
      return data ?? [];
    },
  });

  const resolveSignal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("signals").update({ resolved: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Signal resolved");
      queryClient.invalidateQueries({ queryKey: ["signals"] });
      queryClient.invalidateQueries({ queryKey: ["signals-active"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div>
      <PageHeader title="Signals" description="Detected patterns and anomalies in your workflow" />
      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading signals…</div>
      ) : signals && signals.length > 0 ? (
        <div className="space-y-0">
          {signals.map((signal) => (
            <div key={signal.id} className={`py-6 border-b border-border ${bloomClass[signal.severity] || ""} animate-fade-in`}>
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <span className={`text-[10px] font-heading uppercase tracking-wider px-2 py-1 rounded ${severityStyles[signal.severity] || severityStyles.medium}`}>
                      {signal.severity}
                    </span>
                  </div>
                  <div>
                    <p className="font-heading font-medium text-foreground">{signal?.signal_type?.replace(/_/g, " ") || signal?.signal_type || "Signal"}</p>
                    {signal?.description && <p className="text-sm text-muted-foreground mt-1">{signal.description}</p>}
                    {signal.related_entity && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Related: <span className="text-foreground">{signal.related_entity}</span>
                        {signal.related_entity_id && <span className="text-primary ml-1">#{signal.related_entity_id}</span>}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                  <p className="text-[10px] text-muted-foreground font-heading">{new Date(signal.detected_at).toLocaleString()}</p>
                  {signal.resolved ? (
                    <span className="text-[10px] text-primary font-heading">Resolved</span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] text-primary hover:text-primary hover:bg-primary/10 px-2"
                      onClick={() => resolveSignal.mutate(signal.id)}
                      disabled={resolveSignal.isPending}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground text-sm">
          No signals detected yet. Signals will appear as events are analyzed.
        </div>
      )}
    </div>
  );
}
