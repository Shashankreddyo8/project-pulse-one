import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/PageHeader";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: taskCounts } = useQuery({
    queryKey: ["task-counts-by-project"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("project_id");
      const counts: Record<string, number> = {};
      data?.forEach((t) => { counts[t.project_id] = (counts[t.project_id] || 0) + 1; });
      return counts;
    },
  });

  const { data: eventCounts } = useQuery({
    queryKey: ["event-counts-by-project"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("project_id");
      const counts: Record<string, number> = {};
      data?.forEach((e) => { if (e.project_id) counts[e.project_id] = (counts[e.project_id] || 0) + 1; });
      return counts;
    },
  });

  const statusColors: Record<string, string> = {
    active: "bg-primary/20 text-primary",
    paused: "bg-warning/20 text-warning",
    completed: "bg-accent/20 text-accent",
  };

  return (
    <div>
      <PageHeader title="Projects" description="All projects in your organization" />
      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading projects…</div>
      ) : projects && projects.length > 0 ? (
        <div className="space-y-0">
          {projects.map((project) => (
            <div key={project.id} className="py-6 border-b border-border flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center font-heading text-sm font-semibold text-primary">
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-heading font-medium text-foreground">{project.name}</p>
                  {project.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-md">{project.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-heading text-sm text-foreground">{taskCounts?.[project.id] ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground">tasks</p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-sm text-foreground">{eventCounts?.[project.id] ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground">events</p>
                </div>
                <span className={`text-[10px] font-heading uppercase tracking-wider px-2 py-1 rounded ${statusColors[project.status] || statusColors.active}`}>
                  {project.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground text-sm">
          No projects yet. Create your first project to get started.
        </div>
      )}
    </div>
  );
}
