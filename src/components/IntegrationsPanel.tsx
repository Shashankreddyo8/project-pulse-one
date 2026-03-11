import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link2, Trash2, CheckCircle, ExternalLink, Github } from "lucide-react";

interface IntegrationConfig {
  name: string;
  key: string;
  icon: React.ReactNode;
  placeholder: string;
  color: string;
  bgColor: string;
  description: string;
  urlPattern: RegExp;
}

const INTEGRATIONS: IntegrationConfig[] = [
  {
    name: "GitHub",
    key: "GitHub",
    icon: <Github className="w-5 h-5" />,
    placeholder: "https://github.com/your-org/your-repo",
    color: "text-white",
    bgColor: "bg-[#24292e]",
    description: "Connect repositories to track commits, PRs, and issues",
    urlPattern: /^https?:\/\/(www\.)?github\.com\/.+/i,
  },
  {
    name: "Slack",
    key: "Slack",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
      </svg>
    ),
    placeholder: "https://your-workspace.slack.com",
    color: "text-white",
    bgColor: "bg-[#4A154B]",
    description: "Connect Slack to track messages and team activity",
    urlPattern: /^https?:\/\/(www\.)?[\w-]+\.slack\.com/i,
  },
  {
    name: "Jira",
    key: "Jira",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.715-5.712H5.715a5.218 5.218 0 0 0 5.233 5.214h2.129v2.058a5.218 5.218 0 0 0 5.214 5.214V6.804a1.001 1.001 0 0 0-1.005-1.003zM23 .006H11.429a5.218 5.218 0 0 0 5.214 5.214h2.129v2.057A5.218 5.218 0 0 0 23.986 12.5V1.005A1 1 0 0 0 23 .006z" />
      </svg>
    ),
    placeholder: "https://your-org.atlassian.net/jira",
    color: "text-white",
    bgColor: "bg-[#0052CC]",
    description: "Connect Jira to track issues, sprints, and boards",
    urlPattern: /^https?:\/\/(www\.)?[\w-]+\.atlassian\.net/i,
  },
  {
    name: "Notion",
    key: "Notion",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L2.58 2.48c-.467.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.886l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952l1.449.327s0 .84-1.168.84l-3.222.187c-.093-.187 0-.653.327-.726l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.234 4.764 7.28v-6.44l-1.215-.14c-.093-.514.28-.886.747-.933zM1.936 1.035l13.872-1.026c1.682-.14 2.1.093 2.8.607l3.876 2.753c.466.326.606.7.606 1.166v16.471c0 1.027-.373 1.634-1.681 1.727l-15.459.933c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.84.374-1.54 1.87-1.632z" />
      </svg>
    ),
    placeholder: "https://www.notion.so/your-workspace",
    color: "text-white",
    bgColor: "bg-[#000000]",
    description: "Connect Notion to sync documents and databases",
    urlPattern: /^https?:\/\/(www\.)?notion\.so\/.+/i,
  },
  {
    name: "CRM",
    key: "CRM",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    placeholder: "https://your-crm.salesforce.com or any CRM URL",
    color: "text-white",
    bgColor: "bg-[#00A1E0]",
    description: "Connect your CRM to track customer interactions",
    urlPattern: /^https?:\/\/.+/i,
  },
];

