import { useState, useRef } from "react";
import { Heart, Gift, Star, Shield, Camera, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useDonorBadges } from "@/lib/badges";
import { useMyItems, uploadAvatar } from "@/lib/bonitarCloud";
import { useAppreciationMessages, sendAppreciation } from "@/lib/requests";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const badgeLabels: Record<string, string> = {
  verified: "✅ Verified Bonitar",
  generous_heart: "❤️ Generous Heart",
  first_gift: "🎁 First Gift",
  "25_gifts": "🌟 25 Gifts",
  "50_gifts": "👑 50 Gifts Legend",
};

const DonorProfilePage = () => {
  const { profile, user } = useAuth();
  const { badges } = useDonorBadges(user?.id);
  const { items } = useMyItems();
  const { messages: appreciations } = useAppreciationMessages(user?.id);
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ bio, display_name: displayName, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Profile updated!");
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const url = await uploadAvatar(file, user.id);
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      toast.success("Avatar updated!");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const categories = [...new Set(items.map((i) => i.category))];
  const isDonor = profile?.role === "donor";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
            <div className="bg-gradient-hero h-32" />
            <div className="px-8 pb-8 -mt-12">
              <div className="flex items-end gap-4 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-accent border-4 border-card flex items-center justify-center text-4xl overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                    ) : "🤲"}
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl font-bold text-foreground">@{profile?.username}</h1>
                    {profile?.nin_verified && <span className="text-lg" title="Verified">✅</span>}
                  </div>
                  <p className="font-body text-sm text-muted-foreground">
                    {isDonor ? "Proud Bonitar" : "Recipient"} · Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ""}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Gift, label: "Donated", value: String(profile?.items_donated ?? 0) },
                  { icon: Heart, label: "Badges", value: String(badges.length) },
                  { icon: Star, label: "Role", value: isDonor ? "Bonitar" : profile?.role ?? "donor" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-accent rounded-xl p-4 text-center">
                    <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="font-body text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Edit Profile */}
              <div className="mb-8 space-y-4">
                <h2 className="font-display text-lg font-semibold text-foreground">Edit Profile</h2>
                <div>
                  <label className="font-body text-sm font-medium text-foreground block mb-1">Display Name</label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your display name" />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-foreground block mb-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 font-body text-sm"
                    placeholder="Tell others about yourself..."
                  />
                </div>
                <Button variant="hero" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>

              {/* Verification Link */}
              <div className="mb-8 p-4 bg-accent rounded-xl flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="font-body text-sm text-foreground">
                    {profile?.nin_verified ? "Your identity is verified ✅" : "Verify your identity to earn the Verified Bonitar badge"}
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/verification">Verify</Link>
                </Button>
              </div>

              {/* Badges */}
              {badges.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-3">Earned Badges</h2>
                  <div className="flex flex-wrap gap-2">
                    {badges.map((b) => (
                      <span key={b.id} className="text-xs font-body bg-accent text-accent-foreground px-3 py-1 rounded-full border border-border">
                        {badgeLabels[b.badge_type] || b.badge_type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Appreciation Messages */}
              <div className="mb-8">
                <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" /> Thank You Messages
                </h2>
                {appreciations.length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground bg-accent rounded-xl p-4">
                    No appreciation messages yet. They'll appear here when recipients say thank you! 💛
                  </p>
                ) : (
                  <div className="space-y-3">
                    {appreciations.map((msg: any) => (
                      <div key={msg.id} className="bg-accent rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-card flex items-center justify-center text-sm overflow-hidden">
                            {msg.sender?.avatar_url ? (
                              <img src={msg.sender.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : "🤲"}
                          </div>
                          <span className="font-body text-xs font-medium text-foreground">
                            @{msg.sender?.username || "Anonymous"}
                          </span>
                          <span className="font-body text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="font-body text-sm text-foreground italic">"{msg.message}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-3">Categories Donated</h2>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <span key={cat} className="text-xs font-body bg-accent text-primary px-3 py-1 rounded-full">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Donations */}
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-3">Recent Donations</h2>
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <p className="font-body text-sm text-muted-foreground">No donations yet.</p>
                  ) : (
                    items.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-accent">
                        <div>
                          <p className="font-body text-sm font-medium text-foreground">{item.title}</p>
                          <p className="font-body text-xs text-muted-foreground">{item.category}</p>
                        </div>
                        <span className="font-body text-xs text-muted-foreground">{item.status}</span>
                      </div>
                    ))
                  )}
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

export default DonorProfilePage;
