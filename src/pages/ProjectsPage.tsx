import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

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

  const createProject = useMutation({
    mutationFn: async () => {
      // First ensure an organization exists
      let { data: orgs } = await supabase.from("organizations").select("id").limit(1);
      let orgId: string;
      if (!orgs || orgs.length === 0) {
        const { data: newOrg, error: orgError } = await supabase
          .from("organizations")
          .insert({ name: "Default Organization", slug: "default" })
          .select("id")
          .single();
        if (orgError) throw orgError;
        orgId = newOrg.id;
      } else {
        orgId = orgs[0].id;
      }
      const { error } = await supabase.from("projects").insert({
        name: name.trim(),
        description: description.trim() || null,
        organization_id: orgId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Project created");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects-count"] });
      setName("");
      setDescription("");
      setShowForm(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const statusColors: Record<string, string> = {
    active: "bg-primary/20 text-primary",
    paused: "bg-warning/20 text-warning",
    completed: "bg-accent/20 text-accent",
  };

  return (
    <div>
      <PageHeader
        title="Projects"
        description="All projects in your organization"
        actions={
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "secondary" : "default"} size="sm">
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? "Cancel" : "New Project"}
          </Button>
        }
      />

      {showForm && (
        <div className="rounded-lg border border-primary/20 bg-card p-6 mb-8 animate-fade-in">
          <h3 className="font-heading text-sm font-medium text-foreground mb-4">Create Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Project Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Backend API" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => createProject.mutate()} disabled={!name.trim() || createProject.isPending} size="sm">
              {createProject.isPending ? "Creating…" : "Create Project"}
            </Button>
          </div>
        </div>
      )}

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
