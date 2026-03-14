import { motion } from "framer-motion";
import { Gift, Search, MessageCircle, Heart } from "lucide-react";

const steps = [
  {
    icon: Gift,
    title: "Post What You Have",
    description: "Snap photos, add a description, and list items you no longer need.",
  },
  {
    icon: Search,
    title: "Browse Nearby",
    description: "Find items available in your community using location-based search.",
  },
  {
    icon: MessageCircle,
    title: "Connect Safely",
    description: "Chat with Bonitars or recipients through our secure messaging system.",
  },
  {
    icon: Heart,
    title: "Share the Kindness",
    description: "Arrange pickup at a public location and make someone's day brighter.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-gradient-warm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          <p className="font-body text-muted-foreground max-w-md mx-auto">
            Giving and receiving kindness in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="relative text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-coral-light flex items-center justify-center mx-auto mb-5 group-hover:shadow-soft transition-shadow">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 font-display text-6xl font-bold text-primary/5">
                {i + 1}
              </span>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
