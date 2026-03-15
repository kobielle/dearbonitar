
-- Fix conversation_participants SELECT policy (self-referencing bug)
DROP POLICY IF EXISTS "Users can view own participations" ON conversation_participants;
CREATE POLICY "Users can view own participations" ON conversation_participants
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM conversation_participants cp 
      WHERE cp.conversation_id = conversation_participants.conversation_id 
      AND cp.user_id = auth.uid()
    )
  );

-- Fix conversation_participants INSERT policy
DROP POLICY IF EXISTS "Users can add participants to own conversations" ON conversation_participants;
CREATE POLICY "Users can add participants to own conversations" ON conversation_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM conversation_participants cp 
      WHERE cp.conversation_id = conversation_participants.conversation_id 
      AND cp.user_id = auth.uid()
    )
  );

-- Fix conversations SELECT policy (wrong column comparison)
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_participants.conversation_id = conversations.id 
      AND conversation_participants.user_id = auth.uid()
    )
  );
