import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createOrGetConversation } from "@/lib/bonitarCloud";

// Track which items the current user has already requested + active count
export const useUserRequests = () => {
  const [requestedItemIds, setRequestedItemIds] = useState<Set<string>>(new Set());
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("item_requests")
        .select("item_id, donation_status")
        .eq("recipient_id", user.id);

      if (error) {
        console.error("[requests] failed to load current user requests", error);
        setLoading(false);
        return;
      }

      const all = data ?? [];
      setRequestedItemIds(new Set(all.map((r: any) => r.item_id)));
      setActiveCount(
        all.filter((r: any) =>
          ["pending", "approved", "delivered-pending-recipient"].includes(r.donation_status ?? "")
        ).length
      );
      setLoading(false);
    };

    fetch();
  }, []);

  return { requestedItemIds, activeCount, loading };
};

// Enhanced request item: checks limits, auto-creates chat, notifies Bonitar
export const requestItemEnhanced = async (itemId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Check active request limit (5)
  const { count: activeCount, error: activeError } = await supabase
    .from("item_requests")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .in("donation_status", ["pending", "approved", "delivered-pending-recipient"]);

  if (activeError) {
    console.error("[requests] active request count failed", activeError);
    throw activeError;
  }

  if ((activeCount ?? 0) >= 5) throw new Error("You can only have 5 active requests at a time.");

  // Check if already requested
  const { count: existingCount, error: existingError } = await supabase
    .from("item_requests")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .eq("item_id", itemId)
    .in("donation_status", ["pending", "approved"]);

  if (existingError) {
    console.error("[requests] duplicate request check failed", existingError);
    throw existingError;
  }

  if ((existingCount ?? 0) > 0) throw new Error("You have already requested this item.");

  // Get item info
  const { data: item, error: itemError } = await supabase
    .from("items")
    .select("donor_id, title")
    .eq("id", itemId)
    .single();

  if (itemError) {
    console.error("[requests] item fetch failed", itemError);
    throw itemError;
  }

  if (!item) throw new Error("Item not found");

  // Create request (donor_id is set by trigger)
  const { data: request, error } = await supabase
    .from("item_requests")
    .insert({ item_id: itemId, recipient_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("[requests] request creation failed", error);
    throw error;
  }

  // Auto-create/reuse conversation between requester and Bonitar
  try {
    await createOrGetConversation(item.donor_id, itemId);
  } catch (conversationError) {
    console.error("[chat] auto conversation creation failed after request", conversationError);
  }

  // Notify the Bonitar
  const { error: notificationError } = await supabase.from("notifications").insert({
    user_id: item.donor_id,
    type: "donation_request",
    title: "New Item Request! 🎁",
    content: `Someone has requested your item "${item.title}". View and manage your requests.`,
  });

  if (notificationError) {
    console.error("[notifications] failed to notify Bonitar about request", notificationError);
  }

  return request;
};

// Bonitar: get all requests for their items
export const useDonorItemRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("item_requests")
      .select(
        "*, item:items(title, image_urls, category, status), recipient:profiles!item_requests_recipient_id_fkey(username, display_name, avatar_url, items_donated, badges)"
      )
      .eq("donor_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[requests] Bonitar requests fetch failed", error);
      setLoading(false);
      return;
    }

    setRequests((data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void refetch();
  }, []);

  return { requests, loading, refetch };
};

// Approve a request (auto-declines other pending requests for same item)
export const approveRequest = async (requestId: string) => {
  const { data: request, error: fetchErr } = await supabase
    .from("item_requests")
    .select("item_id, recipient_id, item:items(title)")
    .eq("id", requestId)
    .single();

  if (fetchErr || !request) throw fetchErr || new Error("Request not found");

  const { error } = await supabase
    .from("item_requests")
    .update({ status: "approved", donation_status: "approved", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) throw error;

  // Notify approved recipient
  await supabase.from("notifications").insert({
    user_id: (request as any).recipient_id,
    type: "donation_update",
    title: "Request Approved! ✅",
    content: `Your request for "${(request as any).item?.title}" has been approved by the Bonitar!`,
  });

  // Decline all other pending requests for same item
  const { data: otherRequests } = await supabase
    .from("item_requests")
    .select("id, recipient_id")
    .eq("item_id", (request as any).item_id)
    .neq("id", requestId)
    .eq("donation_status", "pending");

  if (otherRequests && otherRequests.length > 0) {
    await supabase
      .from("item_requests")
      .update({ status: "declined", donation_status: "declined", updated_at: new Date().toISOString() })
      .eq("item_id", (request as any).item_id)
      .neq("id", requestId)
      .eq("donation_status", "pending");

    for (const r of otherRequests) {
      await supabase.from("notifications").insert({
        user_id: r.recipient_id,
        type: "donation_update",
        title: "Request Declined",
        content: `Your request for "${(request as any).item?.title}" was not selected. Keep browsing!`,
      });
    }
  }
};

// Decline a single request
export const declineRequest = async (requestId: string) => {
  const { data: request } = await supabase
    .from("item_requests")
    .select("recipient_id, item:items(title)")
    .eq("id", requestId)
    .single();

  const { error } = await supabase
    .from("item_requests")
    .update({ status: "declined", donation_status: "declined", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) throw error;

  if (request) {
    await supabase.from("notifications").insert({
      user_id: (request as any).recipient_id,
      type: "donation_update",
      title: "Request Declined",
      content: `Your request for "${(request as any).item?.title}" was not selected. Keep browsing for other items!`,
    });
  }
};

// Cancel request (by recipient)
export const cancelRequest = async (requestId: string) => {
  const { data: request } = await supabase
    .from("item_requests")
    .select("donor_id, item:items(title)")
    .eq("id", requestId)
    .single();

  const { error } = await supabase
    .from("item_requests")
    .update({ status: "cancelled", donation_status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) throw error;

  if (request && (request as any).donor_id) {
    await supabase.from("notifications").insert({
      user_id: (request as any).donor_id,
      type: "donation_update",
      title: "Request Cancelled",
      content: `A user has cancelled their request for "${(request as any).item?.title}".`,
    });
  }
};

// Appreciation messages
export const useAppreciationMessages = (userId?: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      const { data } = await (supabase as any)
        .from("appreciation_messages")
        .select("*, sender:profiles!appreciation_messages_sender_id_fkey(username, display_name, avatar_url)")
        .eq("recipient_id", userId)
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(20);

      setMessages((data as any[]) ?? []);
      setLoading(false);
    };

    fetch();
  }, [userId]);

  return { messages, loading };
};

export const sendAppreciation = async (recipientId: string, message: string, itemRequestId?: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const insertData: any = {
    sender_id: user.id,
    recipient_id: recipientId,
    message,
  };

  if (itemRequestId) insertData.item_request_id = itemRequestId;

  const { error } = await (supabase as any).from("appreciation_messages").insert(insertData);
  if (error) throw error;

  // Notify recipient
  await supabase.from("notifications").insert({
    user_id: recipientId,
    type: "appreciation",
    title: "💛 Thank You Message!",
    content: "Someone left an appreciation message on your profile!",
  });
};