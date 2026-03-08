import { useState } from "react";
import { Bell, MessageCircle, Gift, Award, Truck, Check } from "lucide-react";
import { useNotifications, type Notification } from "@/lib/notifications";
import { formatDistanceToNow } from "date-fns";

const typeIcons: Record<string, typeof Bell> = {
  message: MessageCircle,
  donation_request: Gift,
  badge: Award,
  delivery_update: Truck,
};

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl border border-border shadow-lg z-50 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h3 className="font-display text-sm font-semibold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-body text-primary hover:underline flex items-center gap-1"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground font-body">No notifications yet</p>
              ) : (
                notifications.slice(0, 20).map((notif) => {
                  const Icon = typeIcons[notif.type] || Bell;
                  return (
                    <button
                      key={notif.id}
                      onClick={() => { markAsRead(notif.id); }}
                      className={`w-full text-left flex items-start gap-3 p-3 hover:bg-accent transition-colors ${!notif.read ? "bg-accent/50" : ""}`}
                    >
                      <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-foreground truncate">{notif.title}</p>
                        {notif.content && (
                          <p className="font-body text-xs text-muted-foreground truncate">{notif.content}</p>
                        )}
                        <p className="font-body text-[10px] text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
