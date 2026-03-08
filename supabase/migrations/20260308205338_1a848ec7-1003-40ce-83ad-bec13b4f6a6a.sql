
-- 1. Video Verifications
CREATE TABLE public.video_verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    video_url text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    reviewer_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.video_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own verification" ON public.video_verifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own verification" ON public.video_verifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update verifications" ON public.video_verifications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 2. Donor Badges
CREATE TABLE public.donor_badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    badge_type text NOT NULL,
    awarded_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.donor_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" ON public.donor_badges FOR SELECT USING (true);
CREATE POLICY "Admins can manage badges" ON public.donor_badges FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3. Donor Spotlight
CREATE TABLE public.donor_spotlight (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message text,
    admin_approved boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.donor_spotlight ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved spotlights" ON public.donor_spotlight FOR SELECT USING (admin_approved = true OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can submit spotlight" ON public.donor_spotlight FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update spotlights" ON public.donor_spotlight FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. Deliveries
CREATE TABLE public.deliveries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id uuid REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
    donor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    logistics_company text,
    tracking_number text,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view deliveries" ON public.deliveries FOR SELECT TO authenticated USING (donor_id = auth.uid() OR recipient_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Donors can create deliveries" ON public.deliveries FOR INSERT TO authenticated WITH CHECK (donor_id = auth.uid());
CREATE POLICY "Participants can update deliveries" ON public.deliveries FOR UPDATE TO authenticated USING (donor_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 5. Notifications
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    content text,
    read boolean DEFAULT false,
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 6. Storage bucket for verification videos
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-videos', 'verification-videos', false);

CREATE POLICY "Users can upload own verification videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'verification-videos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own verification videos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'verification-videos' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));
