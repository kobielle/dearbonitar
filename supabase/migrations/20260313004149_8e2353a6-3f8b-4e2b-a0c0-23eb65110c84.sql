
DROP POLICY IF EXISTS "Users can create own notifications" ON public.notifications;

CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
