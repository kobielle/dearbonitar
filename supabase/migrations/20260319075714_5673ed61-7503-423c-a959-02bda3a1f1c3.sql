
-- Fix conversation_participants RLS: replace self-referencing SELECT policy with security definer function

-- Create helper function to check conversation membership
CREATE OR REPLACE FUNCTION public.is_conversation_member(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE user_id = _user_id AND conversation_id = _conversation_id
  )
$$;

-- Drop old problematic SELECT policy
DROP POLICY IF EXISTS "Users can view participations in own conversations" ON public.conversation_participants;

-- Create new SELECT policy using security definer function
CREATE POLICY "Users can view participations in own conversations" ON public.conversation_participants
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR public.is_conversation_member(auth.uid(), conversation_id)
  );

-- Enable realtime for conversation_participants too
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversation_participants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
  END IF;
END $$;

-- Ensure messages realtime is enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

-- Re-create triggers that may have been lost
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_donor_id_on_request ON public.item_requests;
CREATE TRIGGER set_donor_id_on_request
  BEFORE INSERT ON public.item_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_item_request_donor_id();

DROP TRIGGER IF EXISTS on_donation_completed ON public.item_requests;
CREATE TRIGGER on_donation_completed
  AFTER UPDATE ON public.item_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_donation_completed();

DROP TRIGGER IF EXISTS on_badge_milestone ON public.item_requests;
CREATE TRIGGER on_badge_milestone
  AFTER UPDATE ON public.item_requests
  FOR EACH ROW EXECUTE FUNCTION public.auto_award_milestone_badges();

DROP TRIGGER IF EXISTS on_generous_heart ON public.item_requests;
CREATE TRIGGER on_generous_heart
  AFTER UPDATE ON public.item_requests
  FOR EACH ROW EXECUTE FUNCTION public.auto_award_generous_heart();
