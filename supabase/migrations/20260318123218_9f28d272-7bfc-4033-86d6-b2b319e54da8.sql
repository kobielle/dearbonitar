
-- Create whispers table
CREATE TABLE IF NOT EXISTS public.whispers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whispers ENABLE ROW LEVEL SECURITY;

-- Anyone can read whispers
CREATE POLICY "Anyone can read whispers" ON public.whispers
  FOR SELECT TO public USING (true);

-- Only admins can manage whispers
CREATE POLICY "Admins can manage whispers" ON public.whispers
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed initial whispers
INSERT INTO public.whispers (message) VALUES
  ('Kindness is free. Spread it everywhere. 💛'),
  ('One person''s extra is another person''s blessing.'),
  ('Give what you can, take only what you need.'),
  ('Every small act of generosity changes a life.'),
  ('Your unused items could be someone''s answered prayer.');

-- Create reviews table if not exists
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid REFERENCES public.profiles(id) NOT NULL,
  reviewed_user_id uuid REFERENCES public.profiles(id) NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can create reviews" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

-- Enable realtime for messages table (idempotent - ignore if already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;
