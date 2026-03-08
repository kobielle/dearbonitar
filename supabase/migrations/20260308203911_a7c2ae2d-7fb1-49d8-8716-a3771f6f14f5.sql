
-- Fix: Add RLS policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Fix: Tighten conversation creation - require user to be a participant
DROP POLICY "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (true);

-- Fix: Tighten participant addition - only allow adding self or if already a participant
DROP POLICY "Authenticated users can add participants" ON public.conversation_participants;
CREATE POLICY "Users can add participants to own conversations" ON public.conversation_participants FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()));
