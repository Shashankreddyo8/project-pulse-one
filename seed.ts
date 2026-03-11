import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes("NEEDS_NEW_ANON_KEY")) {
  console.error("Missing valid Supabase keys in .env!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seed() {
  console.log("Starting data seed process...");

  // 1. Organization
  console.log("Inserting organization...");
  const { data: orgs, error: orgError } = await supabase
    .from("organizations")
    .insert([{ name: "Acme Corp", slug: "acme-corp" }])
    .select();

  if (orgError) {
    console.error("Error inserting org:", orgError);
    if (!orgError.message.includes("duplicate key")) {
        // Continue but it might fail later
    }
  }

  // Get org ID (might exist already)
  const { data: existingOrgs } = await supabase.from("organizations").select("id").limit(1);
  const orgId = existingOrgs?.[0]?.id;

  if (!orgId) {
    console.error("Failed to fetch or create organization");
    process.exit(1);
  }

  // 2. Project
  console.log("Inserting project...");
  const { data: projects, error: projError } = await supabase
    .from("projects")
    .insert([{ organization_id: orgId, name: "Core Platform", description: "Main API and Services" }])
    .select();

  if (projError) console.error("Error inserting project:", projError);

  const { data: existingProjs } = await supabase.from("projects").select("id").limit(1);
  const projectId = existingProjs?.[0]?.id;

  if (!projectId) {
     console.error("Failed to fetch or create project");
     process.exit(1);
  }

  // 3. Integrations
  console.log("Inserting integrations...");
  const integrations = [
    { tool_name: "GitHub", url: "https://github.com/acme/core-platform", status: "connected" },
    { tool_name: "Slack", url: "https://acme-corp.slack.com", status: "connected" },
    { tool_name: "Notion", url: "https://notion.so/acme", status: "connected" }
  ];

  for (const inv of integrations) {
     await supabase.from("integrations").insert(inv);
  }

  // 4. Events
  console.log("Inserting events...");
  const events = [
    { project_id: projectId, tool_source: "GitHub", event_type: "push", entity_type: "repository", actor: "johndoe", description: "Pushed 3 commits to main: 'Fix auth bug'" },
    { project_id: projectId, tool_source: "GitHub", event_type: "pull_request_opened", entity_type: "repository", actor: "janedoe", description: "Add Stripe webhooks" },
    { project_id: projectId, tool_source: "Slack", event_type: "message_sent", entity_type: "channel", actor: "build-bot", description: "Deployment #4432 succeeded in production." },
    { project_id: projectId, tool_source: "Notion", event_type: "document_updated", entity_type: "document", actor: "sarahsmith", description: "Updated Q3 Roadmap" },
    { project_id: projectId, tool_source: "GitHub", event_type: "issue_opened", entity_type: "issue", actor: "mikejones", description: "API rate limiting triggering randomly" },
    { project_id: projectId, tool_source: "Slack", event_type: "message_sent", entity_type: "channel", actor: "johndoe", description: "Has anyone seen the downtime on the staging DB?" },
  ];

  for (const ev of events) {
     await supabase.from("events").insert(ev);
  }

  // 5. Signals
  console.log("Inserting signals...");
  const signals = [
    { project_id: projectId, tool_source: "GitHub", signal_type: "high_error_rate", severity: "high", description: "Multiple PRs failing CI build due to unmatched dependencies." },
    { project_id: projectId, tool_source: "Slack", signal_type: "communication_bottleneck", severity: "medium", description: "Design team tagged 15 times in #general without response." },
  ];

  for (const sig of signals) {
     await supabase.from("signals").insert(sig);
  }

  // 6. Insights
  console.log("Inserting insights...");
  const insights = [
    { project_id: projectId, tool_source: "GitHub", title: "Deployment Pipeline Flaky", description: "CI builds have failed 30% of the time this week on the integration step.", confidence_score: 0.85, category: "Engineering" },
    { project_id: projectId, tool_source: "Slack", title: "Unanswered Customer Queries", description: "Support channel has 5 unresolved tickets older than 24 hours.", confidence_score: 0.92, category: "Support" },
  ];

  for (const ins of insights) {
     await supabase.from("insights").insert(ins);
  }

  console.log("✅ Seed completed successfully! Events page should now be populated.");
}

seed();
