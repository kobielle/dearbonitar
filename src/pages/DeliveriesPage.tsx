import { useState } from "react";
import { Package, Truck, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDeliveries, type Delivery } from "@/lib/deliveries";
import { useDonorRequests, useRecipientRequests, markDelivered, confirmReceived, fileDispute } from "@/lib/donations";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const donationStatusConfig: Record<string, { icon: typeof Clock; label: string; color: string }> = {
  pending: { icon: Clock, label: "Pending", color: "text-secondary" },
  "delivered-pending-recipient": { icon: Truck, label: "Delivered – Awaiting Confirmation", color: "text-blue-500" },
  completed: { icon: CheckCircle, label: "Completed", color: "text-green-600" },
  disputed: { icon: AlertTriangle, label: "Disputed", color: "text-destructive" },
};

const deliveryStatusConfig: Record<string, { icon: typeof Clock; label: string; color: string }> = {
  pending: { icon: Clock, label: "Pending", color: "text-secondary" },
  dispatched: { icon: Truck, label: "Dispatched", color: "text-blue-500" },
  delivered: { icon: CheckCircle, label: "Delivered", color: "text-green-600" },
  cancelled: { icon: XCircle, label: "Cancelled", color: "text-destructive" },
};

const DeliveriesPage = () => {
  const { profile } = useAuth();
  const { deliveries, loading: delLoading } = useDeliveries();
  const { requests: donorReqs, loading: donorLoading } = useDonorRequests();
  const { requests: recipientReqs, loading: recipientLoading } = useRecipientRequests();
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [disputeText, setDisputeText] = useState("");

  const isDonor = profile?.role === "donor";
  const requests = isDonor ? donorReqs : recipientReqs;
  const reqLoading = isDonor ? donorLoading : recipientLoading;

  const handleMarkDelivered = async (id: string) => {
    try {
      await markDelivered(id);
      toast.success("Marked as delivered");
      window.location.reload();
    } catch { toast.error("Failed to update"); }
  };

  const handleConfirmReceived = async (id: string) => {
    try {
      await confirmReceived(id);
      toast.success("Receipt confirmed! 🎉");
      window.location.reload();
    } catch { toast.error("Failed to confirm"); }
  };

  const handleDispute = async () => {
    if (!disputeId || !disputeText.trim()) return;
    try {
      await fileDispute(disputeId, disputeText);
      toast.success("Dispute filed");
      setDisputeId(null);
      setDisputeText("");
      window.location.reload();
    } catch { toast.error("Failed to file dispute"); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <Package className="h-10 w-10 text-primary mx-auto mb-3" />
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Deliveries & Donations</h1>
            <p className="font-body text-muted-foreground">Track your donation requests and deliveries</p>
          </div>

          {/* Donation Requests Section */}
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            {isDonor ? "Requests for Your Items" : "Your Requests"}
          </h2>
          {reqLoading ? (
            <div className="text-center py-8 text-muted-foreground font-body">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 bg-card rounded-2xl border border-border mb-8">
              <p className="font-body text-muted-foreground">No donation requests yet</p>
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {requests.map((r) => {
                const cfg = donationStatusConfig[r.donation_status] || donationStatusConfig.pending;
                const otherUser = isDonor ? r.recipient : r.donor;
                return (
                  <div key={r.id} className="bg-card rounded-xl border border-border p-5 shadow-card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-body text-sm font-medium text-foreground">{r.item?.title ?? "Item"}</p>
                        <p className="font-body text-xs text-muted-foreground">
                          {isDonor ? "To" : "From"}: {otherUser?.display_name || otherUser?.username || "Unknown"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                        <span className={`font-body text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {isDonor && r.donation_status === "pending" && (
                        <Button size="sm" variant="default" onClick={() => handleMarkDelivered(r.id)}>
                          Mark as Delivered
                        </Button>
                      )}
                      {!isDonor && r.donation_status === "delivered-pending-recipient" && (
                        <>
                          <Button size="sm" variant="default" onClick={() => handleConfirmReceived(r.id)}>
                            ✅ Received
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setDisputeId(r.id)}>
                            ❌ Not Received
                          </Button>
                        </>
                      )}
                    </div>

                    {disputeId === r.id && (
                      <div className="mt-3 space-y-2">
                        <textarea
                          className="w-full p-2 rounded-lg border border-border bg-background text-foreground font-body text-sm resize-none"
                          placeholder="Describe what happened..."
                          rows={3}
                          value={disputeText}
                          onChange={(e) => setDisputeText(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="destructive" onClick={handleDispute}>Submit Dispute</Button>
                          <Button size="sm" variant="ghost" onClick={() => { setDisputeId(null); setDisputeText(""); }}>Cancel</Button>
                        </div>
                      </div>
                    )}

                    <p className="font-body text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Logistics Deliveries */}
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Logistics Deliveries</h2>
          {delLoading ? (
            <div className="text-center py-8 text-muted-foreground font-body">Loading...</div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-8 bg-card rounded-2xl border border-border">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-body text-muted-foreground">No logistics deliveries</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveries.map((d) => {
                const cfg = deliveryStatusConfig[d.status] || deliveryStatusConfig.pending;
                return (
                  <div key={d.id} className="bg-card rounded-xl border border-border p-5 shadow-card">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <cfg.icon className={`h-5 w-5 ${cfg.color}`} />
                        <div>
                          <p className="font-body text-sm font-medium text-foreground">{cfg.label}</p>
                          {d.logistics_company && (
                            <p className="font-body text-xs text-muted-foreground">via {d.logistics_company}</p>
                          )}
                          {d.tracking_number && (
                            <p className="font-body text-xs text-muted-foreground">Tracking: {d.tracking_number}</p>
                          )}
                        </div>
                      </div>
                      <span className="font-body text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 p-4 bg-accent rounded-xl">
            <p className="font-body text-xs text-muted-foreground">
              ⚠️ <strong>Safety Tip:</strong> For direct pickups, always meet in public places. Never share your home address with strangers.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DeliveriesPage;
