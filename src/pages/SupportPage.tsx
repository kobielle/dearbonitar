import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const amounts = [500, 1000, 2000, 5000, 10000];

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Heart className="h-12 w-12 text-primary mx-auto mb-4 fill-current" />
            <h1 className="font-display text-4xl font-bold text-foreground mb-3">Support the Movement</h1>
            <p className="font-body text-muted-foreground max-w-md mx-auto">
              Your support helps keep Dear Bonitar running and allows kindness to reach more people.
            </p>
          </motion.div>

          <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
            <h2 className="font-display text-lg font-semibold text-foreground mb-6 text-center">Choose an Amount (₦)</h2>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {amounts.map((amount) => (
                <button
                  key={amount}
                  className="py-3 rounded-xl text-sm font-body font-semibold border-2 border-border hover:border-primary hover:text-primary transition-colors text-foreground"
                >
                  ₦{amount.toLocaleString()}
                </button>
              ))}
              <button className="py-3 rounded-xl text-sm font-body font-semibold border-2 border-border hover:border-primary hover:text-primary transition-colors text-muted-foreground">
                Custom
              </button>
            </div>

            <Button variant="hero" size="xl" className="w-full mb-4">
              <Heart className="h-5 w-5" />
              Donate Now
            </Button>

            <p className="text-center text-xs font-body text-muted-foreground">
              Secured via Paystack / Flutterwave. Donation amounts are never displayed publicly.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { value: "₦2.5M+", label: "Total Raised" },
              { value: "850+", label: "Supporters" },
              { value: "100%", label: "Goes to Platform" },
            ].map((stat) => (
              <div key={stat.label} className="bg-accent rounded-xl p-4">
                <p className="font-display text-xl font-bold text-primary">{stat.value}</p>
                <p className="font-body text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SupportPage;
