import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string | null;
  read: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userId: string | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      userId = user.id;

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      const notifs = (data as Notification[]) ?? [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
      setLoading(false);

      // Realtime subscription filtered to this user
      channel = supabase
        .channel(`user-notifications-${user.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          (payload) => {
            const newNotif = payload.new as Notification;
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        )
        .subscribe();
    };
    init();

    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
};
