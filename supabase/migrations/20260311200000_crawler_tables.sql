-- Create tools table
CREATE TABLE IF NOT EXISTS public.tools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    tool_type TEXT NOT NULL,
    url TEXT NOT NULL,
    status TEXT DEFAULT 'connecting',
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, tool_type, url)
);

-- Ensure RLS is enabled and policies are open for this demo/MVP
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for tools" ON public.tools FOR ALL USING (true) WITH CHECK (true);

-- Create tool_data table for storing key-value signals
CREATE TABLE IF NOT EXISTS public.tool_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
    data_key TEXT NOT NULL,
    data_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tool_id, data_key)
);

-- Enable RLS and policies
ALTER TABLE public.tool_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for tool_data" ON public.tool_data FOR ALL USING (true) WITH CHECK (true);
