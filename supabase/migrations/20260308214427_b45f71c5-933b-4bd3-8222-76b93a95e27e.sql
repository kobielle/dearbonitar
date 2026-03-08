
-- Attach trigger for auto-populating donor_id on item_requests (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_donor_id') THEN
    CREATE TRIGGER trg_set_donor_id
      BEFORE INSERT ON public.item_requests
      FOR EACH ROW
      EXECUTE FUNCTION public.set_item_request_donor_id();
  END IF;
END $$;

-- Allow admins to insert notifications for any user (for verification approval, etc.)
CREATE POLICY "Admins can insert notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
