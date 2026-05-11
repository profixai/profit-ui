-- Scenarios table for narrative demo cards (e.g. Secretary booking flow)
CREATE TABLE public.scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  narrative TEXT NOT NULL,
  metric TEXT NOT NULL,
  actual NUMERIC NOT NULL,
  threshold NUMERIC NOT NULL,
  recommendation TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical','warning','info')),
  department TEXT NOT NULL,
  image_keyword TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- Public read so the demo flow renders without auth
CREATE POLICY "Scenarios are viewable by everyone"
ON public.scenarios FOR SELECT
USING (true);