import { useMemo, useState } from "react";
import { MapPin, Search, Heart, Clock, AlertTriangle, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useItems } from "@/lib/bonitarCloud";
import { useAuth } from "@/contexts/AuthContext";
import { useGiftEligibility } from "@/lib/donations";
import { useUserRequests, requestItemEnhanced } from "@/lib/requests";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { CATEGORY_EMOJIS, ITEM_FEED_CATEGORIES, NIGERIA_LOCATION_OPTIONS } from "@/lib/marketplace";

const ALL_STATES = "All States";
const ALL_AREAS = "All Areas";

const ItemFeedPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState(ALL_STATES);
  const [selectedArea, setSelectedArea] = useState(ALL_AREAS);

  const { items, loading } = useItems(selectedCategory);
  const { user, profile } = useAuth();
  const isRecipient = profile?.role === "recipient";

  const { eligible, remaining, loading: eligLoading } = useGiftEligibility(
    isRecipient ? user?.id : undefined
  );
  const { requestedItemIds, activeCount } = useUserRequests();
  const [requestingId, setRequestingId] = useState<string | null>(null);

  const stateOptions = useMemo(() => Object.keys(NIGERIA_LOCATION_OPTIONS), []);
  const areaOptions =
    selectedState !== ALL_STATES ? NIGERIA_LOCATION_OPTIONS[selectedState] ?? [] : [];

  const normalized = (value?: string | null) => (value ?? "").toLowerCase();

  const filteredItems = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    const itemLocationPriority = (item: any) => {
      const stateText = normalized(item.state || item.pickup_location);
      const areaText = normalized(item.area || item.pickup_location);

      if (selectedArea !== ALL_AREAS && areaText.includes(selectedArea.toLowerCase())) return 0;
      if (selectedState !== ALL_STATES && stateText.includes(selectedState.toLowerCase())) return 1;
      return 2;
    };

    return [...items]
      .filter((item) => {
        if (!term) return true;

        return [item.title, item.description, item.category, item.pickup_location, item.state, item.area]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
      })
      .sort((a: any, b: any) => {
        const locationSort = itemLocationPriority(a) - itemLocationPriority(b);
        if (locationSort !== 0) return locationSort;

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [items, searchQuery, selectedState, selectedArea]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleRequest = async (itemId: string) => {
    if (!user) {
      toast.error("Please sign in to request items");
      return;
    }

    if (!isRecipient) {
      toast.error("Only recipients can request items");
      return;
    }

    setRequestingId(itemId);

    try {
      await requestItemEnhanced(itemId);
      toast.success("Item requested! The Bonitar will be notified.");
      requestedItemIds.add(itemId);
    } catch (err: any) {
      console.error("[requests] item request failed", err);
      toast.error(err.message || "Request failed");
    } finally {
      setRequestingId(null);
    }
  };

  const getButtonState = (itemId: string) => {
    if (requestedItemIds.has(itemId)) return "requested";
    if (!eligible) return "gift-limit";
    if (activeCount >= 5) return "active-limit";
    return "available";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Browse Donations</h1>
            <p className="font-body text-muted-foreground">Find items available near you</p>
          </div>

          {isRecipient && !eligLoading && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                eligible ? "bg-accent" : "bg-destructive/10 border border-destructive/20"
              }`}
            >
              {eligible ? (
                <>
                  <Heart className="h-5 w-5 text-primary shrink-0" />
                  <p className="font-body text-sm text-foreground">
                    You can receive <strong>{remaining}</strong> more gift{remaining !== 1 ? "s" : ""} in the
                    current 61-day period.
                    {activeCount > 0 && (
                      <span className="text-muted-foreground"> · {activeCount}/5 active requests</span>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                  <p className="font-body text-sm text-destructive">
                    You've reached the limit of 3 gifts per 61 days. Your eligibility will reset automatically.
                  </p>
                </>
              )}
            </div>
          )}

          {isRecipient && activeCount >= 5 && (
            <div className="mb-6 p-4 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-secondary shrink-0" />
              <p className="font-body text-sm text-foreground">
                You have <strong>5 active requests</strong>. Complete or cancel existing requests before making new
                ones.
              </p>
            </div>
          )}

          <div className="mb-6 p-3 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-secondary shrink-0" />
            <p className="font-body text-xs text-muted-foreground">
              <strong>Safety:</strong> Always meet in public places (churches, schools, bus stops) for pickups. Never
              share your home address.
            </p>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6" onSubmit={handleSearchSubmit}>
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                className="pl-10 pr-10 font-body"
                value={searchInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchInput(value);
                  setSearchQuery(value);
                }}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Search items"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>

            <select
              value={selectedState}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedState(value);
                setSelectedArea(ALL_AREAS);
              }}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm font-body text-foreground"
            >
              <option>{ALL_STATES}</option>
              {stateOptions.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              disabled={selectedState === ALL_STATES}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm font-body text-foreground disabled:opacity-60"
            >
              <option>{ALL_AREAS}</option>
              {areaOptions.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </form>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {ITEM_FEED_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-body font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-card text-muted-foreground border border-border hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground font-body">Loading items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-body">No items found. Be the first to donate!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item: any) => {
                const btnState = getButtonState(item.id);

                return (
                  <div
                    key={item.id}
                    className="group bg-card rounded-xl border border-border hover:shadow-elevated transition-all duration-300 overflow-hidden"
                  >
                    <Link to={`/item/${item.id}`} className="block cursor-pointer">
                      <div className="h-44 bg-accent flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
                        {item.image_urls?.length ? (
                          <img src={item.image_urls[0]} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          CATEGORY_EMOJIS[item.category] || "📦"
                        )}
                      </div>

                      <div className="p-5 pb-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-body font-medium text-primary bg-coral-light px-2.5 py-0.5 rounded-full">
                            {item.category}
                          </span>
                          <Heart className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                        </div>

                        <h3 className="font-display text-base font-semibold text-foreground mb-3">{item.title}</h3>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-body flex-wrap">
                          {item.pickup_location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {item.pickup_location}
                            </span>
                          )}
                          {(item.state || item.area) && (
                            <span className="text-primary">{[item.area, item.state].filter(Boolean).join(", ")}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="px-5 pb-5">
                      {isRecipient && (
                        <Button
                          variant={btnState === "requested" ? "outline" : "warmOutline"}
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => handleRequest(item.id)}
                          disabled={btnState !== "available" || requestingId === item.id}
                        >
                          {requestingId === item.id
                            ? "Requesting..."
                            : btnState === "requested"
                            ? "✓ Requested"
                            : btnState === "gift-limit"
                            ? "Gift Limit Reached"
                            : btnState === "active-limit"
                            ? "5 Request Limit Reached"
                            : "Request Item"}
                        </Button>
                      )}

                      {!user && (
                        <Button variant="warmOutline" size="sm" className="w-full mt-2" onClick={() => handleRequest(item.id)}>
                          Request Item
                        </Button>
                      )}
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

export default ItemFeedPage;