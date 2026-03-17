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
  state?: string | null;
  area?: string | null;
  medicine_name?: string | null;
  medicine_usage?: string | null;
  expiration_date?: string | null;
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
  unread_count?: number;
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        setTimeout(async () => {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", nextSession.user.id)
            .single();

          if (error) {
            console.error("[auth] profile fetch failed", error);
          }
          setProfile((data as Profile) ?? null);
        }, 0);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (!currentSession) setLoading(false);
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
      setLoading(true);
      let query = supabase
        .from("items")
        .select("*, donor:profiles!donor_id(*)")
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (category && category !== "All") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) {
        console.error("[items] fetch failed", error);
        setItems([]);
        setLoading(false);
        return;
      }

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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("donor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[items] my items fetch failed", error);
      }

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
  state?: string;
  area?: string;
  medicine_name?: string;
  medicine_usage?: string;
  expiration_date?: string;
  image_urls?: string[];
}) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
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

  const { error } = await supabase.storage.from("item-images").upload(path, file);

  if (error) throw error;

  const { data } = supabase.storage.from("item-images").getPublicUrl(path);
  return data.publicUrl;
};

export const uploadAvatar = async (file: File, userId: string) => {
  const ext = file.name.split(".").pop();
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
};

// ---- Conversations & Messages ----
const getConversationsForUser = async (userId: string) => {
  const { data: participations, error: participationsError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId);

  if (participationsError) {
    console.error("[chat] participations fetch failed", participationsError);
    throw participationsError;
  }

  if (!participations?.length) return [];

  const conversationIds = participations.map((p: any) => p.conversation_id);

  const { data: conversations, error: conversationsError } = await supabase
    .from("conversations")
    .select("*, conversation_participants(user_id, profiles:profiles(*))")
    .in("id", conversationIds);

  if (conversationsError) {
    console.error("[chat] conversations fetch failed", conversationsError);
    throw conversationsError;
  }

  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, content, created_at")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });

  if (messagesError) {
    console.error("[chat] message previews fetch failed", messagesError);
    throw messagesError;
  }

  const { data: readRows, error: readsError } = await (supabase as any)
    .from("conversation_reads")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId)
    .in("conversation_id", conversationIds);

  if (readsError) {
    console.error("[chat] read state fetch failed", readsError);
  }

  const messagesByConversation = new Map<string, any[]>();
  (messages ?? []).forEach((msg: any) => {
    const list = messagesByConversation.get(msg.conversation_id) ?? [];
    list.push(msg);
    messagesByConversation.set(msg.conversation_id, list);
  });

  const readsMap = new Map<string, Date>();
  (readRows ?? []).forEach((row: any) => {
    readsMap.set(row.conversation_id, new Date(row.last_read_at));
  });

  return (conversations ?? [])
    .map((conversation: any) => {
      const convoMessages = messagesByConversation.get(conversation.id) ?? [];
      const lastMessage = convoMessages[0] ?? null;
      const lastReadAt = readsMap.get(conversation.id);

      const unreadCount = convoMessages.filter((msg: any) => {
        if (msg.sender_id === userId) return false;
        if (!lastReadAt) return true;
        return new Date(msg.created_at) > lastReadAt;
      }).length;

      return {
        ...conversation,
        last_message: lastMessage,
        unread_count: unreadCount,
      };
    })
    .sort((a: any, b: any) => {
      const aDate = a.last_message?.created_at ?? a.created_at;
      const bDate = b.last_message?.created_at ?? b.created_at;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
};

export const useConversations = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const data = await getConversationsForUser(user.id);
      setConversations(data);
      setLoading(false);
    } catch (error) {
      console.error("[chat] conversation list refresh failed", error);
      setConversations([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let currentUserId: string | null = null;

    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      currentUserId = user?.id ?? null;
      await refetch();
    })();

    const channel = supabase
      .channel(`conversation-list:${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversation_participants" },
        (payload) => {
          const row = payload.new as { user_id?: string };
          if (row.user_id && row.user_id === currentUserId) {
            void refetch();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          void refetch();
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("[chat] conversation list realtime subscription failed");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { conversations, loading, refetch };
};

export const useMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*, sender:profiles!sender_id(*)")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[chat] message fetch failed", error);
      setMessages([]);
      setLoading(false);
      return;
    }

    setMessages((data as any[]) ?? []);
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    setLoading(true);
    void refetch();

    if (!conversationId) return;

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
          const { data, error } = await supabase
            .from("messages")
            .select("*, sender:profiles!sender_id(*)")
            .eq("id", (payload.new as any).id)
            .single();

          if (error) {
            console.error("[chat] realtime message fetch failed", error);
            return;
          }

          if (data) {
            setMessages((prev) =>
              prev.some((existing) => existing.id === (data as any).id)
                ? prev
                : [...prev, data as any]
            );
          }
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("[chat] realtime subscription failed", { conversationId });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, refetch]);

  return { messages, loading, refetch };
};

export const sendMessage = async (conversationId: string, content: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const trimmed = content.trim();
  if (!trimmed) throw new Error("Message cannot be empty");
  if (trimmed.length > 2000) throw new Error("Message is too long");

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: trimmed,
    })
    .select()
    .single();

  if (error) {
    console.error("[chat] send message failed", error);
    throw error;
  }

  return data;
};

export const markConversationAsRead = async (conversationId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !conversationId) return;

  const now = new Date().toISOString();
  const { error } = await (supabase as any)
    .from("conversation_reads")
    .upsert(
      {
        conversation_id: conversationId,
        user_id: user.id,
        last_read_at: now,
        updated_at: now,
      },
      { onConflict: "conversation_id,user_id" }
    );

  if (error) {
    console.error("[chat] mark conversation as read failed", error);
  }
};

export const createOrGetConversation = async (otherUserId: string, itemId?: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");
  if (user.id === otherUserId) throw new Error("You cannot create a chat with yourself");

  const { data: myParticipations, error: myParticipationError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.id);

  if (myParticipationError) {
    console.error("[chat] failed to read your conversations", myParticipationError);
    throw myParticipationError;
  }

  const myConversationIds = (myParticipations ?? []).map((p: any) => p.conversation_id);

  if (myConversationIds.length) {
    let convoQuery = supabase
      .from("conversations")
      .select("id, item_id")
      .in("id", myConversationIds);

    if (itemId) {
      convoQuery = convoQuery.eq("item_id", itemId);
    }

    const { data: candidateConversations, error: candidateError } = await convoQuery;

    if (candidateError) {
      console.error("[chat] failed to inspect existing conversations", candidateError);
      throw candidateError;
    }

    const candidateIds = (candidateConversations ?? []).map((c: any) => c.id);

    if (candidateIds.length) {
      const { data: otherParticipantRows, error: otherParticipantError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", otherUserId)
        .in("conversation_id", candidateIds);

      if (otherParticipantError) {
        console.error("[chat] failed to inspect participant match", otherParticipantError);
        throw otherParticipantError;
      }

      const matchedConversationId = (otherParticipantRows ?? [])[0]?.conversation_id;
      if (matchedConversationId) {
        return { id: matchedConversationId } as any;
      }
    }
  }

  const { data: conversation, error: createConversationError } = await supabase
    .from("conversations")
    .insert({ item_id: itemId ?? null })
    .select()
    .single();

  if (createConversationError || !conversation) {
    console.error("[chat] failed to create conversation", createConversationError);
    throw createConversationError ?? new Error("Could not create conversation");
  }

  const { error: addSelfError } = await supabase.from("conversation_participants").insert({
    conversation_id: conversation.id,
    user_id: user.id,
  });

  if (addSelfError) {
    console.error("[chat] failed to add self as conversation participant", addSelfError);
    throw addSelfError;
  }

  const { error: addOtherError } = await supabase.from("conversation_participants").insert({
    conversation_id: conversation.id,
    user_id: otherUserId,
  });

  if (addOtherError) {
    console.error("[chat] failed to add recipient as conversation participant", addOtherError);
    throw addOtherError;
  }

  await markConversationAsRead(conversation.id);

  return conversation;
};

export const createConversation = async (otherUserId: string, itemId?: string) => {
  return createOrGetConversation(otherUserId, itemId);
};

// ---- Item Requests ----
export const requestItem = async (itemId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "donor")
        .order("items_donated", { ascending: false })
        .limit(10);

      if (error) {
        console.error("[profiles] top Bonitars fetch failed", error);
      }

      setDonors((data as Profile[]) ?? []);
      setLoading(false);
    };

    fetch();
  }, []);

  return { donors, loading };
};