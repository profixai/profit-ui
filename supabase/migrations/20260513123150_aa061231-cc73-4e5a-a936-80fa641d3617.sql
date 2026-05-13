CREATE TABLE IF NOT EXISTS public.benchmark_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  rooms integer,
  star_category text,
  region_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.benchmark_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit benchmark lead"
  ON public.benchmark_leads FOR INSERT
  WITH CHECK (true);