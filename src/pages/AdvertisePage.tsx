import { motion } from "framer-motion";
import { Megaphone, CheckCircle, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AdvertisePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Megaphone className="h-12 w-12 text-secondary mx-auto mb-4" />
            <h1 className="font-display text-4xl font-bold text-foreground mb-3">Advertise on Dear Bonitar</h1>
            <p className="font-body text-muted-foreground max-w-md mx-auto">
              Reach a community of kind, engaged people. We only accept ethical, helpful ads.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { label: "Education & Scholarships", icon: "🎓" },
              { label: "Jobs & Careers", icon: "💼" },
              { label: "Startups & Funding", icon: "🚀" },
            ].map((cat) => (
              <div key={cat.label} className="bg-card rounded-xl border border-border p-5 text-center">
                <span className="text-3xl mb-3 block">{cat.icon}</span>
                <p className="font-body text-sm font-medium text-foreground">{cat.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
            <h2 className="font-display text-xl font-semibold text-foreground mb-6">Submit Your Ad</h2>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Business Name</label>
                <Input placeholder="Your company name" className="font-body" />
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Ad Category</label>
                <Input placeholder="Education, Jobs, Startups, Banking, Useful Products..." className="font-body" />
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Website URL</label>
                <Input placeholder="https://..." className="font-body" />
              </div>
              <div>
                <label className="text-sm font-body font-medium text-foreground mb-1.5 block">Description</label>
                <textarea className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm font-body placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" placeholder="Tell us about your ad..." />
              </div>

              <div className="bg-accent rounded-lg p-3 flex items-start gap-3">
                <BadgeCheck className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                <p className="text-xs font-body text-muted-foreground">
                  All ads are reviewed before publishing. We only accept ethical ads that benefit our community.
                </p>
              </div>

              <Button variant="gold" size="lg" className="w-full">Submit Ad for Review</Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdvertisePage;
