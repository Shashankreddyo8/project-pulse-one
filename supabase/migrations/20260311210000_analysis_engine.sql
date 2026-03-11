-- Drop existing tables to recreate them with the newly requested fields if needed, 
-- or we can just alter them. The prompt specified precise formats, so let's recreate them cleanly.
DROP TABLE IF EXISTS public.recommendations CASCADE;
DROP TABLE IF EXISTS public.risks CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;

-- Create Events Table
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Map to the dashboard's expected event_timestamp column
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and policies
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for events" ON public.events FOR ALL USING (true) WITH CHECK (true);

-- Create Risks Table (Maps to 'signals' in the current frontend terminology)
CREATE TABLE public.risks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    risk_level TEXT CHECK (risk_level IN ('Low', 'Medium', 'High')),
    risk_type TEXT NOT NULL,
    description TEXT,
    resolved BOOLEAN DEFAULT false, -- For the dashboard tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and policies
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for risks" ON public.risks FOR ALL USING (true) WITH CHECK (true);

-- Create Recommendations Table (Maps to 'insights' in the current frontend terminology)
CREATE TABLE public.recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    recommendation_text TEXT NOT NULL,
    title TEXT, -- To map to the dashboard title
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and policies
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for recommendations" ON public.recommendations FOR ALL USING (true) WITH CHECK (true);
