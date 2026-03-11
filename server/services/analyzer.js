import { createClient } from '@supabase/supabase-js';

export async function analyzeProject(projectId, supabaseInstance) {
  try {
    console.log(`Starting analysis for project: ${projectId}`);
    
    // 1. Fetch all tool_data for this project
    const { data: tools } = await supabaseInstance
      .from('tools')
      .select('id, tool_type')
      .eq('project_id', projectId);

    if (!tools || tools.length === 0) {
       console.log("No tools connected for this project.");
       return { events: [], risks: [], recommendations: [] };
    }

    const toolIds = tools.map(t => t.id);
    const { data: toolDataArr } = await supabaseInstance
      .from('tool_data')
      .select('*')
      .in('tool_id', toolIds);

    // Group data easily
    const projectKV = {};
    toolDataArr?.forEach(td => {
      projectKV[td.data_key] = td.data_value;
    });

    const newEvents = [];
    const newRisks = [];
    const newRecommendations = [];

    // --- RULES ENGINE ---
    
    // GITHUB RULES
    if (projectKV['open_issues']) {
        const issues = parseInt(projectKV['open_issues']);
        if (issues > 50) {
            newRisks.push({
                project_id: projectId,
                risk_level: 'High',
                risk_type: 'Issue Backlog',
                description: `High number of open issues detected (${issues}). The issue backlog is growing significantly.`
            });
            newRecommendations.push({
                project_id: projectId,
                title: 'Resolve pending issues',
                recommendation_text: 'Dedicate development time or a sprint exclusively to resolving the growing issue backlog.'
            });
            newEvents.push({
                project_id: projectId,
                event_type: 'system_alert',
                description: 'Issue backlog increased over high thresholds.'
            });
        } else if (issues > 20) {
            newRisks.push({
                project_id: projectId,
                risk_level: 'Medium',
                risk_type: 'Issue Backlog',
                description: 'Issue backlog is beginning to increase.'
            });
        }
    }

    if (projectKV['last_commit_date']) {
        const lastCommitDate = new Date(projectKV['last_commit_date']);
        const daysAgo = (new Date() - lastCommitDate) / (1000 * 60 * 60 * 24);
        
        if (daysAgo > 30) {
             newRisks.push({
                project_id: projectId,
                risk_level: 'High',
                risk_type: 'Development Velocity',
                description: 'Development activity dropped significantly. No commits in the last 30 days.'
            });
            newRecommendations.push({
                project_id: projectId,
                title: 'Resume development activity',
                recommendation_text: 'Review project status and re-allocate resources to resume active development.'
            });
        }
        
        // Log an event that a recent commit was detected
        if (daysAgo < 3) {
            newEvents.push({
                project_id: projectId,
                event_type: 'code_update',
                description: 'New commits detected on GitHub repository recently.'
            });
        }
    }

    // JIRA RULES
    if (projectKV['visible_issues']) {
        const jiraIssues = parseInt(projectKV['visible_issues']);
        if (jiraIssues > 100) {
             newRisks.push({
                project_id: projectId,
                risk_level: 'Medium',
                risk_type: 'Sprint Planning',
                description: 'Large amount of visible issues tracked in Jira.'
            });
             newRecommendations.push({
                project_id: projectId,
                title: 'Improve sprint planning',
                recommendation_text: 'Groom the Jira backlog and archive stale tickets to improve visibility.'
            });
        }
    }

    // NOTION / DOCS RULES
    if (projectKV['last_edited']) {
        const lastEditedDate = new Date(projectKV['last_edited']);
        const daysAgo = (new Date() - lastEditedDate) / (1000 * 60 * 60 * 24);
        if (daysAgo > 90) {
            newRisks.push({
                project_id: projectId,
                risk_level: 'Low',
                risk_type: 'Documentation',
                description: 'Documentation slightly outdated. Not updated in 3 months.'
            });
            newRecommendations.push({
                project_id: projectId,
                title: 'Update documentation',
                recommendation_text: 'Schedule a time to review and update the Notion workspace documentation for accuracy.'
            });
        }
    }

    // CRM RULES
    if (projectKV['customer_interaction_score']) {
         const score = parseInt(projectKV['customer_interaction_score']);
         if (score < 40) {
             newRecommendations.push({
                project_id: projectId,
                title: 'Address customer concerns',
                recommendation_text: 'Customer interaction indicators point to lower satisfaction. Review support tickets.'
            });
         }
    }

    // Insert generic event just to show activity
    newEvents.push({
        project_id: projectId,
        event_type: 'system_sync',
        description: 'Auto-sync completed and signals extracted across all connected platforms.'
    });

    // --- APPLY AND STORE ---
    
    // Clear out old generated data for risks and recommendations so we don't have infinite lists
    await supabaseInstance.from('risks').delete().eq('project_id', projectId);
    await supabaseInstance.from('recommendations').delete().eq('project_id', projectId);

    if (newRisks.length > 0) {
        await supabaseInstance.from('risks').insert(newRisks);
    }
    
    if (newRecommendations.length > 0) {
        await supabaseInstance.from('recommendations').insert(newRecommendations);
    }

    if (newEvents.length > 0) {
        await supabaseInstance.from('events').insert(newEvents);
    }

    console.log(`Finished analysis for project: ${projectId}. Generated ${newEvents.length} events, ${newRisks.length} risks, ${newRecommendations.length} recommendations.`);

    return { events: newEvents, risks: newRisks, recommendations: newRecommendations };

  } catch (error) {
    console.error(`Error during analysis: ${error.message}`);
    throw error;
  }
}