export default function IntegrationsPanel() {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ["project-tools"],
    queryFn: async () => {
      // Get the first project for this sample
      const { data: projects } = await supabase.from("projects").select("id").limit(1);
      const projectId = projects?.[0]?.id;
      if (!projectId) return [];

      const res = await fetch(`/api/project-tools/${projectId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch tools from backend api");
      }
      const json = await res.json();
      return json.tools ?? [];
    },
  });

  const connectIntegration = useMutation({
    mutationFn: async ({ toolName, url }: { toolName: string; url: string }) => {
      const { data: projects } = await supabase.from("projects").select("id").limit(1);
      const projectId = projects?.[0]?.id;
      if (!projectId) throw new Error("No active project found.");

      const res = await fetch('/api/connect-tool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectId, toolType: toolName, url })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to connect tool via API");
      }
      return json;
    },
    onSuccess: (_data, variables) => {
      toast.success(`${variables.toolName} connected and data extracted!`);
      queryClient.invalidateQueries({ queryKey: ["project-tools"] });
      setUrls((prev) => ({ ...prev, [variables.toolName]: "" }));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const disconnectIntegration = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tools" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Integration disconnected");
      queryClient.invalidateQueries({ queryKey: ["project-tools"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const getConnectedIntegration = (toolName: string) =>
    integrations?.find((i: any) => i.tool_type.toLowerCase() === toolName.toLowerCase());

  const handleConnect = (config: IntegrationConfig) => {
    const url = urls[config.key]?.trim();
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }
    if (!config.urlPattern.test(url)) {
      toast.error(`Please enter a valid ${config.name} URL`);
      return;
    }
    connectIntegration.mutate({ toolName: config.key, url });
  };

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Loading integrations…</div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Link2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-heading font-medium text-foreground">
              {integrations?.length ?? 0} of {INTEGRATIONS.length} connected
            </p>
            <p className="text-[10px] text-muted-foreground">
              {integrations && integrations.length === INTEGRATIONS.length
                ? "All integrations active"
                : "Connect more tools to unlock full tracking"}
            </p>
          </div>
        </div>
        <div className="ml-auto flex gap-1.5">
          {INTEGRATIONS.map((config) => {
            const isConnected = integrations?.some((i: any) => i.tool_type.toLowerCase() === config.key.toLowerCase() && i.status === 'connected');
            return (
              <div
                key={config.key}
                className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold transition-all ${
                  isConnected
                    ? `${config.bgColor} ${config.color} scale-100`
                    : "bg-muted text-muted-foreground scale-90 opacity-40"
                }`}
                title={`${config.name}: ${isConnected ? "Connected" : "Not connected"}`}
              >
                {config.name.charAt(0)}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Connect your tools by providing their URLs. The system will automatically fetch, extract, and analyze useful signals from these sources.
      </p>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {INTEGRATIONS.map((config) => {
          const connected = getConnectedIntegration(config.key);
          const hasFailed = connected?.status === 'connection failed';
          const isConnectedStatus = connected?.status === 'connected';

          return (
            <Card
              key={config.key}
              className={`relative overflow-hidden transition-all duration-200 ${
                isConnectedStatus ? "border-primary/40 shadow-md" : "hover:border-primary/20"
              }`}
            >
              {isConnectedStatus && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/60" />
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
                      {config.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{config.name}</CardTitle>
                      {isConnectedStatus ? (
                        <Badge variant="default" className="mt-1 text-[10px] bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected & Scraping
                        </Badge>
                      ) : hasFailed ? (
                        <Badge variant="destructive" className="mt-1 text-[10px]">
                          Connection Failed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mt-1 text-[10px]">
                          Not connected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="text-xs mt-2">{config.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {connected ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
                      <Link2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">{connected.url}</span>
                      <a
                        href={connected.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                      </a>
                    </div>
                    
                    {/* Display Extracted Signals */}
                    {connected.data && Object.keys(connected.data).length > 0 && (
                       <div className="grid grid-cols-2 gap-3 py-2 border-t border-border/40">
                         {Object.entries(connected.data).map(([key, value]) => (
                           <div key={key} className="flex flex-col">
                             <span className="text-[10px] uppercase font-heading tracking-wider text-muted-foreground mb-0.5">
                               {key.replace(/_/g, ' ')}
                             </span>
                             <span className="text-sm font-medium text-foreground truncate">
                               {String(value)}
                             </span>
                           </div>
                         ))}
                       </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <span className="text-[10px] text-muted-foreground">
                        Last sync: {new Date(connected.connected_at).toLocaleString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => disconnectIntegration.mutate(connected.id)}
                        disabled={disconnectIntegration.isPending}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input
                      type="url"
                      value={urls[config.key] || ""}
                      onChange={(e) =>
                        setUrls((prev) => ({ ...prev, [config.key]: e.target.value }))
                      }
                      placeholder={config.placeholder}
                      className="text-xs h-9"
                    />
                    <Button
                      onClick={() => handleConnect(config)}
                      disabled={!urls[config.key]?.trim() || connectIntegration.isPending}
                      size="sm"
                      className="w-full h-8 text-xs"
                    >
                      <Link2 className="w-3.5 h-3.5 mr-1.5" />
                      {connectIntegration.isPending ? "Connecting…" : "Connect"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
