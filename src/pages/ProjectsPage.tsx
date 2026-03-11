import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, X, FolderKanban, ArrowRight, Activity, TrendingUp, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false);
  const [projectUrl, setProjectUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
      setIsAnalyzing(true);
      // Simulate an AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Extract a dummy name from the URL or use a default
      let parsedName = "New Analyzed Project";
      try {
        const urlObj = new URL(projectUrl.startsWith('http') ? projectUrl : `https://${projectUrl}`);
        parsedName = urlObj.hostname.replace('www.', '') + urlObj.pathname;
      } catch (e) {
        if (projectUrl.length > 0) parsedName = projectUrl;
      }

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
        name: parsedName.substring(0, 50),
        description: `Analyzed from: ${projectUrl}`,
        organization_id: orgId,
      });
      if (error) throw error;
      return parsedName;
    },
    onSuccess: (name) => {
      toast.success(`Successfully analyzed ${name}`);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects-count"] });
      setProjectUrl("");
      setShowForm(false);
      setIsAnalyzing(false);
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setIsAnalyzing(false);
    },
  });

  const healthScores = [92, 78, 45, 88, 65, 95]; // Mock scores for visual flair

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-white">Projects</h1>
          <p className="text-muted-foreground mt-1 text-sm">Monitor the health and activity of your connected repositories.</p>
        </div>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-primary hover:bg-primary/90 text-white font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Analyze New Project
          </Button>
        )}
      </div>

      {showForm && (
        <div className="relative rounded-2xl border border-primary/30 bg-card/60 backdrop-blur-xl p-8 md:p-12 overflow-hidden shadow-2xl shadow-primary/10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="absolute top-0 right-0 p-4 z-10">
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-white transition-colors bg-background/50 rounded-full p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-2xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 border border-primary/20 shadow-lg shadow-primary/20">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3 tracking-tight">
              Analyze a New Project
            </h2>
            <p className="text-muted-foreground mb-10">
              Paste a repository, documentation link, or product URL to instantly generate a health pulse.
            </p>
            
            <div className="relative group flex items-center">
              <input 
                type="url"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://github.com/organization/repo..."
                disabled={isAnalyzing}
                className="w-full h-16 pl-6 pr-32 rounded-xl border border-border/50 bg-background/80 text-white placeholder:text-muted-foreground/60 text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner disabled:opacity-50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && projectUrl.trim()) {
                    createProject.mutate();
                  }
                }}
              />
              <button 
                onClick={() => createProject.mutate()}
                disabled={!projectUrl.trim() || isAnalyzing}
                className="absolute right-2 top-2 bottom-2 px-6 flex items-center justify-center bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all disabled:opacity-50 shadow-md"
              >
                {isAnalyzing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Analyze <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-8 pt-8 border-t border-border/30 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><FolderKanban className="w-4 h-4 text-primary/70" /> Instantly creates a workspace</span>
              <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-warning/70" /> Extracts key risk signals</span>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 rounded-xl border border-border/40 bg-card/20 animate-pulse" />
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => {
            const mockScore = healthScores[index % healthScores.length];
            const isHealthy = mockScore >= 80;
            const isWarning = mockScore >= 50 && mockScore < 80;
            
            return (
              <div 
                key={project.id} 
                onClick={() => navigate(`/app/projects/${project.id}`)}
                className="group rounded-xl border border-border/50 bg-card/40 hover:bg-card/80 p-6 flex flex-col transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-background/80 border border-border flex items-center justify-center font-heading text-xl font-bold text-white shadow-sm">
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                    isHealthy ? 'bg-success/10 border-success/20 text-success' : 
                    isWarning ? 'bg-warning/10 border-warning/20 text-warning' : 
                    'bg-destructive/10 border-destructive/20 text-destructive'
                  }`}>
                    <TrendingUp className={`w-3.5 h-3.5 ${!isHealthy && !isWarning ? 'rotate-180' : ''}`} />
                    <span className="text-xs font-bold">{mockScore}/100</span>
                  </div>
                </div>

                <div className="mb-6 flex-1">
                  <h3 className="text-lg font-heading font-semibold text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">{project.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.description || "No description provided."}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-heading">Signals</p>
                    <p className="text-lg font-semibold text-white">{eventCounts?.[project.id] ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-heading">Open Tasks</p>
                    <p className="text-lg font-semibold text-white">{taskCounts?.[project.id] ?? 0}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 px-4 rounded-xl border-2 border-dashed border-border/50 bg-card/20">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <FolderKanban className="w-10 h-10 text-primary/50" />
          </div>
          <h3 className="text-xl font-heading font-semibold text-white mb-2">No projects yet</h3>
          <p className="text-muted-foreground max-w-sm text-center mb-8">
            Create your first project by analyzing a repository or documentation site to start gathering insights.
          </p>
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-primary hover:bg-primary/90 text-white font-medium"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze First Project
          </Button>
        </div>
      )}
    </div>
  );
}
