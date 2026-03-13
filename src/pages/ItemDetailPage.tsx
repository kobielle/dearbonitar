import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGiftEligibility } from "@/lib/donations";
import { useUserRequests, requestItemEnhanced } from "@/lib/requests";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, ArrowLeft, Heart, MessageCircle, ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Item } from "@/lib/bonitarCloud";

const categoryEmojis: Record<string, string> = {
  Food: "🍚", Electronics: "🔌", Gadgets: "📱", Books: "📚", Clothing: "🧥",
  Shoes: "👟", Furniture: "🪑", Appliances: "🍳", "Baby items": "🍼",
  "School supplies": "✏️", "Kitchen items": "🍳", Other: "📦",
};

const ItemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isRecipient = profile?.role === "recipient";
  const { eligible } = useGiftEligibility(isRecipient ? user?.id : undefined);
  const { requestedItemIds, activeCount } = useUserRequests();
  const [item, setItem] = useState<(Item & { donor?: any }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("items")
        .select("*, donor:profiles!donor_id(*)")
        .eq("id", id)
        .single();
      setItem(data as any);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleRequest = async () => {
    if (!user) { toast.error("Please sign in to request items"); return; }
    if (!isRecipient) { toast.error("Only recipients can request items"); return; }
    if (!item) return;
    setRequesting(true);
    try {
      await requestItemEnhanced(item.id);
      toast.success("Item requested! The Bonitar will be notified.");
      requestedItemIds.add(item.id);
    } catch (err: any) {
      toast.error(err.message || "Request failed");
    } finally {
      setRequesting(false);
    }
  };

  const images = item?.image_urls?.length ? item.image_urls : [];
  const hasImages = images.length > 0;
  const alreadyRequested = item ? requestedItemIds.has(item.id) : false;
  const canRequest = isRecipient && eligible && activeCount < 5 && !alreadyRequested;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center text-muted-foreground font-body">Loading item...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center">
          <p className="text-muted-foreground font-body mb-4">Item not found</p>
          <Button variant="warmOutline" asChild><Link to="/feed">Browse Items</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back */}
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground font-body text-sm mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Image gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square bg-accent rounded-xl overflow-hidden flex items-center justify-center">
                {hasImages ? (
                  <>
                    <img src={images[imgIndex]} alt={item.title} className="w-full h-full object-cover" />
                    {images.length > 1 && (
                      <>
                        <button onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1.5 hover:bg-background transition-colors">
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button onClick={() => setImgIndex((i) => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1.5 hover:bg-background transition-colors">
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-7xl">{categoryEmojis[item.category] || "📦"}</span>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((url, i) => (
                    <button key={i} onClick={() => setImgIndex(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${i === imgIndex ? "border-primary" : "border-border"}`}>
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-5">
              <div>
                <span className="text-xs font-body font-medium text-primary bg-coral-light px-2.5 py-0.5 rounded-full">
                  {item.category}
                </span>
                <span className={`ml-2 text-xs font-body font-medium px-2.5 py-0.5 rounded-full ${item.status === "available" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                  {item.status === "available" ? "Available" : item.status}
                </span>
              </div>

              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{item.title}</h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground font-body">
                {item.pickup_location && (
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {item.pickup_location}</span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </span>
              </div>

              {item.description && (
                <div>
                  <h3 className="font-display text-sm font-semibold text-foreground mb-1">Description</h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{item.description}</p>
                </div>
              )}

              {/* Donor info */}
              {item.donor && (
                <div className="flex items-center gap-3 p-3 bg-accent rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold">
                    {(item.donor.display_name || item.donor.username)?.[0]?.toUpperCase() || "B"}
                  </div>
                  <div>
                    <p className="font-body text-sm font-semibold text-foreground">
                      {item.donor.display_name || `@${item.donor.username}`}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {item.donor.items_donated || 0} items donated
                    </p>
                  </div>
                </div>
              )}

              {/* Safety */}
              <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-secondary shrink-0" />
                <p className="font-body text-xs text-muted-foreground">
                  <strong>Safety:</strong> Always meet in public places for pickups.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                {isRecipient && item.status === "available" && (
                  <Button
                    variant={alreadyRequested ? "outline" : "hero"}
                    size="lg"
                    className="w-full"
                    onClick={handleRequest}
                    disabled={!canRequest || requesting}
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    {requesting ? "Requesting..." : alreadyRequested ? "✓ Requested" : !eligible ? "Gift Limit Reached" : activeCount >= 5 ? "5 Request Limit" : "Request This Item"}
                  </Button>
                )}
                {!user && item.status === "available" && (
                  <Button variant="hero" size="lg" className="w-full" asChild>
                    <Link to="/signup">Sign Up to Request</Link>
                  </Button>
                )}
                {alreadyRequested && (
                  <Button variant="warmOutline" size="lg" className="w-full" asChild>
                    <Link to="/chat"><MessageCircle className="h-5 w-5 mr-2" /> Message Bonitar</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ItemDetailPage;
