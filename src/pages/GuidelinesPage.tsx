import { Shield, Heart, AlertTriangle, MessageCircle, Gift, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const GuidelinesPage = () => {
  const guidelines = [
    {
      icon: Heart,
      title: "Be Kind & Respectful",
      description: "Treat every Bonitar with dignity. We're a community built on kindness. No bullying, harassment, or hate speech.",
    },
    {
      icon: Gift,
      title: "Donate Quality Items",
      description: "Only donate items that are usable and in reasonable condition. Prohibited: sand, rags, trash, poop, dangerous materials, broken unusable items.",
    },
    {
      icon: Shield,
      title: "Protect Your Privacy",
      description: "Never share personal contact info publicly. Use our chat system for private communication. Meet at public locations only.",
    },
    {
      icon: MessageCircle,
      title: "Communicate Honestly",
      description: "Be truthful in descriptions. Don't mislead about item condition. Respond to messages promptly and respectfully.",
    },
    {
      icon: AlertTriangle,
      title: "Report Violations",
      description: "1st report: warning. 2nd report (different user): 7-day restriction. 3rd report: permanent deletion. We take community safety seriously.",
    },
    {
      icon: Users,
      title: "Fair Usage",
      description: "Recipients can receive a maximum of 3 items every 61 days. This ensures fair access for everyone in the community.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl font-bold text-foreground mb-3">Community Guidelines</h1>
            <p className="font-body text-muted-foreground">
              Our shared values that keep Dear Bonitar safe, warm, and community-driven
            </p>
          </div>

          <div className="space-y-6">
            {guidelines.map((g, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6 flex gap-5">
                <div className="w-12 h-12 rounded-xl bg-coral-light flex items-center justify-center shrink-0">
                  <g.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{g.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{g.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-coral-light rounded-2xl p-8 text-center">
            <Heart className="h-8 w-8 text-primary mx-auto mb-3 fill-current" />
            <p className="font-display text-xl font-semibold text-foreground mb-2">
              Kindness quietly reshapes the world.
            </p>
            <p className="font-body text-sm text-muted-foreground">
              Thank you for being part of the Dear Bonitar community.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GuidelinesPage;
