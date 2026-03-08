import { motion } from "framer-motion";
import { Star, Heart, Gift, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const spotlights = [
  {
    name: "@KindnessWarrior",
    items: 47,
    badge: "❤️",
    quote: "I started giving away things I no longer needed, and it became my favorite thing to do.",
    categories: ["Electronics", "Books", "Clothing", "Kitchen items"],
    featured: true,
  },
  {
    name: "@GentleGiver",
    items: 32,
    badge: "❤️",
    quote: "Every item I donate carries a little piece of hope.",
    categories: ["Baby items", "School supplies", "Clothing"],
    featured: false,
  },
  {
    name: "@CommunityHeart",
    items: 28,
    badge: "❤️",
    quote: "The joy of giving is unmatched. It's addictive in the best way.",
    categories: ["Furniture", "Appliances", "Books"],
    featured: false,
  },
];

const DonorSpotlightPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex items-center gap-2 text-secondary font-body text-sm font-medium mb-3">
                <Star className="h-4 w-4 fill-current" />
                Bonitar Spotlight
              </span>
              <h1 className="font-display text-4xl font-bold text-foreground mb-3">
                Celebrating Outstanding Bonitars
              </h1>
              <p className="font-body text-muted-foreground max-w-md mx-auto">
                Every week we highlight Bonitars who are making a difference through their generosity
              </p>
            </motion.div>
          </div>

          <div className="space-y-8 max-w-3xl mx-auto">
            {spotlights.map((donor, i) => (
              <motion.div
                key={donor.name}
                className={`rounded-2xl border border-border p-8 ${
                  donor.featured ? "bg-coral-light shadow-soft" : "bg-card shadow-card"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {donor.featured && (
                  <span className="inline-flex items-center gap-1 text-xs font-body font-medium text-primary bg-card px-3 py-1 rounded-full mb-4">
                    <Star className="h-3 w-3 fill-current" /> This Week's Spotlight
                  </span>
                )}
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-3xl shrink-0">
                    {donor.badge}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground mb-1">{donor.name}</h3>
                    <p className="font-body text-sm text-primary font-medium mb-3">
                      <Gift className="inline h-4 w-4 mr-1" /> {donor.items} Items Donated
                    </p>
                    <p className="font-body text-muted-foreground italic leading-relaxed mb-4">
                      "{donor.quote}"
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {donor.categories.map((cat) => (
                        <span key={cat} className="text-xs font-body bg-accent text-accent-foreground px-3 py-1 rounded-full border border-border">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DonorSpotlightPage;
