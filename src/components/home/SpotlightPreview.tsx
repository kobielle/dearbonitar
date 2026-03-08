import { motion } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SpotlightPreview = () => {
  return (
    <section className="py-20 bg-accent">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 text-secondary font-body text-sm font-medium mb-3">
              <Star className="h-4 w-4 fill-current" />
              Bonitar Spotlight
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              This Week's Outstanding Bonitar
            </h2>
          </motion.div>

          <motion.div
            className="bg-card rounded-2xl p-8 md:p-12 shadow-card border border-border"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 rounded-full bg-coral-light flex items-center justify-center text-4xl shrink-0">
                ❤️
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="font-display text-2xl font-bold text-foreground mb-1">
                  @KindnessWarrior
                </h3>
                <p className="font-body text-sm text-primary font-medium mb-3">
                  Heart Badge Holder • 47 Items Donated
                </p>
                <p className="font-body text-muted-foreground leading-relaxed mb-6">
                  "I started giving away things I no longer needed, and it became my favorite thing to do. 
                  Every item I donate is one less burden for me and one more blessing for someone else."
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  {["Electronics", "Books", "Clothing", "Kitchen items"].map((cat) => (
                    <span key={cat} className="text-xs font-body bg-accent text-accent-foreground px-3 py-1 rounded-full border border-border">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="text-center mt-8">
            <Button variant="ghost" className="text-primary" asChild>
              <Link to="/spotlight">
                See all spotlights
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpotlightPreview;
