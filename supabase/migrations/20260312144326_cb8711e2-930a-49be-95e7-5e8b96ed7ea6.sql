
-- 1. Appreciation messages table
CREATE TABLE IF NOT EXISTS public.appreciation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_request_id uuid REFERENCES public.item_requests(id),
  message text NOT NULL,
  approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.appreciation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved appreciation" ON public.appreciation_messages
  FOR SELECT TO public USING (approved = true OR sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Authenticated users can send appreciation" ON public.appreciation_messages
  FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

-- 2. Wire existing trigger functions
DROP TRIGGER IF EXISTS trg_set_item_request_donor_id ON public.item_requests;
CREATE TRIGGER trg_set_item_request_donor_id
  BEFORE INSERT ON public.item_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_item_request_donor_id();

DROP TRIGGER IF EXISTS trg_auto_award_generous_heart ON public.item_requests;
CREATE TRIGGER trg_auto_award_generous_heart
  AFTER UPDATE ON public.item_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_award_generous_heart();

-- 3. Handle donation completion
CREATE OR REPLACE FUNCTION public.handle_donation_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.donation_status = 'completed' AND (OLD.donation_status IS DISTINCT FROM 'completed') THEN
    UPDATE items SET status = 'donated', updated_at = now() WHERE id = NEW.item_id;
    
    INSERT INTO notifications (user_id, type, title, content)
    SELECT recipient_id, 'donation_update', 'Item No Longer Available',
      'The item you requested has already been given to another recipient.'
    FROM item_requests
    WHERE item_id = NEW.item_id AND id != NEW.id AND donation_status IN ('pending', 'approved');
    
    UPDATE item_requests 
    SET donation_status = 'expired', status = 'expired', updated_at = now()
    WHERE item_id = NEW.item_id AND id != NEW.id AND donation_status IN ('pending', 'approved');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_handle_donation_completed ON public.item_requests;
CREATE TRIGGER trg_handle_donation_completed
  AFTER UPDATE ON public.item_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_donation_completed();

-- 4. Milestone badges
CREATE OR REPLACE FUNCTION public.auto_award_milestone_badges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _donor_id uuid;
  _count int;
  _has_badge boolean;
BEGIN
  IF NEW.donation_status = 'completed' AND (OLD.donation_status IS DISTINCT FROM 'completed') THEN
    _donor_id := NEW.donor_id;
    IF _donor_id IS NULL THEN RETURN NEW; END IF;
    
    SELECT count(*) INTO _count FROM item_requests WHERE donor_id = _donor_id AND donation_status = 'completed';
    
    IF _count = 1 THEN
      SELECT EXISTS(SELECT 1 FROM donor_badges WHERE user_id = _donor_id AND badge_type = 'first_gift') INTO _has_badge;
      IF NOT _has_badge THEN
        INSERT INTO donor_badges (user_id, badge_type) VALUES (_donor_id, 'first_gift');
        UPDATE profiles SET badges = array_append(COALESCE(badges, '{}'), 'first_gift') WHERE id = _donor_id;
        INSERT INTO notifications (user_id, type, title, content) VALUES (_donor_id, 'badge', '🎉 First Gift!', 'You completed your first donation! Welcome to the Bonitar family.');
      END IF;
    END IF;
    
    IF _count >= 25 THEN
      SELECT EXISTS(SELECT 1 FROM donor_badges WHERE user_id = _donor_id AND badge_type = '25_gifts') INTO _has_badge;
      IF NOT _has_badge THEN
        INSERT INTO donor_badges (user_id, badge_type) VALUES (_donor_id, '25_gifts');
        UPDATE profiles SET badges = array_append(COALESCE(badges, '{}'), '25_gifts') WHERE id = _donor_id;
        INSERT INTO notifications (user_id, type, title, content) VALUES (_donor_id, 'badge', '🌟 25 Gifts Milestone!', 'You have completed 25 donations! You are a true Bonitar.');
      END IF;
    END IF;
    
    IF _count >= 50 THEN
      SELECT EXISTS(SELECT 1 FROM donor_badges WHERE user_id = _donor_id AND badge_type = '50_gifts') INTO _has_badge;
      IF NOT _has_badge THEN
        INSERT INTO donor_badges (user_id, badge_type) VALUES (_donor_id, '50_gifts');
        UPDATE profiles SET badges = array_append(COALESCE(badges, '{}'), '50_gifts') WHERE id = _donor_id;
        INSERT INTO notifications (user_id, type, title, content) VALUES (_donor_id, 'badge', '👑 50 Gifts Legend!', 'You have completed 50 donations! You are a legendary Bonitar.');
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_award_milestone_badges ON public.item_requests;
CREATE TRIGGER trg_auto_award_milestone_badges
  AFTER UPDATE ON public.item_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_award_milestone_badges();
