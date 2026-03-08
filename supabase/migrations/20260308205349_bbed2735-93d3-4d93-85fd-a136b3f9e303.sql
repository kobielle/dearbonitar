
-- Fix overly permissive notifications INSERT policy
DROP POLICY "System can create notifications" ON public.notifications;

-- Only allow inserting notifications for oneself (system inserts will use service role)
CREATE POLICY "Users can create own notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
