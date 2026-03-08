import { useEffect, useState } from "react";
import { Shield, CheckCircle, XCircle, Star, Video, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Verification {
  id: string;
  user_id: string;
  video_url: string;
  status: string;
  reviewer_notes: string | null;
  created_at: string;
  profile?: { username: string; display_name: string | null };
}

interface SpotlightSubmission {
  id: string;
  user_id: string;
  message: string | null;
  admin_approved: boolean;
  created_at: string;
  profile?: { username: string; display_name: string | null; items_donated: number | null };
}

interface Dispute {
  id: string;
  item_request_id: string;
  reporter_id: string;
  description: string | null;
  created_at: string;
  reporter?: { username: string };
}

const AdminPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<"verifications" | "spotlights" | "disputes">("verifications");
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [spotlights, setSpotlights] = useState<SpotlightSubmission[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
      if (data) fetchAll();
      else setLoading(false);
    });
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    const [vRes, sRes, dRes] = await Promise.all([
      supabase.from("video_verifications").select("*, profile:profiles!video_verifications_user_id_fkey(username, display_name)").order("created_at", { ascending: false }),
      supabase.from("donor_spotlight").select("*, profile:profiles!donor_spotlight_user_id_fkey(username, display_name, items_donated)").order("created_at", { ascending: false }),
      supabase.from("donation_disputes").select("*, reporter:profiles!donation_disputes_reporter_id_fkey(username)").order("created_at", { ascending: false }),
    ]);
    setVerifications((vRes.data as any[]) ?? []);
    setSpotlights((sRes.data as any[]) ?? []);
    setDisputes((dRes.data as any[]) ?? []);
    setLoading(false);
  };

  const handleVerification = async (id: string, status: "approved" | "rejected", userId: string) => {
    await supabase.from("video_verifications").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (status === "approved") {
      await supabase.from("profiles").update({ video_verified: true, nin_verified: true }).eq("id", userId);
      await supabase.from("donor_badges").insert({ user_id: userId, badge_type: "verified" });
      await supabase.from("profiles").update({ badges: supabase.rpc ? undefined : undefined }).eq("id", userId);
      // Add verified badge to array
      const { data: prof } = await supabase.from("profiles").select("badges").eq("id", userId).single();
      const badges = [...(prof?.badges ?? []), "verified"];
      await supabase.from("profiles").update({ badges }).eq("id", userId);
      await supabase.from("notifications").insert({ user_id: userId, type: "badge", title: "Identity Verified! ✅", content: "Your identity has been verified. You now have the Verified Bonitar badge." });
    }
    toast.success(`Verification ${status}`);
    fetchAll();
  };

  const handleSpotlight = async (id: string, approved: boolean) => {
    await supabase.from("donor_spotlight").update({ admin_approved: approved }).eq("id", id);
    toast.success(approved ? "Spotlight approved!" : "Spotlight rejected");
    fetchAll();
  };

  if (!isAdmin && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-12 text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="font-body text-muted-foreground mt-2">You need admin privileges to access this page.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs = [
    { key: "verifications" as const, label: "Verifications", icon: Video, count: verifications.filter(v => v.status === "pending").length },
    { key: "spotlights" as const, label: "Spotlights", icon: Star, count: spotlights.filter(s => !s.admin_approved).length },
    { key: "disputes" as const, label: "Disputes", icon: AlertTriangle, count: disputes.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-8">
            <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="font-body text-muted-foreground">Manage verifications, spotlights, and disputes</p>
          </div>

          <div className="flex gap-2 mb-8">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-body font-medium transition-all ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border hover:text-foreground"}`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
                {t.count > 0 && (
                  <span className="w-5 h-5 rounded-full bg-destructive text-primary-foreground text-[10px] flex items-center justify-center">{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground font-body">Loading...</div>
          ) : (
            <>
              {tab === "verifications" && (
                <div className="space-y-4">
                  {verifications.length === 0 ? (
                    <p className="text-center py-8 font-body text-muted-foreground">No verifications to review</p>
                  ) : verifications.map((v) => (
                    <div key={v.id} className="bg-card rounded-xl border border-border p-5 shadow-card">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-body text-sm font-medium text-foreground">@{v.profile?.username}</p>
                          <p className="font-body text-xs text-muted-foreground">
                            Status: <span className={v.status === "pending" ? "text-secondary" : v.status === "approved" ? "text-green-600" : "text-destructive"}>{v.status}</span>
                          </p>
                          <p className="font-body text-xs text-muted-foreground">{formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}</p>
                        </div>
                        {v.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="default" onClick={() => handleVerification(v.id, "approved", v.user_id)}>
                              <CheckCircle className="h-3 w-3 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleVerification(v.id, "rejected", v.user_id)}>
                              <XCircle className="h-3 w-3 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                      <a href={v.video_url} target="_blank" rel="noopener noreferrer" className="font-body text-xs text-primary hover:underline">
                        View Video →
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {tab === "spotlights" && (
                <div className="space-y-4">
                  {spotlights.length === 0 ? (
                    <p className="text-center py-8 font-body text-muted-foreground">No spotlight submissions</p>
                  ) : spotlights.map((s) => (
                    <div key={s.id} className="bg-card rounded-xl border border-border p-5 shadow-card">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-body text-sm font-medium text-foreground">@{s.profile?.username}</p>
                          <p className="font-body text-xs text-muted-foreground">{s.profile?.items_donated ?? 0} items donated</p>
                          <p className="font-body text-xs text-muted-foreground">{formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}</p>
                        </div>
                        <span className={`font-body text-xs font-medium ${s.admin_approved ? "text-green-600" : "text-secondary"}`}>
                          {s.admin_approved ? "Approved" : "Pending"}
                        </span>
                      </div>
                      {s.message && <p className="font-body text-sm text-muted-foreground italic mb-3">"{s.message}"</p>}
                      {!s.admin_approved && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="default" onClick={() => handleSpotlight(s.id, true)}>
                            <CheckCircle className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleSpotlight(s.id, false)}>
                            <XCircle className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {tab === "disputes" && (
                <div className="space-y-4">
                  {disputes.length === 0 ? (
                    <p className="text-center py-8 font-body text-muted-foreground">No disputes filed</p>
                  ) : disputes.map((d) => (
                    <div key={d.id} className="bg-card rounded-xl border border-border p-5 shadow-card">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-body text-sm font-medium text-foreground">Reported by @{d.reporter?.username}</p>
                          <p className="font-body text-xs text-muted-foreground">{formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}</p>
                        </div>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      </div>
                      <p className="font-body text-sm text-muted-foreground">{d.description || "No description"}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;
