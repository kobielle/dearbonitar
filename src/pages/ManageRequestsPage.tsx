import { useState } from "react";
import { CheckCircle, XCircle, Clock, Package, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useDonorItemRequests, approveRequest, declineRequest } from "@/lib/requests";
import { useDisputeCount } from "@/lib/donations";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "text-secondary" },
  approved: { label: "Approved", color: "text-green-600" },
  declined: { label: "Declined", color: "text-destructive" },
  cancelled: { label: "Cancelled", color: "text-muted-foreground" },
  completed: { label: "Completed", color: "text-green-600" },
  expired: { label: "Expired", color: "text-muted-foreground" },
  "delivered-pending-recipient": { label: "Delivered", color: "text-blue-500" },
  disputed: { label: "Disputed", color: "text-destructive" },
};

const DisputeBadge = ({ userId }: { userId?: string }) => {
  const count = useDisputeCount(userId);
  if (count === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
      <AlertTriangle className="h-3 w-3" /> {count} dispute{count !== 1 ? "s" : ""}
    </span>
  );
};

const ManageRequestsPage = () => {
  const { profile } = useAuth();
  const { requests, loading, refetch } = useDonorItemRequests();
  const [processing, setProcessing] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      await approveRequest(id);
      toast.success("Request approved! Other pending requests have been declined.");
      await refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve");
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (id: string) => {
    setProcessing(id);
    try {
      await declineRequest(id);
      toast.success("Request declined");
      await refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to decline");
    } finally {
      setProcessing(null);
    }
  };

  // Group requests by item
  const groupedByItem = requests.reduce((acc: Record<string, any[]>, r: any) => {
    const key = r.item_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <Users className="h-10 w-10 text-primary mx-auto mb-3" />
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Manage Requests</h1>
            <p className="font-body text-muted-foreground">Review and approve requests for your donated items</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground font-body">Loading requests...</div>
          ) : Object.keys(groupedByItem).length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-body text-muted-foreground">No requests for your items yet</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedByItem).map(([itemId, itemRequests]: [string, any[]]) => {
                const firstReq = itemRequests[0];
                const itemTitle = firstReq?.item?.title || "Item";
                const itemCategory = firstReq?.item?.category || "";
                const pendingCount = itemRequests.filter((r: any) => r.donation_status === "pending").length;

                return (
                  <div key={itemId} className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
                    <div className="p-4 border-b border-border bg-accent/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-display text-base font-semibold text-foreground">{itemTitle}</h3>
                          <p className="font-body text-xs text-muted-foreground">{itemCategory} · {itemRequests.length} request{itemRequests.length !== 1 ? "s" : ""}</p>
                        </div>
                        {pendingCount > 0 && (
                          <span className="text-xs font-body bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">
                            {pendingCount} pending
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="divide-y divide-border">
                      {itemRequests.map((r: any) => {
                        const cfg = statusConfig[r.donation_status] || statusConfig.pending;
                        return (
                          <div key={r.id} className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-lg overflow-hidden">
                                  {r.recipient?.avatar_url ? (
                                    <img src={r.recipient.avatar_url} alt="" className="w-full h-full object-cover" />
                                  ) : "🤲"}
                                </div>
                                <div>
                                  <p className="font-body text-sm font-medium text-foreground">
                                    @{r.recipient?.username || "Unknown"}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className={`font-body text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                                    <span className="font-body text-[10px] text-muted-foreground">
                                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                                    </span>
                                  </div>
                                  <DisputeBadge userId={r.recipient_id} />
                                </div>
                              </div>

                              {r.donation_status === "pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleApprove(r.id)}
                                    disabled={processing === r.id}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" /> Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDecline(r.id)}
                                    disabled={processing === r.id}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" /> Decline
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
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

export default ManageRequestsPage;
