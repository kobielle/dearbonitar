import { motion } from "framer-motion";
import { MapPin, Heart, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useItems } from "@/lib/bonitarCloud";
import { formatDistanceToNow } from "date-fns";

const categoryEmojis: Record<string, string> = {
  Food: "🍚", Electronics: "🔌", Gadgets: "📱", Books: "📚", Clothing: "🧥",
  Shoes: "👟", Furniture: "🪑", Appliances: "🍳", "Baby items": "🍼",
  "School supplies": "✏️", "Kitchen items": "🍳", Other: "📦",
};

const NearbyFeed = () => {
  const { items, loading } = useItems();
  const displayItems = items.slice(0, 6);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <motion.h2
              className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Nearby Donations
            </motion.h2>
            <p className="font-body text-muted-foreground">
              Items available in your community right now
            </p>
          </div>
          <Button variant="warmOutline" size="sm" asChild className="hidden sm:flex">
            <Link to="/feed">View All</Link>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground font-body">Loading nearby items...</div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground font-body">No donations yet. Be the first to give!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayItems.map((item, i) => (
              <motion.div
                key={item.id}
                className="group bg-card rounded-xl border border-border hover:shadow-elevated transition-all duration-300 overflow-hidden cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="h-40 bg-accent flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
                  {item.image_urls?.length ? (
                    <img src={item.image_urls[0]} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    categoryEmojis[item.category] || "📦"
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-body font-medium text-primary bg-coral-light px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <Heart className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
                    {item.pickup_location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.pickup_location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Button variant="warmOutline" asChild>
            <Link to="/feed">View All Items</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NearbyFeed;
