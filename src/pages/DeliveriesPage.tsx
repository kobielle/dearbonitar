import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDeliveries, type Delivery } from "@/lib/deliveries";
import { formatDistanceToNow } from "date-fns";

const statusConfig: Record<string, { icon: typeof Clock; label: string; color: string }> = {
  pending: { icon: Clock, label: "Pending", color: "text-secondary" },
  dispatched: { icon: Truck, label: "Dispatched", color: "text-blue-500" },
  delivered: { icon: CheckCircle, label: "Delivered", color: "text-green-600" },
  cancelled: { icon: XCircle, label: "Cancelled", color: "text-destructive" },
};

const DeliveriesPage = () => {
  const { deliveries, loading } = useDeliveries();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <Package className="h-10 w-10 text-primary mx-auto mb-3" />
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Deliveries</h1>
            <p className="font-body text-muted-foreground">Track your donation deliveries</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground font-body">Loading...</div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-body text-muted-foreground">No deliveries yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveries.map((d) => {
                const cfg = statusConfig[d.status] || statusConfig.pending;
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
