import { useEffect, useState } from "react";
import { Shield, CheckCircle, XCircle, Star, Video, AlertTriangle, Users, Package, MessageSquare, BarChart3, Ban, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Tab = "analytics" | "users" | "verifications" | "spotlights" | "disputes" | "items" | "deliveries";

const AdminPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("analytics");
  const [verifications, setVerifications] = useState<any[]>([]);
  const [spotlights, setSpotlights] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({ totalUsers: 0, totalItems: 0, totalRequests: 0, totalDonated: 0 });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
      if (data) fetchAll();
      else setLoading(false);
    });
  }, [user, authLoading]);

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-12 text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground">Authentication Required</h1>
          <p className="font-body text-muted-foreground mt-2">Please log in to access this page.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const fetchAll = async () => {
    setLoading(true);
    const [vRes, sRes, dRes, uRes, iRes, delRes] = await Promise.all([
      supabase.from("video_verifications").select("*, profile:profiles!video_verifications_user_id_fkey(username, display_name)").order("created_at", { ascending: false }),
      supabase.from("donor_spotlight").select("*, profile:profiles!donor_spotlight_user_id_fkey(username, display_name, items_donated)").order("created_at", { ascending: false }),
      supabase.from("donation_disputes").select("*, reporter:profiles!donation_disputes_reporter_id_fkey(username)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("items").select("*, donor:profiles!donor_id(username)").order("created_at", { ascending: false }).limit(200),
      supabase.from("deliveries").select("*, item:items(title)").order("created_at", { ascending: false }).limit(100),
    ]);
    setVerifications((vRes.data as any[]) ?? []);
    setSpotlights((sRes.data as any[]) ?? []);
    setDisputes((dRes.data as any[]) ?? []);
    setUsers((uRes.data as any[]) ?? []);
    setItems((iRes.data as any[]) ?? []);
    setDeliveries((delRes.data as any[]) ?? []);

    // Analytics
    const [reqCount, donatedCount] = await Promise.all([
      supabase.from("item_requests").select("*", { count: "exact", head: true }),
      supabase.from("item_requests").select("*", { count: "exact", head: true }).eq("donation_status", "completed"),
    ]);
    setAnalytics({
      totalUsers: (uRes.data ?? []).length,
      totalItems: (iRes.data ?? []).length,
      totalRequests: reqCount.count ?? 0,
      totalDonated: donatedCount.count ?? 0,
    });
    setLoading(false);
  };

  const handleVerification = async (id: string, status: "approved" | "rejected", userId: string) => {
    await supabase.from("video_verifications").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (status === "approved") {
      await supabase.from("profiles").update({ video_verified: true, nin_verified: true }).eq("id", userId);
      await supabase.from("donor_badges").insert({ user_id: userId, badge_type: "verified" });
      const { data: prof } = await supabase.from("profiles").select("badges").eq("id", userId).single();
      const badges = [...new Set([...(prof?.badges ?? []), "verified"])];
      await supabase.from("profiles").update({ badges }).eq("id", userId);
      await supabase.from("notifications").insert({ user_id: userId, type: "badge", title: "Identity Verified! ✅", content: "Your identity has been verified." });
    }
    toast.success(`Verification ${status}`);
    fetchAll();
  };

  const handleSpotlight = async (id: string, approved: boolean) => {
    await supabase.from("donor_spotlight").update({ admin_approved: approved }).eq("id", id);
    toast.success(approved ? "Spotlight approved!" : "Spotlight rejected");
    fetchAll();
  };

  const handleSuspendUser = async (userId: string) => {
    await supabase.from("profiles").update({ role: "suspended" }).eq("id", userId);
    toast.success("User suspended");
    fetchAll();
  };

  const handleDeleteItem = async (itemId: string) => {
    await supabase.from("items").delete().eq("id", itemId);
    toast.success("Item removed");
    fetchAll();
  };

  if (!isAdmin && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-12 text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="font-body text-muted-foreground mt-2">You need admin privileges.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "users", label: "Users", icon: Users },
    { key: "verifications", label: "Verifications", icon: Video },
    { key: "items", label: "Items", icon: Package },
    { key: "spotlights", label: "Spotlights", icon: Star },
    { key: "disputes", label: "Disputes", icon: AlertTriangle },
    { key: "deliveries", label: "Deliveries", icon: Package },
  ];

  const filteredUsers = users.filter((u) =>
    !userSearch || u.username?.toLowerCase().includes(userSearch.toLowerCase()) || u.display_name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-6">
            <Shield className="h-10 w-10 text-primary mx-auto mb-2" />
            <h1 className="font-display text-2xl font-bold text-foreground">Admin Control Room</h1>
          </div>

          {/* Tab bar - scrollable */}
          <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-body font-medium whitespace-nowrap transition-all ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border hover:text-foreground"}`}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground font-body">Loading...</div>
          ) : (
            <>
              {/* ANALYTICS */}
              {tab === "analytics" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Total Users", value: analytics.totalUsers, color: "text-primary" },
                      { label: "Total Items", value: analytics.totalItems, color: "text-secondary" },
                      { label: "Active Requests", value: analytics.totalRequests, color: "text-foreground" },
                      { label: "Completed Donations", value: analytics.totalDonated, color: "text-primary" },
                    ].map((s) => (
                      <div key={s.label} className="bg-card rounded-xl border border-border p-5">
                        <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="font-body text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-card rounded-xl border border-border p-5">
                    <h3 className="font-display text-sm font-semibold text-foreground mb-3">Quick Stats</h3>
                    <div className="space-y-2 font-body text-sm text-muted-foreground">
                      <p>Pending Verifications: {verifications.filter((v) => v.status === "pending").length}</p>
                      <p>Pending Spotlights: {spotlights.filter((s) => !s.admin_approved).length}</p>
                      <p>Open Disputes: {disputes.length}</p>
                      <p>Active Deliveries: {deliveries.filter((d) => d.status !== "delivered").length}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* USERS */}
              {tab === "users" && (
                <div className="space-y-4">
                  <Input placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="font-body text-sm" />
                  {filteredUsers.length === 0 ? (
                    <p className="text-center py-8 font-body text-muted-foreground">No users found</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredUsers.map((u) => (
                        <div key={u.id} className="bg-card rounded-lg border border-border p-4 flex items-center justify-between">
                          <div>
                            <p className="font-body text-sm font-semibold text-foreground">@{u.username}</p>
                            <p className="font-body text-xs text-muted-foreground">
                              {u.role} · {u.items_donated || 0} donated · {u.nin_verified ? "✅ Verified" : "❌ Unverified"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {u.role !== "suspended" && (
                              <Button size="sm" variant="destructive" onClick={() => handleSuspendUser(u.id)}>
                                <Ban className="h-3 w-3 mr-1" /> Suspend
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* VERIFICATIONS */}
              {tab === "verifications" && (
                <div className="space-y-4">
                  {verifications.length === 0 ? (
                    <p className="text-center py-8 font-body text-muted-foreground">No verifications</p>
                  ) : verifications.map((v) => (
                    <div key={v.id} className="bg-card rounded-xl border border-border p-5">
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
                            <Button size="sm" onClick={() => handleVerification(v.id, "approved", v.user_id)}>
                              <CheckCircle className="h-3 w-3 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleVerification(v.id, "rejected", v.user_id)}>
                              <XCircle className="h-3 w-3 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                      <a href={v.video_url} target="_blank" rel="noopener noreferrer" className="font-body text-xs text-primary hover:underline">View Video →</a>
                    </div>
                  ))}
                </div>
              )}

              {/* ITEMS */}
              {tab === "items" && (
                <div className="space-y-2">
                  {items.length === 0 ? (
                    <p className="text-center py-8 font-body text-muted-foreground">No items</p>
                  ) : items.map((item) => (
                    <div key={item.id} className="bg-card rounded-lg border border-border p-4 flex items-center justify-between">
                      <div>
                        <p className="font-body text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="font-body text-xs text-muted-foreground">
                          by @{item.donor?.username} · {item.category} · {item.status}
                        </p>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteItem(item.id)}>
                        <XCircle className="h-3 w-3 mr-1" /> Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* SPOTLIGHTS */}
              {tab === "spotlights" && (
                <div className="space-y-4">
                  {spotlights.length === 0 ? (
                    <p className="text-center py-8 font-body text-muted-foreground">No spotlight submissions</p>
                  ) : spotlights.map((s) => (
                    <div key={s.id} className="bg-card rounded-xl border border-border p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-body text-sm font-medium text-foreground">@{s.profile?.username}</p>
                          <p className="font-body text-xs text-muted-foreground">{s.profile?.items_donated ?? 0} items donated</p>
                        </div>
                        <span className={`font-body text-xs font-medium ${s.admin_approved ? "text-green-600" : "text-secondary"}`}>
                          {s.admin_approved ? "Approved" : "Pending"}
                        </span>
                      </div>
                      {s.message && <p className="font-body text-sm text-muted-foreground italic mb-3">"{s.message}"</p>}
                      {!s.admin_approved && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSpotlight(s.id, true)}>
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

              {/* DISPUTES */}
              {tab === "disputes" && (
                <div className="space-y-4">
                  {disputes.length === 0 ? (
                    <p className="text-center py-8 font-body text-muted-foreground">No disputes</p>
                  ) : disputes.map((d) => (
                    <div key={d.id} className="bg-card rounded-xl border border-border p-5">
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

              {/* DELIVERIES */}
              {tab === "deliveries" && (
                <div className="space-y-2">
                  {deliveries.length === 0 ? (
                    <p className="text-center py-8 font-body text-muted-foreground">No deliveries</p>
                  ) : deliveries.map((d) => (
                    <div key={d.id} className="bg-card rounded-lg border border-border p-4">
                      <p className="font-body text-sm font-semibold text-foreground">{d.item?.title || "Unknown Item"}</p>
                      <p className="font-body text-xs text-muted-foreground">
                        Status: {d.status} · {d.tracking_number ? `Tracking: ${d.tracking_number}` : "No tracking"} · {d.logistics_company || "No logistics"}
                      </p>
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
