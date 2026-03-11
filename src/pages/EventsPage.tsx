import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

const toolSources = ["GitHub", "Slack", "Jira", "Notion"];
const eventTypes = ["task_created", "pull_request_opened", "message_sent", "task_completed", "review_requested", "deployment_triggered"];
const entityTypes = ["task", "message", "pull_request", "issue", "document"];

export default function EventsPage() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    tool_source: "",
    event_type: "",
    entity_type: "",
    entity_id: "",
    actor: "",
    description: "",
    project_id: "",
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").order("event_timestamp", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const { data: projects } = useQuery({
    queryKey: ["projects-list"],
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id, name");
      return data ?? [];
    },
  });

  const insertEvent = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("events").insert({
        tool_source: form.tool_source,
        event_type: form.event_type,
        entity_type: form.entity_type,
        entity_id: form.entity_id || null,
        actor: form.actor || null,
        description: form.description || null,
        project_id: form.project_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event recorded");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["recent-events"] });
      setForm({ tool_source: "", event_type: "", entity_type: "", entity_id: "", actor: "", description: "", project_id: "" });
      setShowForm(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toolColors: Record<string, string> = {
    GitHub: "text-primary",
    Slack: "text-warning",
    Jira: "text-accent",
    Notion: "text-foreground",
  };

  return (
    <div>
      <PageHeader
        title="Events"
        description="Simulate tool integrations by logging activity events"
        actions={
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "secondary" : "default"} size="sm">
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? "Cancel" : "Log Event"}
          </Button>
        }
      />

      {showForm && (
        <div className="rounded-lg border border-primary/20 bg-card p-6 mb-8 animate-fade-in">
          <h3 className="font-heading text-sm font-medium text-foreground mb-4">New Event Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Tool Source *</Label>
              <Select value={form.tool_source} onValueChange={(v) => setForm({ ...form, tool_source: v })}>
                <SelectTrigger><SelectValue placeholder="Select tool" /></SelectTrigger>
                <SelectContent>
                  {toolSources.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Event Type *</Label>
              <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                <SelectTrigger><SelectValue placeholder="Select event type" /></SelectTrigger>
                <SelectContent>
                  {eventTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Entity Type *</Label>
              <Select value={form.entity_type} onValueChange={(v) => setForm({ ...form, entity_type: v })}>
                <SelectTrigger><SelectValue placeholder="Select entity type" /></SelectTrigger>
                <SelectContent>
                  {entityTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Project</Label>
              <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select project (optional)" /></SelectTrigger>
                <SelectContent>
                  {projects?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Entity ID</Label>
              <Input value={form.entity_id} onChange={(e) => setForm({ ...form, entity_id: e.target.value })} placeholder="e.g. TASK-42" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Actor / User</Label>
              <Input value={form.actor} onChange={(e) => setForm({ ...form, actor: e.target.value })} placeholder="e.g. john.doe" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What happened?" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => insertEvent.mutate()}
              disabled={!form.tool_source || !form.event_type || !form.entity_type || insertEvent.isPending}
              size="sm"
            >
              {insertEvent.isPending ? "Recording…" : "Record Event"}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading events…</div>
      ) : events && events.length > 0 ? (
        <div className="space-y-0">
          {events.map((event) => (
            <div key={event.id} className="py-4 border-b border-border animate-fade-in">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className={`font-heading text-xs font-medium ${toolColors[event.tool_source] || "text-foreground"}`}>
                    {event.tool_source}
                  </span>
                  <div>
                    <p className="text-sm text-foreground">
                      <span className="text-muted-foreground">{event.actor ?? "Unknown"}</span>
                      {" · "}
                      <span className="font-heading text-xs">{event.event_type.replace(/_/g, " ")}</span>
                    </p>
                    {event.description && <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-heading shrink-0">
                  {new Date(event.event_timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground text-sm">
          No events recorded. Click "Log Event" to simulate tool activity.
        </div>
      )}
    </div>
  );
}
