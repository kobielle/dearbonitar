import { Heart, Gift, Star, MapPin, Instagram, Twitter, Youtube, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const DonorProfilePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-card">
            <div className="bg-gradient-hero h-32" />
            <div className="px-8 pb-8 -mt-12">
              <div className="flex items-end gap-4 mb-6">
                <div className="w-24 h-24 rounded-2xl bg-coral-light border-4 border-card flex items-center justify-center text-4xl">
                  🤲
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl font-bold text-foreground">@KindnessWarrior</h1>
                    <span className="text-lg" title="Heart Badge">❤️</span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground">Bonitar since March 2025</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Gift, label: "Donated", value: "47" },
                  { icon: Heart, label: "Received", value: "2" },
                  { icon: Star, label: "Rating", value: "5.0" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-accent rounded-xl p-4 text-center">
                    <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="font-body text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mb-8">
                <h2 className="font-display text-lg font-semibold text-foreground mb-3">Categories Donated</h2>
                <div className="flex flex-wrap gap-2">
                  {["Electronics", "Books", "Clothing", "Kitchen items", "Furniture"].map((cat) => (
                    <span key={cat} className="text-xs font-body bg-coral-light text-primary px-3 py-1 rounded-full">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="font-display text-lg font-semibold text-foreground mb-3">Social Links</h2>
                <div className="flex gap-3">
                  {[Instagram, Twitter, Youtube, Linkedin].map((Icon, i) => (
                    <button key={i} className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-display text-lg font-semibold text-foreground mb-3">Recent Donations</h2>
                <div className="space-y-3">
                  {[
                    { title: "Children's Books Bundle", category: "Books", date: "Mar 5, 2026" },
                    { title: "Winter Jackets (M/L)", category: "Clothing", date: "Mar 2, 2026" },
                    { title: "Kitchen Blender", category: "Kitchen items", date: "Feb 28, 2026" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-accent">
                      <div>
                        <p className="font-body text-sm font-medium text-foreground">{item.title}</p>
                        <p className="font-body text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <span className="font-body text-xs text-muted-foreground">{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DonorProfilePage;
