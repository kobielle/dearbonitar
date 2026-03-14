import { useState } from "react";
import { Package, Truck, CheckCircle, Clock, XCircle, AlertTriangle, ShieldAlert, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDeliveries, createDelivery, type Delivery } from "@/lib/deliveries";
import { useDonorRequests, useRecipientRequests, markDelivered, confirmReceived, fileDispute, useDisputeCount } from "@/lib/donations";
import { cancelRequest } from "@/lib/requests";
import { sendAppreciation } from "@/lib/requests";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const donationStatusConfig: Record<string, { icon: typeof Clock; label: string; color: string }> = {
  pending: { icon: Clock, label: "Pending", color: "text-secondary" },
  approved: { icon: CheckCircle, label: "Approved", color: "text-green-600" },
  declined: { icon: XCircle, label: "Declined", color: "text-muted-foreground" },
  cancelled: { icon: XCircle, label: "Cancelled", color: "text-muted-foreground" },
  expired: { icon: XCircle, label: "Expired", color: "text-muted-foreground" },
  "delivered-pending-recipient": { icon: Truck, label: "Delivered – Awaiting Confirmation", color: "text-blue-500" },
  completed: { icon: CheckCircle, label: "Completed", color: "text-green-600" },
  disputed: { icon: AlertTriangle, label: "Disputed", color: "text-destructive" },
};

const deliveryStatusConfig: Record<string, { icon: typeof Clock; label: string; color: string }> = {
  pending: { icon: Clock, label: "Pending Pickup", color: "text-secondary" },
  dispatched: { icon: Truck, label: "Dispatched", color: "text-blue-500" },
  delivered: { icon: CheckCircle, label: "Delivered", color: "text-green-600" },
  cancelled: { icon: XCircle, label: "Cancelled", color: "text-destructive" },
};

