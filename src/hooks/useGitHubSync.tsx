import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Extracts "owner/repo" from "https://github.com/owner/repo"
const extractRepoPath = (url: string) => {
  try {
    const obj = new URL(url);
    if (obj.hostname === "github.com") {
      const parts = obj.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
    }
  } catch (e) {
    return null;
  }
  return null;
};

export function useGitHubSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const syncGitHub = async () => {
      // 1. Get connected GitHub integrations
      const { data: integrations } = await supabase
        .from("integrations")
        .select("*")
        .eq("tool_name", "GitHub")
        .eq("status", "connected");

      if (!integrations || integrations.length === 0) return;

      // 2. Fetch the fallback Project ID (just picking the first project to associate events with)
      const { data: projects } = await supabase.from("projects").select("id").limit(1);
      const projectId = projects?.[0]?.id || null;

      // 3. Sync events for each connected repo
      for (const integration of integrations) {
        const repoPath = extractRepoPath(integration.url);
        if (!repoPath) continue;

        try {
          // Fetch recent events from GitHub's public API
          const res = await fetch(`https://api.github.com/repos/${repoPath}/events?per_page=10`);
          if (!res.ok) continue;
          
          const events = await res.json();
          
          // Filter to PushEvents & PullRequestEvents for cleaner feed
          const relevantEvents = events.filter((e: any) => 
            e.type === "PushEvent" || e.type === "PullRequestEvent" || e.type === "IssuesEvent"
          );

          // 4. Format and push to Supabase if they don't already exist
          for (const item of relevantEvents) {
            let eventType = "unknown";
            let description = "";
            let actor = item.actor.display_login || item.actor.login;

            if (item.type === "PushEvent") {
              eventType = "push";
              const commits = item.payload.commits?.length || 0;
              const msg = item.payload.commits?.[0]?.message || "";
              description = `Pushed ${commits} commit(s): ${msg.split('\n')[0]}`;
            } else if (item.type === "PullRequestEvent") {
              eventType = item.payload.action === "opened" ? "pull_request_opened" : "pull_request_merged";
              description = item.payload.pull_request?.title || "";
            } else if (item.type === "IssuesEvent") {
              eventType = `issue_${item.payload.action}`;
              description = item.payload.issue?.title || "";
            }

            // Construct unique ID based on GitHub event ID
            const eventId = `github-${item.id}`;

            // Check if already synced
            const { data: existing } = await supabase.from("events").select("id").eq("entity_id", eventId).limit(1);
            
            if (!existing || existing.length === 0) {
              await supabase.from("events").insert({
                tool_source: "GitHub",
                event_type: eventType,
                entity_type: "repository",
                entity_id: eventId,
                actor: actor,
                description: description,
                project_id: projectId,
                event_timestamp: item.created_at, // Use GitHub's exact timestamp
              });
            }
          }
        } catch (error) {
          console.error("Failed to sync GitHub:", error);
        }
      }

      // Invalidate the recent events query to refresh the UI feed
      queryClient.invalidateQueries({ queryKey: ["recent-events"] });
    };

    // Run immediately, then every 60 seconds (rate limits permitting)
    syncGitHub();
    const interval = setInterval(syncGitHub, 60000);
    return () => clearInterval(interval);
  }, [queryClient]);
}
