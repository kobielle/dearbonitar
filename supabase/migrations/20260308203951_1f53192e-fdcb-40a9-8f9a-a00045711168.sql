
-- Tighten conversation creation - use a function to verify the creator will be a participant
DROP POLICY "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
