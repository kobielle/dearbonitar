import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ItemRequest {
  id: string;
  item_id: string;
  donor_id: string | null;
  recipient_id: string;
  status: string | null;
  donation_status: string;
  donor_confirmation: boolean;
  recipient_confirmation: boolean;
  donor_marked_at: string | null;
  recipient_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  item?: { title: string; image_urls: string[] | null };
  donor?: { username: string; display_name: string | null; avatar_url: string | null };
  recipient?: { username: string; display_name: string | null; avatar_url: string | null };
}

export interface DonationDispute {
  id: string;
  item_request_id: string;
  reporter_id: string;
  description: string | null;
  evidence: Record<string, any>;
  created_at: string;
}

// ---- Hooks ----

export const useRecipientRequests = () => {
  const [requests, setRequests] = useState<ItemRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("item_requests")
        .select("*, item:items(title, image_urls), donor:profiles!item_requests_donor_id_fkey(username, display_name, avatar_url)")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false });

      setRequests((data as any[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  return { requests, loading };
};

export const useDonorRequests = () => {
  const [requests, setRequests] = useState<ItemRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("item_requests")
        .select("*, item:items(title, image_urls), recipient:profiles!item_requests_recipient_id_fkey(username, display_name, avatar_url)")
        .eq("donor_id", user.id)
        .order("created_at", { ascending: false });

      setRequests((data as any[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  return { requests, loading };
};

export const useDashboardStats = () => {
  const [stats, setStats] = useState({ donated: 0, badges: 0, unreadNotifications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [donatedRes, badgesRes, notifsRes] = await Promise.all([
        supabase
          .from("item_requests")
          .select("*", { count: "exact", head: true })
          .eq("donor_id", user.id)
          .eq("donation_status", "completed"),
        supabase
          .from("donor_badges")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false),
      ]);

      setStats({
        donated: donatedRes.count ?? 0,
        badges: badgesRes.count ?? 0,
        unreadNotifications: notifsRes.count ?? 0,
      });
      setLoading(false);
    };
    fetch();
  }, []);

  return { stats, loading };
};

// ---- Gift limit check (includes donor confirmation count) ----

export const useGiftEligibility = (recipientId?: string) => {
  const [eligible, setEligible] = useState(true);
  const [remaining, setRemaining] = useState(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!recipientId) { setLoading(false); return; }
    const check = async () => {
      const cutoff = new Date(Date.now() - 61 * 24 * 60 * 60 * 1000).toISOString();

      // Count completed donations
      const { count: completedCount } = await supabase
        .from("item_requests")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", recipientId)
        .eq("donation_status", "completed")
        .gte("recipient_confirmed_at", cutoff);

      // Count unique donors who marked delivery (even without recipient confirmation)
      const { data: donorConfirmed } = await supabase
        .from("item_requests")
        .select("donor_id")
        .eq("recipient_id", recipientId)
        .eq("donor_confirmation", true)
        .gte("donor_marked_at", cutoff);

      const uniqueDonorCount = new Set((donorConfirmed ?? []).map((r: any) => r.donor_id)).size;

      // Use the higher of the two counts (donor confirmations from 3+ different donors also count)
      const used = Math.max(completedCount ?? 0, uniqueDonorCount >= 3 ? uniqueDonorCount : completedCount ?? 0);
      setRemaining(Math.max(0, 3 - used));
      setEligible(used < 3);
      setLoading(false);
    };
    check();
  }, [recipientId]);

  return { eligible, remaining, loading };
};

export const canRequestGift = async (recipientId: string): Promise<boolean> => {
  const cutoff = new Date(Date.now() - 61 * 24 * 60 * 60 * 1000).toISOString();

  const { count: completedCount } = await supabase
    .from("item_requests")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", recipientId)
    .eq("donation_status", "completed")
    .gte("recipient_confirmed_at", cutoff);

  const { data: donorConfirmed } = await supabase
    .from("item_requests")
    .select("donor_id")
    .eq("recipient_id", recipientId)
    .eq("donor_confirmation", true)
    .gte("donor_marked_at", cutoff);

  const uniqueDonorCount = new Set((donorConfirmed ?? []).map((r: any) => r.donor_id)).size;
  const used = Math.max(completedCount ?? 0, uniqueDonorCount >= 3 ? uniqueDonorCount : completedCount ?? 0);
  return used < 3;
};

// ---- Dispute history check ----

export const useDisputeCount = (userId?: string) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    supabase.rpc("get_dispute_count", { _user_id: userId }).then(({ data }) => {
      setCount(data ?? 0);
    });
  }, [userId]);

  return count;
};

// ---- Actions ----

export const markDelivered = async (requestId: string) => {
  const { data: request } = await supabase
    .from("item_requests")
    .select("recipient_id, item:items(title)")
    .eq("id", requestId)
    .single();

  const { error } = await supabase
    .from("item_requests")
    .update({
      donation_status: "delivered-pending-recipient",
      donor_confirmation: true,
      donor_marked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);
  if (error) throw error;

  // Notify recipient
  if (request) {
    await supabase.from("notifications").insert({
      user_id: (request as any).recipient_id,
      type: "delivery_update",
      title: "Item Delivered! 📦",
      content: `The Bonitar marked "${(request as any).item?.title}" as delivered. Please confirm when you receive it.`,
    });
  }
};

export const confirmReceived = async (requestId: string) => {
  const { data: request } = await supabase
    .from("item_requests")
    .select("donor_id, item:items(title)")
    .eq("id", requestId)
    .single();

  const { error } = await supabase
    .from("item_requests")
    .update({
      donation_status: "completed",
      recipient_confirmation: true,
      recipient_confirmed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);
  if (error) throw error;

  // Notify donor
  if (request && (request as any).donor_id) {
    await supabase.from("notifications").insert({
      user_id: (request as any).donor_id,
      type: "delivery_update",
      title: "Receipt Confirmed! 🎉",
      content: `The recipient confirmed they received "${(request as any).item?.title}". Thank you, Bonitar!`,
    });
  }
};

export const fileDispute = async (requestId: string, description: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error: disputeErr } = await supabase
    .from("donation_disputes")
    .insert({
      item_request_id: requestId,
      reporter_id: user.id,
      description,
    });
  if (disputeErr) throw disputeErr;

  await supabase
    .from("item_requests")
    .update({
      donation_status: "disputed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  // Notify admin (insert notification for admin action)
  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "dispute",
    title: "Dispute Filed",
    content: "Your dispute has been submitted and will be reviewed by our team.",
  });
};