const DeliveriesPage = () => {
  const { profile, user } = useAuth();
  const { deliveries, loading: delLoading } = useDeliveries();
  const { requests: donorReqs, loading: donorLoading } = useDonorRequests();
  const { requests: recipientReqs, loading: recipientLoading } = useRecipientRequests();
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [disputeText, setDisputeText] = useState("");
  const [logisticsForm, setLogisticsForm] = useState<{ requestId: string; itemId: string; recipientId: string } | null>(null);
  const [logisticsCompany, setLogisticsCompany] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [appreciationForm, setAppreciationForm] = useState<{ donorId: string; requestId: string } | null>(null);
  const [appreciationText, setAppreciationText] = useState("");

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

  const handleCancelRequest = async (id: string) => {
    try {
      await cancelRequest(id);
      toast.success("Request cancelled");
      window.location.reload();
    } catch { toast.error("Failed to cancel"); }
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

  const handleCreateDelivery = async () => {
    if (!logisticsForm || !logisticsCompany.trim()) return;
    try {
      await createDelivery({
        item_id: logisticsForm.itemId,
        recipient_id: logisticsForm.recipientId,
        logistics_company: logisticsCompany,
      });
      toast.success("Logistics delivery created! The recipient will be notified.");
      setLogisticsForm(null);
      setLogisticsCompany("");
      setTrackingNumber("");
      window.location.reload();
    } catch { toast.error("Failed to create delivery"); }
  };

  const handleSendAppreciation = async () => {
    if (!appreciationForm || !appreciationText.trim()) return;
    try {
      await sendAppreciation(appreciationForm.donorId, appreciationText, appreciationForm.requestId);
      toast.success("Thank you message sent! 💛");
      setAppreciationForm(null);
      setAppreciationText("");
    } catch { toast.error("Failed to send"); }
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

          {/* Safety warning */}
          <div className="mb-6 p-4 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-secondary shrink-0" />
            <p className="font-body text-xs text-muted-foreground">
              <strong>Safety Tip:</strong> For direct pickups, always meet at public locations — churches, schools, bus stops, or shopping plazas. Never share your home address.
            </p>
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
                const otherUserId = isDonor ? r.recipient_id : r.donor_id;
                return (
                  <div key={r.id} className="bg-card rounded-xl border border-border p-5 shadow-card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-body text-sm font-medium text-foreground">{r.item?.title ?? "Item"}</p>
                        <p className="font-body text-xs text-muted-foreground">
                          {isDonor ? "To" : "From"}: {otherUser?.display_name || otherUser?.username || "Unknown"}
                        </p>
                        <DisputeWarning userId={otherUserId ?? undefined} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                        <span className={`font-body text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {/* Donor actions */}
                      {isDonor && (r.donation_status === "pending" || r.donation_status === "approved") && (
                        <>
                          <Button size="sm" variant="default" onClick={() => handleMarkDelivered(r.id)}>
                            Mark as Delivered
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setLogisticsForm({ requestId: r.id, itemId: r.item_id, recipientId: r.recipient_id })}
                          >
                            <Truck className="h-3 w-3 mr-1" /> Use Logistics
                          </Button>
                        </>
                      )}

                      {/* Recipient actions */}
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

                      {/* Cancel button for recipients with pending requests */}
                      {!isDonor && (r.donation_status === "pending" || r.donation_status === "approved") && (
                        <Button size="sm" variant="ghost" onClick={() => handleCancelRequest(r.id)}>
                          Cancel Request
                        </Button>
                      )}

                      {/* Thank you button for completed donations */}
                      {!isDonor && r.donation_status === "completed" && r.donor_id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAppreciationForm({ donorId: r.donor_id!, requestId: r.id })}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" /> Say Thank You
                        </Button>
                      )}
                    </div>

                    {/* Logistics form */}
                    {logisticsForm?.requestId === r.id && (
                      <div className="mt-3 space-y-2 p-3 rounded-lg bg-accent">
                        <p className="font-body text-sm font-medium text-foreground">Arrange Logistics Delivery</p>
                        <p className="font-body text-xs text-muted-foreground">
                          The recipient pays delivery fees at the logistics office. You are not charged.
                        </p>
                        <Input
                          placeholder="Logistics company (e.g. GIG, ABC Transport)"
                          value={logisticsCompany}
                          onChange={(e) => setLogisticsCompany(e.target.value)}
                        />
                        <Input
                          placeholder="Tracking number (optional)"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="default" onClick={handleCreateDelivery}>Create Delivery</Button>
                          <Button size="sm" variant="ghost" onClick={() => setLogisticsForm(null)}>Cancel</Button>
                        </div>
                      </div>
                    )}

                    {/* Dispute form */}
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

                    {/* Appreciation form */}
                    {appreciationForm?.requestId === r.id && (
                      <div className="mt-3 space-y-2 p-3 rounded-lg bg-accent">
                        <p className="font-body text-sm font-medium text-foreground">💛 Send a Thank You</p>
                        <textarea
                          className="w-full p-2 rounded-lg border border-border bg-background text-foreground font-body text-sm resize-none"
                          placeholder="Write your thank you message..."
                          rows={3}
                          value={appreciationText}
                          onChange={(e) => setAppreciationText(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="default" onClick={handleSendAppreciation}>Send</Button>
                          <Button size="sm" variant="ghost" onClick={() => { setAppreciationForm(null); setAppreciationText(""); }}>Cancel</Button>
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
                    {d.status === "pending" && !isDonor && (
                      <div className="mt-3 p-3 rounded-lg bg-accent">
                        <p className="font-body text-xs text-muted-foreground">
                          💰 Please pay the delivery fee at the <strong>{d.logistics_company}</strong> office to release your item. The Bonitar is not charged.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Dispute history warning component
const DisputeWarning = ({ userId }: { userId?: string }) => {
  const count = useDisputeCount(userId);
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-1 mt-1">
      <AlertTriangle className="h-3 w-3 text-destructive" />
      <span className="font-body text-[11px] text-destructive">
        {count} past dispute{count !== 1 ? "s" : ""} on record
      </span>
    </div>
  );
};

export default DeliveriesPage;
