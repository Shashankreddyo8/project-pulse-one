import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/PageHeader";

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
  const { data: signals, isLoading } = useQuery({
    queryKey: ["signals"],
    queryFn: async () => {
      const { data } = await supabase.from("signals").select("*").order("detected_at", { ascending: false });
      return data ?? [];
    },
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
                    <p className="font-heading font-medium text-foreground">{signal.signal_type.replace(/_/g, " ")}</p>
                    {signal.description && <p className="text-sm text-muted-foreground mt-1">{signal.description}</p>}
                    {signal.related_entity && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Related: <span className="text-foreground">{signal.related_entity}</span>
                        {signal.related_entity_id && <span className="text-primary ml-1">#{signal.related_entity_id}</span>}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted-foreground font-heading">{new Date(signal.detected_at).toLocaleString()}</p>
                  {signal.resolved && <span className="text-[10px] text-primary font-heading">Resolved</span>}
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
