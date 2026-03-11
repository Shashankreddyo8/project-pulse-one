import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fetchAndExtract } from '../services/scraper.js';
import { analyzeProject } from '../services/analyzer.js';

dotenv.config({ path: '../.env' });

const router = express.Router();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; // Using public key or service role if needed
const supabase = createClient(supabaseUrl, supabaseKey);

// POST /api/connect-tool
router.post('/connect-tool', async (req, res) => {
  const { projectId, toolType, url } = req.body;

  if (!projectId || !toolType || !url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Validate & Store URL in database (tools table)
    let toolId;
    const { data: existingTool, error: selErr } = await supabase
      .from('tools')
      .select('id')
      .eq('project_id', projectId)
      .eq('tool_type', toolType)
      .eq('url', url)
      .single();

    if (existingTool) {
      toolId = existingTool.id;
    } else {
      const { data: newTool, error: insErr } = await supabase
        .from('tools')
        .insert({
          project_id: projectId,
          tool_type: toolType,
          url: url,
          status: 'connecting',
        })
        .select()
        .single();
      
      if (insErr) {
        console.error("Failed to insert tool:", insErr);
        // Supabase schema might not have this table yet, let's gracefully fail or mock it.
        throw new Error("Failed to insert tracking into 'tools' table. Ensure schema exists.");
      }
      toolId = newTool.id;
    }

    // 2. Fetch and Extract Data
    let extractedData;
    try {
      extractedData = await fetchAndExtract(url, toolType);
      
      // Update status to connected
      await supabase.from('tools').update({ status: 'connected' }).eq('id', toolId);
    } catch (scrapeErr) {
      await supabase.from('tools').update({ status: 'connection failed' }).eq('id', toolId);
      throw new Error("Connection failed while scraping.");
    }

    // 3. Store Results in database (tool_data table)
    const dataEntries = Object.entries(extractedData).map(([key, value]) => ({
      tool_id: toolId,
      data_key: key,
      data_value: String(value)
    }));
    
    // Clear old data for an update
    await supabase.from('tool_data').delete().eq('tool_id', toolId);
    
    // Insert new data
    const { error: dataErr } = await supabase.from('tool_data').insert(dataEntries);
    if (dataErr) {
        console.error("Failed to insert tool_data:", dataErr);
        throw new Error("Extracted data, but failed to store in 'tool_data' table.");
    }
    
    // 4. Run Analysis Engine
    let analysisResults = { events: [], risks: [], recommendations: [] };
    try {
        analysisResults = await analyzeProject(projectId, supabase);
    } catch (anError) {
        console.error("Analysis engine failed:", anError);
        // We don't want to throw a 500 if just the analysis fails, the connection still succeeded.
    }

    // Return extracted data back to frontend
    res.json({
      success: true,
      toolId,
      extractedData,
      analysisResults
    });

  } catch (error) {
    console.error(`Status 500 - API Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/project-tools/:projectId
router.get('/project-tools/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    const { data: tools, error: toolErr } = await supabase
      .from('tools')
      .select('*')
      .eq('project_id', projectId);

    if (toolErr) throw toolErr;

    if (!tools || tools.length === 0) {
      return res.json({ tools: [] });
    }

    const toolIds = tools.map(t => t.id);
    
    // Fetch associated data
    const { data: toolData, error: dataErr } = await supabase
      .from('tool_data')
      .select('*')
      .in('tool_id', toolIds);

    if (dataErr) throw dataErr;

    // Merge them together
    const mergedTools = tools.map(tool => {
        const relatedData = toolData.filter(td => td.tool_id === tool.id);
        const dataMap = {};
        relatedData.forEach(td => {
            dataMap[td.data_key] = td.data_value;
        });
        return {
            ...tool,
            data: dataMap
        };
    });

    res.json({ tools: mergedTools });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
