CREATE TABLE public.benchmark_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  rooms INTEGER NOT NULL,
  star_category TEXT NOT NULL,
  region_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.benchmark_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insert only"
ON public.benchmark_leads FOR INSERT
WITH CHECK (true);
