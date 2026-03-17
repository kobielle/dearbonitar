-- Chat read-tracking for unread counters
CREATE TABLE IF NOT EXISTS public.conversation_reads (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE public.conversation_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own read states" ON public.conversation_reads;
CREATE POLICY "Users can view own read states"
ON public.conversation_reads
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_reads.conversation_id
      AND cp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert own read states" ON public.conversation_reads;
CREATE POLICY "Users can insert own read states"
ON public.conversation_reads
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_reads.conversation_id
      AND cp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update own read states" ON public.conversation_reads;
CREATE POLICY "Users can update own read states"
ON public.conversation_reads
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_reads.conversation_id
      AND cp.user_id = auth.uid()
  )
)
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_reads.conversation_id
      AND cp.user_id = auth.uid()
  )
);

CREATE INDEX IF NOT EXISTS idx_conversation_reads_user ON public.conversation_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_reads_last_read ON public.conversation_reads(last_read_at DESC);

-- Item location + medication safety metadata
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS area TEXT,
  ADD COLUMN IF NOT EXISTS medicine_name TEXT,
  ADD COLUMN IF NOT EXISTS medicine_usage TEXT,
  ADD COLUMN IF NOT EXISTS expiration_date DATE;

CREATE INDEX IF NOT EXISTS idx_items_state_area ON public.items(state, area);

-- Ensure realtime delivery for core chat tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.messages';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'conversations'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations';
  END IF;
END $$;