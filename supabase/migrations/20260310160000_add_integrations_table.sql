-- Integrations table to store tool connection URLs
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'connected',
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read integrations" ON public.integrations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert integrations" ON public.integrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update integrations" ON public.integrations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete integrations" ON public.integrations FOR DELETE USING (true);

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
