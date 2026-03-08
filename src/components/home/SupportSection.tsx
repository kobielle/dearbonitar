import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SupportSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-3xl mx-auto text-center bg-gradient-hero rounded-3xl p-12 md:p-16 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="absolute inset-0 opacity-10">
            {[...Array(6)].map((_, i) => (
              <Heart
                key={i}
                className="absolute text-primary-foreground animate-float"
                style={{
                  left: `${15 + i * 15}%`,
                  top: `${10 + (i % 3) * 30}%`,
                  animationDelay: `${i * 0.5}s`,
                  width: `${20 + i * 5}px`,
                  height: `${20 + i * 5}px`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <Heart className="h-12 w-12 text-primary-foreground mx-auto mb-6 fill-current opacity-80" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Support the Movement
            </h2>
            <p className="font-body text-primary-foreground/80 mb-8 max-w-lg mx-auto leading-relaxed">
              Your support helps keep Dear Bonitar running and allows kindness to reach more people.
            </p>
            <Button variant="gold" size="xl" asChild>
              <Link to="/support">
                <Heart className="h-5 w-5" />
                Donate Now
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SupportSection;
