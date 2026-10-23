CREATE TABLE public.sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

ALTER TABLE public.sponsors
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sponsors"
ON public.sponsors
FOR SELECT
TO anon, authenticated
USING (true);
