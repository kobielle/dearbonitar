import { useState } from "react";
import { MapPin, Search, Heart, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useItems, requestItem } from "@/lib/bonitarCloud";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const categories = [
  "All", "Food", "Electronics", "Gadgets", "Books", "Clothing", "Shoes",
  "Furniture", "Appliances", "Baby items", "School supplies", "Kitchen items", "Other"
];

const categoryEmojis: Record<string, string> = {
  Food: "🍚", Electronics: "🔌", Gadgets: "📱", Books: "📚", Clothing: "🧥",
  Shoes: "👟", Furniture: "🪑", Appliances: "🍳", "Baby items": "🍼",
  "School supplies": "✏️", "Kitchen items": "🍳", Other: "📦",
};

const ItemFeedPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { items, loading } = useItems(selectedCategory);
  const { user } = useAuth();

  const handleRequest = async (itemId: string) => {
    if (!user) { toast.error("Please sign in to request items"); return; }
    try {
      await requestItem(itemId);
      toast.success("Item requested!");
    } catch (err: any) {
      toast.error(err.message || "Request failed");
    }
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

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search items..." className="pl-10 font-body" />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-body font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? "bg-primary text-primary-foreground shadow-soft" : "bg-card text-muted-foreground border border-border hover:text-foreground"}`}>
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground font-body">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-body">No items found. Be the first to donate!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item.id} className="group bg-card rounded-xl border border-border hover:shadow-elevated transition-all duration-300 overflow-hidden cursor-pointer">
                  <div className="h-44 bg-accent flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
                    {item.image_urls?.length ? (
                      <img src={item.image_urls[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      categoryEmojis[item.category] || "📦"
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-body font-medium text-primary bg-coral-light px-2.5 py-0.5 rounded-full">{item.category}</span>
                      <Heart className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                    </div>
                    <h3 className="font-display text-base font-semibold text-foreground mb-3">{item.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
                      {item.pickup_location && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.pickup_location}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <Button variant="warmOutline" size="sm" className="w-full mt-4" onClick={() => handleRequest(item.id)}>
                      Request Item
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ItemFeedPage;
