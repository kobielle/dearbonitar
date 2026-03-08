
-- Add new columns to item_requests
ALTER TABLE item_requests ADD COLUMN IF NOT EXISTS donor_id uuid REFERENCES profiles(id);
ALTER TABLE item_requests ADD COLUMN IF NOT EXISTS donation_status text DEFAULT 'pending';
ALTER TABLE item_requests ADD COLUMN IF NOT EXISTS donor_confirmation boolean DEFAULT false;
ALTER TABLE item_requests ADD COLUMN IF NOT EXISTS recipient_confirmation boolean DEFAULT false;
ALTER TABLE item_requests ADD COLUMN IF NOT EXISTS donor_marked_at timestamp with time zone;
ALTER TABLE item_requests ADD COLUMN IF NOT EXISTS recipient_confirmed_at timestamp with time zone;
ALTER TABLE item_requests ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create donation_disputes table
CREATE TABLE IF NOT EXISTS donation_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_request_id uuid REFERENCES item_requests(id) ON DELETE CASCADE NOT NULL,
  reporter_id uuid REFERENCES profiles(id) NOT NULL,
  description text,
  evidence jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE donation_disputes ENABLE ROW LEVEL SECURITY;

-- RLS: participants can view disputes for their requests
CREATE POLICY "Participants can view disputes"
  ON donation_disputes FOR SELECT
  USING (
    reporter_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM item_requests ir
      WHERE ir.id = donation_disputes.item_request_id
      AND (ir.donor_id = auth.uid() OR ir.recipient_id = auth.uid())
    ) OR
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Participants can create disputes"
  ON donation_disputes FOR INSERT
  WITH CHECK (
    reporter_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM item_requests ir
      WHERE ir.id = donation_disputes.item_request_id
      AND (ir.donor_id = auth.uid() OR ir.recipient_id = auth.uid())
    )
  );

-- Auto-populate donor_id from item on insert trigger
CREATE OR REPLACE FUNCTION public.set_item_request_donor_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  SELECT donor_id INTO NEW.donor_id FROM items WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_donor_id_on_request
  BEFORE INSERT ON item_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_item_request_donor_id();

-- Enable realtime for item_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.item_requests;
