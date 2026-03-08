
-- Auto-award generous_heart badge after 10 completed donations with 0 disputes
CREATE OR REPLACE FUNCTION public.auto_award_generous_heart()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _donor_id uuid;
  _completed_count int;
  _dispute_count int;
  _already_awarded boolean;
BEGIN
  IF NEW.donation_status = 'completed' AND (OLD.donation_status IS DISTINCT FROM 'completed') THEN
    _donor_id := NEW.donor_id;
    IF _donor_id IS NULL THEN RETURN NEW; END IF;

    SELECT count(*) INTO _completed_count
    FROM item_requests WHERE donor_id = _donor_id AND donation_status = 'completed';

    SELECT count(*) INTO _dispute_count
    FROM donation_disputes dd JOIN item_requests ir ON ir.id = dd.item_request_id
    WHERE ir.donor_id = _donor_id;

    SELECT EXISTS(
      SELECT 1 FROM donor_badges WHERE user_id = _donor_id AND badge_type = 'generous_heart'
    ) INTO _already_awarded;

    IF _completed_count >= 10 AND _dispute_count = 0 AND NOT _already_awarded THEN
      INSERT INTO donor_badges (user_id, badge_type) VALUES (_donor_id, 'generous_heart');
      UPDATE profiles SET badges = array_append(COALESCE(badges, '{}'), 'generous_heart') WHERE id = _donor_id;
      INSERT INTO notifications (user_id, type, title, content)
      VALUES (_donor_id, 'badge', 'Badge Earned!', 'You earned the Generous Heart badge for 10 successful donations!');
    END IF;

    UPDATE profiles SET items_donated = COALESCE(items_donated, 0) + 1 WHERE id = _donor_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_award_generous_heart
AFTER UPDATE ON item_requests
FOR EACH ROW
EXECUTE FUNCTION auto_award_generous_heart();

-- Allow recipients to update their own requests (for confirm received)
CREATE POLICY "Recipients can update own requests"
ON item_requests FOR UPDATE TO authenticated
USING (recipient_id = auth.uid());

-- Function to check dispute history
CREATE OR REPLACE FUNCTION public.get_dispute_count(_user_id uuid)
RETURNS int
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT count(*)::int
  FROM donation_disputes dd
  JOIN item_requests ir ON ir.id = dd.item_request_id
  WHERE ir.donor_id = _user_id OR ir.recipient_id = _user_id;
$$;
