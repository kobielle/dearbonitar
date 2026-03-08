import { useState } from "react";
import { MapPin, Search, SlidersHorizontal, Heart, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = [
  "All", "Food", "Electronics", "Gadgets", "Books", "Clothing", "Shoes",
  "Furniture", "Appliances", "Baby items", "School supplies", "Kitchen items", "Other"
];

const distances = ["1 km", "3 km", "5 km", "10 km"];

const mockItems = [
  { id: 1, title: "Children's Books Bundle", category: "Books", distance: "1.2 km", time: "2h ago", emoji: "📚" },
  { id: 2, title: "Baby Stroller - Good Condition", category: "Baby items", distance: "3.1 km", time: "5h ago", emoji: "🍼" },
  { id: 3, title: "Winter Jackets (M/L)", category: "Clothing", distance: "0.8 km", time: "1h ago", emoji: "🧥" },
  { id: 4, title: "School Supplies Kit", category: "School supplies", distance: "2.5 km", time: "3h ago", emoji: "✏️" },
  { id: 5, title: "Kitchen Blender", category: "Kitchen items", distance: "4.2 km", time: "6h ago", emoji: "🍳" },
  { id: 6, title: "Wooden Dining Table", category: "Furniture", distance: "1.9 km", time: "4h ago", emoji: "🪑" },
  { id: 7, title: "Samsung Galaxy Charger", category: "Electronics", distance: "0.5 km", time: "30m ago", emoji: "🔌" },
  { id: 8, title: "Running Shoes Size 42", category: "Shoes", distance: "2.1 km", time: "7h ago", emoji: "👟" },
  { id: 9, title: "Rice & Beans (5kg)", category: "Food", distance: "1.0 km", time: "1h ago", emoji: "🍚" },
];

const ItemFeedPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDistance, setSelectedDistance] = useState("5 km");

  const filtered = selectedCategory === "All" ? mockItems : mockItems.filter(i => i.category === selectedCategory);

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
            <div className="flex gap-2">
              {distances.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDistance(d)}
                  className={`px-3 py-2 rounded-lg text-xs font-body font-medium transition-all ${
                    selectedDistance === d
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MapPin className="h-3 w-3 inline mr-1" />
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {categories.map((cat) => (
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group bg-card rounded-xl border border-border hover:shadow-elevated transition-all duration-300 overflow-hidden cursor-pointer"
              >
                <div className="h-44 bg-accent flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
                  {item.emoji}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-body font-medium text-primary bg-coral-light px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <Heart className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground mb-3">{item.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {item.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {item.time}
                    </span>
                  </div>
                  <Button variant="warmOutline" size="sm" className="w-full mt-4">
                    Request Item
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ItemFeedPage;
