import { motion } from "framer-motion";
import { MapPin, Heart, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const mockItems = [
  { id: 1, title: "Children's Books Bundle", category: "Books", distance: "1.2 km", time: "2h ago", image: "📚" },
  { id: 2, title: "Baby Stroller - Good Condition", category: "Baby items", distance: "3.1 km", time: "5h ago", image: "🍼" },
  { id: 3, title: "Winter Jackets (M/L)", category: "Clothing", distance: "0.8 km", time: "1h ago", image: "🧥" },
  { id: 4, title: "School Supplies Kit", category: "School supplies", distance: "2.5 km", time: "3h ago", image: "✏️" },
  { id: 5, title: "Kitchen Blender", category: "Kitchen items", distance: "4.2 km", time: "6h ago", image: "🍳" },
  { id: 6, title: "Wooden Dining Table", category: "Furniture", distance: "1.9 km", time: "4h ago", image: "🪑" },
];

const NearbyFeed = () => {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockItems.map((item, i) => (
            <motion.div
              key={item.id}
              className="group bg-card rounded-xl border border-border hover:shadow-elevated transition-all duration-300 overflow-hidden cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="h-40 bg-accent flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
                {item.image}
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
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

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
