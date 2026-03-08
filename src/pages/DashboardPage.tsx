import { useEffect, useState } from "react";
import { Heart, Gift, MessageCircle, Star, Settings, Plus, BookOpen, TrendingUp, Shield, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useMyItems } from "@/lib/bonitarCloud";
import { useDeliveries } from "@/lib/deliveries";
import { useNotifications } from "@/lib/notifications";

const DashboardPage = () => {
  const { profile, user } = useAuth();
  const { items } = useMyItems();
  const { deliveries } = useDeliveries();
  const { unreadCount } = useNotifications();

  const stats = [
    { icon: Gift, label: "Items Donated", value: String(profile?.items_donated ?? items.length), color: "text-primary" },
    { icon: Heart, label: "Verified", value: profile?.nin_verified ? "✅" : "❌", color: "text-secondary" },
    { icon: Star, label: "Badges", value: String(profile?.badges?.length ?? 0), color: "text-primary" },
    { icon: MessageCircle, label: "Unread", value: String(unreadCount), color: "text-foreground" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Welcome back, {profile?.display_name || profile?.username || "Bonitar"}!
              </h1>
              <p className="font-body text-muted-foreground">Your kindness dashboard</p>
            </div>
            <Button variant="hero" asChild>
              <Link to="/post-item">
                <Plus className="h-4 w-4" />
                Donate Item
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl p-5 border border-border shadow-card">
                <stat.icon className={`h-5 w-5 ${stat.color} mb-3`} />
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="font-body text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">Your Recent Donations</h2>
              <div className="space-y-3">
                {items.length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground py-4 text-center">No items donated yet. Start giving!</p>
                ) : (
                  items.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors">
                      <span className="text-2xl">🎁</span>
                      <div className="flex-1">
                        <p className="font-body text-sm text-foreground">{item.title}</p>
                        <p className="font-body text-xs text-muted-foreground">{item.category} · {item.status}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Whisper of the Day</h2>
                <div className="bg-accent rounded-lg p-4">
                  <p className="font-body text-sm text-foreground italic leading-relaxed">
                    "Someone out there smiled today because of something you gave." 💛
                  </p>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Quick Links</h2>
                <div className="space-y-2">
                  {[
                    { to: "/feed", icon: TrendingUp, label: "Browse Items" },
                    { to: "/journal", icon: BookOpen, label: "Journal" },
                    { to: "/chat", icon: MessageCircle, label: "Messages" },
                    { to: "/profile", icon: Settings, label: "Profile" },
                    { to: "/verification", icon: Shield, label: "Verification" },
                    { to: "/deliveries", icon: Package, label: "Deliveries" },
                  ].map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent transition-colors font-body text-sm text-foreground"
                    >
                      <link.icon className="h-4 w-4 text-primary" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardPage;
