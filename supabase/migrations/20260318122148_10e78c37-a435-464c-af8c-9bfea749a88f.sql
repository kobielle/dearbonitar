
-- Enable realtime for conversation_participants only (messages already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;

-- Fix conversation_participants INSERT policy
DROP POLICY IF EXISTS "Users can add participants to own conversations" ON public.conversation_participants;
CREATE POLICY "Users can add participants to conversations" ON public.conversation_participants
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Fix SELECT policy
DROP POLICY IF EXISTS "Users can view own participations" ON public.conversation_participants;
CREATE POLICY "Users can view participations in own conversations" ON public.conversation_participants
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR conversation_id IN (
      SELECT cp2.conversation_id FROM public.conversation_participants cp2 WHERE cp2.user_id = auth.uid()
    )
  );
