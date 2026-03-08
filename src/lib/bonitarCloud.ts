// ------------------------------
// Dear Bonitar – Lovable Cloud Integration
// Uses Supabase client under the hood
// ------------------------------

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

// ---- Types ----
export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  bio: string | null;
  nin_verified: boolean;
  video_verified: boolean;
  badges: string[];
  items_donated: number;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  donor_id: string;
  title: string;
  description: string | null;
  category: string;
  image_urls: string[];
  pickup_location: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  donor?: Profile;
}

export interface Conversation {
  id: string;
  item_id: string | null;
  created_at: string;
  participants?: Profile[];
  last_message?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: Profile;
}

export interface ItemRequest {
  id: string;
  item_id: string;
  recipient_id: string;
  status: string;
  created_at: string;
}

// ---- Auth Hook ----
export const useBonitarAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Defer profile fetch to avoid deadlock
          setTimeout(async () => {
            const { data } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();
            setProfile(data as Profile | null);
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (
    email: string,
    password: string,
    metadata: { username: string; role: "donor" | "recipient" }
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: metadata.username, role: metadata.role },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, profile, loading, login, signup, logout };
};

// ---- Items Hooks ----
export const useItems = (category?: string) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      let query = supabase
        .from("items")
        .select("*, donor:profiles!donor_id(*)")
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (category && category !== "All") {
        query = query.eq("category", category);
      }

      const { data } = await query;
      setItems((data as any[]) ?? []);
      setLoading(false);
    };
    fetchItems();
  }, [category]);

  return { items, loading };
};

export const useMyItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("items")
        .select("*")
        .eq("donor_id", user.id)
        .order("created_at", { ascending: false });
      setItems((data as any[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  return { items, loading };
};

export const postItem = async (itemData: {
  title: string;
  description: string;
  category: string;
  pickup_location: string;
  image_urls?: string[];
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("items")
    .insert({ ...itemData, donor_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ---- Storage Helpers ----
export const uploadItemImage = async (file: File, itemId: string) => {
  const ext = file.name.split(".").pop();
  const path = `${itemId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("item-images")
    .upload(path, file);

  if (error) throw error;

  const { data } = supabase.storage.from("item-images").getPublicUrl(path);
  return data.publicUrl;
};

export const uploadAvatar = async (file: File, userId: string) => {
  const ext = file.name.split(".").pop();
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
};

// ---- Conversations & Messages ----
export const useConversations = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: participations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (!participations?.length) { setLoading(false); return; }

      const convIds = participations.map((p: any) => p.conversation_id);

      const { data } = await supabase
        .from("conversations")
        .select("*, conversation_participants(user_id, profiles:profiles(*))")
        .in("id", convIds)
        .order("created_at", { ascending: false });

      setConversations(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  return { conversations, loading };
};

export const useMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) { setMessages([]); setLoading(false); return; }

    const fetch = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*, sender:profiles!sender_id(*)")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      setMessages((data as any[]) ?? []);
      setLoading(false);
    };
    fetch();

    // Realtime subscription
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from("messages")
            .select("*, sender:profiles!sender_id(*)")
            .eq("id", (payload.new as any).id)
            .single();
          if (data) setMessages((prev) => [...prev, data as any]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  return { messages, loading };
};

export const sendMessage = async (conversationId: string, content: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content,
  });
  if (error) throw error;
};

export const createConversation = async (otherUserId: string, itemId?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: conv, error } = await supabase
    .from("conversations")
    .insert({ item_id: itemId ?? null })
    .select()
    .single();

  if (error) throw error;

  await supabase.from("conversation_participants").insert([
    { conversation_id: conv.id, user_id: user.id },
    { conversation_id: conv.id, user_id: otherUserId },
  ]);

  return conv;
};

// ---- Item Requests ----
export const requestItem = async (itemId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("item_requests").insert({
    item_id: itemId,
    recipient_id: user.id,
  });
  if (error) throw error;
};

// ---- Donor Spotlights ----
export const useTopDonors = () => {
  const [donors, setDonors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "donor")
        .order("items_donated", { ascending: false })
        .limit(10);
      setDonors((data as Profile[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  return { donors, loading };
};
