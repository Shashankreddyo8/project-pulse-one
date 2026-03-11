import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import apiRoutes from './routes/api.js';

// Load env vars from the parent directory .env
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Main API routes
app.use('/api', apiRoutes);

// Setup background worker (runs every 12 hours)
cron.schedule('0 */12 * * *', async () => {
  console.log('Running background cron job to refresh tool data...');
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get unique active projects
    const { data: projects } = await supabase.from('projects').select('id');
    
    if (projects) {
        for (const proj of projects) {
            console.log(`Auto-analyzing ${proj.id}...`);
            const { analyzeProject } = await import('./services/analyzer.js');
            await analyzeProject(proj.id, supabase);
        }
    }
    
    console.log('Cron triggered successfully.');
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
