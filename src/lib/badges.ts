import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DonorBadge {
  id: string;
  user_id: string;
  badge_type: string;
  awarded_at: string;
}

export interface SpotlightEntry {
  id: string;
  user_id: string;
  message: string | null;
  admin_approved: boolean;
  created_at: string;
  profile?: {
    username: string;
    avatar_url: string | null;
    items_donated: number | null;
    bio: string | null;
    badges: string[] | null;
  };
}

export const useDonorBadges = (userId?: string) => {
  const [badges, setBadges] = useState<DonorBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from("donor_badges")
        .select("*")
        .eq("user_id", userId);
      setBadges((data as DonorBadge[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [userId]);

  return { badges, loading };
};

export const useApprovedSpotlights = () => {
  const [spotlights, setSpotlights] = useState<SpotlightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("donor_spotlight")
        .select("*, profile:profiles!user_id(*)")
        .eq("admin_approved", true)
        .order("created_at", { ascending: false });
      setSpotlights((data as any[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  return { spotlights, loading };
};

export const submitSpotlight = async (message: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check donation count >= 7
  const { data: profile } = await supabase
    .from("profiles")
    .select("items_donated")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.items_donated ?? 0) < 7) {
    throw new Error("You need at least 7 completed donations to post a spotlight.");
  }

  // Check if already posted (one-time only)
  const { count } = await supabase
    .from("donor_spotlight")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) > 0) {
    throw new Error("You have already submitted a spotlight. Each Bonitar can only post once.");
  }

  const { error } = await supabase
    .from("donor_spotlight")
    .insert({ user_id: user.id, message });
  if (error) throw error;
};
